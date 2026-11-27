import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import type { FieldValues, Resolver } from 'react-hook-form'
import { createFieldValidation, createFormResolver } from './validation'
import { validateSchema } from './standard-schema'
import type { AnyZodSchema, InputFieldOptions } from '../form-types'

type FieldValidator = (value: unknown, formValues?: FieldValues) => Promise<true | string>

/** The single `validate` function `createFieldValidation` installs for a `schema:`. */
function schemaValidator(options: InputFieldOptions): FieldValidator {
  const rules = createFieldValidation(options, false)
  expect(typeof rules.validate).toBe('function')
  return rules.validate as unknown as FieldValidator
}

async function resolve(
  resolver: Resolver<FieldValues> | undefined,
  values: FieldValues,
): Promise<Record<string, { type?: string; message?: string }>> {
  expect(resolver).toBeTypeOf('function')
  const result = await (resolver as Resolver<FieldValues>)(values, undefined, {
    fields: {},
    shouldUseNativeValidation: false,
  })
  return result.errors as Record<string, { type?: string; message?: string }>
}

/** A schema that rejects with an error carrying no issues at all. */
const issuelessSchema = {
  parseAsync: async () => {
    throw Object.assign(new Error('nothing to report'), { issues: [] })
  },
} as unknown as AnyZodSchema

/** A schema that is simply broken — it throws rather than rejecting a value. */
const throwingSchema = {
  parseAsync: async () => {
    throw new TypeError('schema blew up')
  },
} as unknown as AnyZodSchema

// Guards the cross-major gate itself. `pnpm test:zod3` re-runs this suite with
// `zod` aliased to the zod 3 install; if that alias ever stops resolving, the
// run would quietly re-test zod 4 and still report a pass.
describe('the zod major under test', () => {
  it('is the one NESTLED_ZOD_ALIAS asks for', () => {
    // Only zod 4 schemas carry `_zod`; zod 3's carry `_def.typeName`.
    const schema = z.string() as unknown as { _zod?: unknown; _def?: { typeName?: unknown } }
    const major = schema._zod !== undefined ? 4 : schema._def?.typeName !== undefined ? 3 : 0

    expect(major).toBe(process.env['NESTLED_ZOD_ALIAS'] === 'zod-v3' ? 3 : 4)
  })
})

describe('createFieldValidation with a schema', () => {
  it('surfaces the first issue message from the schema', async () => {
    const validate = schemaValidator({ schema: z.string().min(8, 'Too short, sorry') })

    await expect(validate('abc')).resolves.toBe('Too short, sorry')
    await expect(validate('long enough')).resolves.toBe(true)
  })

  // Reading `issues[0]` is the cross-major spelling: zod 4 renamed `.errors`,
  // and `instanceof ZodError` fails outright across duplicate zod copies.
  it('reads the issue code so an errorMessages override can replace the message', async () => {
    const validate = schemaValidator({
      schema: z.string().min(8),
      errorMessages: { too_small: 'Password is too weak! Use at least 8 characters.' },
    })

    await expect(validate('abc')).resolves.toBe('Password is too weak! Use at least 8 characters.')
  })

  it('falls back to the schema message when an override is an empty string', async () => {
    const validate = schemaValidator({
      schema: z.string().min(8, 'Too short, sorry'),
      errorMessages: { too_small: '' },
    })

    // `||`, not `??`: an empty override used to render a blank error here while
    // the resolver path showed the schema's own message.
    await expect(validate('abc')).resolves.toBe('Too short, sorry')
  })

  it('fails the field when the schema itself throws', async () => {
    await expect(schemaValidator({ schema: throwingSchema })('anything')).resolves.toBe('schema blew up')
  })

  it('fails the field rather than crashing on an error with no issues', async () => {
    // `issues[0].code` was read unguarded, so this threw out of validation
    // instead of reporting an invalid field.
    await expect(schemaValidator({ schema: issuelessSchema })('anything')).resolves.toBe('Invalid value')
  })
})

