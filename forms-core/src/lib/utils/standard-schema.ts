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
 * Validates a value against a schema. A Zod schema (any release) goes through
 * its own `safeParseAsync`; any other schema through the Standard Schema
 * interface, else `parseAsync`. Never throws: a schema that throws, or that
 * has none of those, fails the value with a single issue — a broken schema
 * must not pass a value as valid.
 *
 * Zod is not validated through `~standard.validate`: Zod's implementation of
 * it parses synchronously first and starts over asynchronously when it meets
 * an async refinement, so every async refinement (a "username taken" request,
 * say) would run twice per validation — on every call in Zod 4, on the first
 * call per schema in Zod 3. `safeParseAsync` runs each refinement once.
 */
export async function validateSchema(schema: FormSchema, value: unknown): Promise<SchemaValidationResult> {
  try {
    const standard = (schema as Partial<StandardSchemaV1> | null | undefined)?.['~standard']
    const legacy = schema as Partial<LegacyZodSchema> | null | undefined
    const isZod = !standard || standard.vendor === 'zod'

    // Zod 3 before 3.24 has no `~standard` at all; later Zod releases say so
    // in `vendor`
    if (isZod && legacy && typeof legacy.safeParseAsync === 'function') {
      const result = await legacy.safeParseAsync(value)
      return result.success ? { value: result.data } : failure(result.error.issues)
    }

    if (standard && typeof standard.validate === 'function') {
      // validate() may return synchronously or a promise; await covers both
      const result = await standard.validate(value)
      return result.issues ? failure(result.issues) : { value: result.value }
    }

    // A schema exposing only `parseAsync` rejects by throwing. An error that
    // carries an `issues` array is a rejection of the value — read structurally,
    // never with `instanceof ZodError`, which fails across two copies of zod and
    // across majors. Anything else is the schema itself breaking.
    const parser = schema as { parseAsync?: (value: unknown) => Promise<unknown> } | null | undefined
    if (parser && typeof parser.parseAsync === 'function') {
      try {
        return { value: await parser.parseAsync(value) }
      } catch (error) {
        const issues = (error as { issues?: unknown } | null | undefined)?.issues
        if (Array.isArray(issues)) return failure(issues as StandardSchemaV1Issue[])
        throw error
      }
    }

    return failure([])
  } catch (error) {
    return {
      issues: [
        {
          message: error instanceof Error && error.message ? error.message : FALLBACK_MESSAGE,
          path: [],
          code: 'schema',
        },
      ],
    }
  }
}

/**
 * A react-hook-form resolver for any schema `schema` accepts.
 *
 * On success the validated output becomes the form values. On failure the
 * first issue for each path is reported at that path (`address.city` for
 * `['address', 'city']`) as `{ type, message }`, where `type` is the
 * validator's issue code when it has one and `'validation'` otherwise.
 *
 * An issue on an array itself (`items`, next to item issues such as
 * `items.0.name`) is reported at `items.root`, where react-hook-form's field
 * arrays read it, so it never hides or is hidden by the item errors.
 *
 * An issue with no path (a whole-object refinement without `path`, or a
 * schema that throws) is reported under `FORM_ERROR_KEY`, the empty key. It
 * blocks the submit. It can't go on `root`: react-hook-form reserves that
 * key and clears it before deciding whether to submit.
 */
export function standardSchemaResolver<TFieldValues extends FieldValues = FieldValues>(
  schema: FormSchema,
): Resolver<TFieldValues> {
  return (async (
    values: TFieldValues,
    _context: unknown,
    options?: { fields?: Record<string, unknown>; names?: string[] },
  ) => {
    const result = await validateSchema(schema, values)
    if (!('issues' in result)) {
      return { values: result.value, errors: {} }
    }

    // First issue per exact path; a parent path and its children are
    // different paths and both are kept
    const firstByPath = new Map<string, SchemaIssue>()
    for (const issue of result.issues) {
      const name = issue.path.join('.')
      if (!firstByPath.has(name)) firstByPath.set(name, issue)
    }

    const knownNames = [...firstByPath.keys(), ...(options?.names ?? [])]
    const errors: Record<string, unknown> = {}
    for (const [name, issue] of firstByPath) {
      // A registered field carries its dotted name as a string; a container
      // of fields (which may have a child called `ref`) does not
      const registered = get(options?.fields, name) as { name?: unknown; ref?: unknown } | undefined
      const ref = typeof registered?.name === 'string' ? registered.ref : undefined
      const error = {
        type: issue.code ?? 'validation',
        message: issue.message,
        ...(ref ? { ref } : {}),
      }

      if (name === '') {
        errors[FORM_ERROR_KEY] = error
      } else if (hasIndexedChild(knownNames, name)) {
        // Array-level issue: keep it beside the item errors, whichever came first
        set(errors, `${name}.root`, error)
      } else {
        // Keep any child errors already written under this path
        const existing = get(errors, name) as Record<string, unknown> | undefined
        set(errors, name, existing ? { ...existing, ...error } : error)
      }
    }
    return { values: {}, errors }
  }) as unknown as Resolver<TFieldValues>
}

/**
 * Where `standardSchemaResolver` reports an issue that has no path:
 * `formState.errors[FORM_ERROR_KEY]`. The empty key, as `@hookform/resolvers`
 * used; `root` is reserved by react-hook-form.
 */
export const FORM_ERROR_KEY = ''

/** True when some name is an indexed child of `name` (`items.0`, `items.0.title`). */
function hasIndexedChild(names: string[], name: string): boolean {
  const prefix = `${name}.`
  return names.some((candidate) => candidate.startsWith(prefix) && /^\d+(\.|$)/.test(candidate.slice(prefix.length)))
}
