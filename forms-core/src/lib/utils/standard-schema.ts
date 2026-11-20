import { FieldValues, Resolver, get, set } from 'react-hook-form'

/**
 * The Standard Schema v1 interface (https://standardschema.dev), copied inline
 * as the spec permits, so the published types don't need another dependency.
 * Zod (3.24+), Valibot, ArkType and others implement it.
 */
export interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly '~standard': StandardSchemaV1Props<Input, Output>
}

export interface StandardSchemaV1Props<Input = unknown, Output = Input> {
  readonly version: 1
  readonly vendor: string
  readonly validate: (value: unknown) => StandardSchemaV1Result<Output> | Promise<StandardSchemaV1Result<Output>>
  readonly types?: { readonly input: Input; readonly output: Output } | undefined
}

export type StandardSchemaV1Result<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardSchemaV1Issue> }

export interface StandardSchemaV1Issue {
  readonly message: string
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }> | undefined
}

/**
 * A Zod 3 schema older than 3.24, which has no `~standard` property. Described
 * structurally so the packages don't depend on Zod's own types for it.
 */
export interface LegacyZodSchema {
  safeParseAsync(value: unknown): Promise<
    | { success: true; data: unknown }
    | {
        success: false
        error: {
          issues: ReadonlyArray<{ message: string; path: ReadonlyArray<PropertyKey>; code?: string }>
        }
      }
  >
}

/**
 * What `schema` accepts on a field and on `<Form>`: any Standard Schema v1
 * validator (Zod, Valibot, ArkType, …) or an older Zod 3 schema.
 */
export type FormSchema = StandardSchemaV1 | LegacyZodSchema

/** A validation issue in one shape, whichever validator produced it. */
export interface SchemaIssue {
  message: string
  /** Path to the failing value; empty for an issue on the value itself. */
  path: string[]
  /** The validator's issue code when it provides one (Zod does). */
  code?: string
}

export type SchemaValidationResult = { value: unknown } | { issues: SchemaIssue[] }

const FALLBACK_MESSAGE = 'Invalid value'

function normalizeIssue(issue: StandardSchemaV1Issue): SchemaIssue {
  const path = (issue.path ?? []).map((segment) =>
    String(typeof segment === 'object' && segment !== null ? segment.key : segment),
  )
  const code = (issue as { code?: unknown }).code
  return {
    message: typeof issue.message === 'string' ? issue.message : FALLBACK_MESSAGE,
    path,
    ...(typeof code === 'string' ? { code } : {}),
  }
}

function failure(issues: ReadonlyArray<StandardSchemaV1Issue>): SchemaValidationResult {
  // "Failed with no issues" is still a failure
  if (!issues.length) return { issues: [{ message: FALLBACK_MESSAGE, path: [], code: 'schema' }] }
  return { issues: issues.map(normalizeIssue) }
}

/**
 * Validates a value against a schema. Uses the Standard Schema interface when
 * the schema has one, else Zod 3's `safeParseAsync`. Never throws: a schema
 * that throws, or that has neither interface, fails the value with a single
 * issue — a broken schema must not pass a value as valid.
 */
export async function validateSchema(schema: FormSchema, value: unknown): Promise<SchemaValidationResult> {
  try {
    const standard = (schema as Partial<StandardSchemaV1> | null | undefined)?.['~standard']
    if (standard && typeof standard.validate === 'function') {
      // validate() may return synchronously or a promise; await covers both
      const result = await standard.validate(value)
      return result.issues ? failure(result.issues) : { value: result.value }
    }

    const legacy = schema as Partial<LegacyZodSchema> | null | undefined
    if (legacy && typeof legacy.safeParseAsync === 'function') {
      const result = await legacy.safeParseAsync(value)
      return result.success ? { value: result.data } : failure(result.error.issues)
    }

    return failure([])
  } catch (error) {
    return {
      issues: [{ message: error instanceof Error ? error.message : FALLBACK_MESSAGE, path: [], code: 'schema' }],
    }
  }
}

/**
 * A react-hook-form resolver for any schema `schema` accepts.
 *
 * On success the validated output becomes the form values. On failure the
 * first issue for each path is reported at that path (`address.city` for
 * `['address', 'city']`) as `{ type, message }`, where `type` is the
 * validator's issue code when it has one and `'validation'` otherwise. An
 * issue with no path is reported on `root`.
 */
export function standardSchemaResolver<TFieldValues extends FieldValues = FieldValues>(
  schema: FormSchema,
): Resolver<TFieldValues> {
  return (async (values: TFieldValues, _context: unknown, options?: { fields?: Record<string, unknown> }) => {
    const result = await validateSchema(schema, values)
    if (!('issues' in result)) {
      return { values: result.value, errors: {} }
    }

    const errors: Record<string, unknown> = {}
    for (const issue of result.issues) {
      const name = issue.path.length ? issue.path.join('.') : 'root'
      if (get(errors, name)) continue
      const ref = (get(options?.fields, name) as { ref?: unknown } | undefined)?.ref
      set(errors, name, {
        type: issue.code ?? 'validation',
        message: issue.message,
        ...(ref ? { ref } : {}),
      })
    }
    return { values: {}, errors }
  }) as unknown as Resolver<TFieldValues>
}