describe('createFormResolver field-level schema validation', () => {
  const field = (options: InputFieldOptions) => [{ key: 'password', options }]

  it('reports the first issue message under the field key', async () => {
    const errors = await resolve(
      createFormResolver(undefined, field({ schema: z.string().min(8, 'Too short, sorry') })),
      { password: 'abc' },
    )

    expect(errors.password?.message).toBe('Too short, sorry')
    expect(errors.password?.type).toBe('too_small')
  })

  it('applies an errorMessages override keyed by the issue code', async () => {
    const errors = await resolve(
      createFormResolver(
        undefined,
        field({ schema: z.string().min(8), errorMessages: { too_small: 'Use 8 characters or more.' } }),
      ),
      { password: 'abc' },
    )

    expect(errors.password?.message).toBe('Use 8 characters or more.')
  })

  it('passes a valid value through with no errors', async () => {
    const errors = await resolve(
      createFormResolver(undefined, field({ schema: z.string().min(8, 'Too short, sorry') })),
      { password: 'long enough' },
    )

    expect(errors).toEqual({})
  })

  it('fails the field when the schema throws', async () => {
    const errors = await resolve(createFormResolver(undefined, field({ schema: throwingSchema })), {
      password: 'abc',
    })

    expect(errors.password).toEqual({ type: 'schema', message: 'schema blew up' })
  })

  it('does not crash on an error with an empty issues array', async () => {
    const errors = await resolve(createFormResolver(undefined, field({ schema: issuelessSchema })), {
      password: 'abc',
    })

    expect(errors.password?.message).toBe('Invalid value')
  })

  it('still reports required before running the schema', async () => {
    const errors = await resolve(createFormResolver(undefined, field({ required: true, schema: z.string().min(8) })), {
      password: '',
    })

    expect(errors.password?.type).toBe('required')
  })

  it('runs a form-level schema through the resolver', async () => {
    const schema = z.object({ password: z.string().min(8, 'Too short, sorry') })
    const errors = await resolve(createFormResolver(schema), { password: 'abc' })

    expect(errors.password?.message).toBe('Too short, sorry')
  })

  it('returns undefined when nothing declares validation', () => {
    expect(createFormResolver(undefined, field({}))).toBeUndefined()
  })
})


// Zod's own `~standard.validate` parses synchronously first and starts over
// asynchronously when it meets an async refinement, which calls the
// refinement twice. An async refinement is often a request ("is this username
// taken?"), so every path must call it exactly once per validation.
describe('async refinements run once per validation', () => {
  function countingSchema() {
    const counter = { calls: 0 }
    const schema = z.string().refine(async (value) => {
      counter.calls++
      return value === 'free'
    }, 'Taken')
    return { schema, counter }
  }

  /** Calls the resolver the way react-hook-form does, with the registered fields. */
  async function resolveRegistered(
    resolver: Resolver<FieldValues> | undefined,
    values: FieldValues,
    fields: Record<string, unknown>,
  ) {
    expect(resolver).toBeTypeOf('function')
    const result = await (resolver as Resolver<FieldValues>)(values, undefined, {
      fields: fields as never,
      names: Object.keys(fields) as never,
      shouldUseNativeValidation: false,
    })
    return result.errors as Record<string, { type?: string; message?: string }>
  }

  it('in validateSchema', async () => {
    const { schema, counter } = countingSchema()

    for (let i = 1; i <= 3; i++) {
      await expect(validateSchema(schema, 'taken')).resolves.toEqual({
        issues: [expect.objectContaining({ message: 'Taken', code: 'custom' })],
      })
      expect(counter.calls).toBe(i)
    }
    await expect(validateSchema(schema, 'free')).resolves.toEqual({ value: 'free' })
    expect(counter.calls).toBe(4)
  })

  it('in a field-level register rule', async () => {
    const { schema, counter } = countingSchema()
    const validate = schemaValidator({ schema })

    await expect(validate('taken')).resolves.toBe('Taken')
    await expect(validate('free')).resolves.toBe(true)
    expect(counter.calls).toBe(2)
  })

  it('in a form-level schema', async () => {
    const { schema, counter } = countingSchema()
    const errors = await resolve(createFormResolver(z.object({ username: schema })), { username: 'taken' })

    expect(errors.username?.message).toBe('Taken')
    expect(counter.calls).toBe(1)
  })

  it.each([
    ['a top-level key', 'username', undefined],
    ['a nested key', 'account.username', undefined],
    ['a field in the active validation group', 'username', 'step-1'],
  ])('in a resolver pass with the field registered, on %s', async (_label, key, group) => {
    const { schema, counter } = countingSchema()
    const options: InputFieldOptions = { schema, ...(group ? { validationGroup: group } : {}) }
    const rules = createFieldValidation(options, false)
    const resolver = createFormResolver(undefined, [{ key, options }], group)
    const registered: Record<string, unknown> = {}
    const leaf = { name: key, ref: {}, validate: rules.validate }
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      registered[parent] = { [child]: leaf }
    } else {
      registered[key] = leaf
    }
    const values = key.includes('.') ? { account: { username: 'free' } } : { username: 'free' }

    await expect(resolveRegistered(resolver, values, registered)).resolves.toEqual({})
    expect(counter.calls).toBe(1)
  })

  it('still runs a registered rule that adds more than the schema', async () => {
    const { schema, counter } = countingSchema()
    const options: InputFieldOptions = { schema }
    // What the phone field registers: the schema plus its own format check
    const rules = createFieldValidation({ ...options, validate: () => 'Bad phone' }, false)
    const resolver = createFormResolver(undefined, [{ key: 'phone', options }])

    const errors = await resolveRegistered(resolver, { phone: 'free' }, {
      phone: { name: 'phone', ref: {}, validate: rules.validate },
    })

    expect(errors.phone?.message).toBe('Bad phone')
    // Once in the field pass, once inside the combined registered rule
    expect(counter.calls).toBe(2)
  })
})
