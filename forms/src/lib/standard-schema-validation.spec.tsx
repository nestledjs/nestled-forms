import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { z } from 'zod'
import { z as z4 } from 'zod/v4'
import * as v from 'valibot'
import { type } from 'arktype'
import { Form } from './form'
import {
  FormFieldClass,
  createFieldValidation,
  createFormResolver,
  standardSchemaResolver,
  validateSchema,
  type FormSchema,
  type InferSchemaType,
  type StandardSchemaV1,
} from '@nestledjs/forms-core'

const resolverOptions = { fields: {}, shouldUseNativeValidation: false } as any

const submitButton = () => FormFieldClass.button('go', { text: 'Submit', type: 'submit' })
const clickSubmit = () => fireEvent.click(screen.getByRole('button', { name: /submit/i }))
const typeInto = (label: RegExp, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

/** A Zod 3 schema from before 3.24: `safeParseAsync` only, no `~standard`. */
function legacyZodSchema(minLength: number): FormSchema {
  return {
    async safeParseAsync(value: unknown) {
      if (typeof value === 'string' && value.length >= minLength) {
        return { success: true as const, data: value }
      }
      return {
        success: false as const,
        error: {
          issues: [
            { code: 'too_small', message: `At least ${minLength} characters`, path: [] },
            { code: 'custom', message: 'Second issue', path: [] },
          ],
        },
      }
    },
  }
}

/** A hand-written Standard Schema whose validate() returns synchronously. */
function syncSchema(validate: StandardSchemaV1['~standard']['validate']): StandardSchemaV1 {
  return { '~standard': { version: 1, vendor: 'example', validate } }
}

describe('field-level schema from any Standard Schema validator', () => {
  it('validates a field with a Valibot schema', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="valibot-field"
        submit={submit}
        fields={[
          FormFieldClass.text('username', {
            label: 'Username',
            schema: v.pipe(v.string(), v.minLength(3, 'At least 3 characters')),
          }),
          submitButton(),
        ]}
      />,
    )

    typeInto(/username/i, 'ab')
    clickSubmit()
    await waitFor(() => expect(screen.getByText('At least 3 characters')).toBeInTheDocument())
    expect(submit).not.toHaveBeenCalled()

    typeInto(/username/i, 'abc')
    clickSubmit()
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0]).toEqual({ username: 'abc' })
  })

  it('validates a field with an ArkType schema', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="arktype-field"
        submit={submit}
        fields={[FormFieldClass.text('username', { label: 'Username', schema: type('string >= 3') }), submitButton()]}
      />,
    )

    typeInto(/username/i, 'ab')
    clickSubmit()
    await waitFor(() => expect(screen.getByText(/at least length 3/i)).toBeInTheDocument())
    expect(submit).not.toHaveBeenCalled()

    typeInto(/username/i, 'abc')
    clickSubmit()
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
  })

  it('still overrides a Zod message by issue code through errorMessages', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="zod-field"
        submit={submit}
        fields={[
          FormFieldClass.text('username', {
            label: 'Username',
            schema: z.string().min(3),
            errorMessages: { too_small: 'Usernames are at least 3 characters' },
          }),
          submitButton(),
        ]}
      />,
    )

    typeInto(/username/i, 'ab')
    clickSubmit()
    await waitFor(() => expect(screen.getByText('Usernames are at least 3 characters')).toBeInTheDocument())
    expect(submit).not.toHaveBeenCalled()
  })

  it('validates with an older Zod 3 schema that has no ~standard property', async () => {
    const resolver = createFormResolver(undefined, [
      { key: 'plain', options: { schema: legacyZodSchema(3) } },
      { key: 'overridden', options: { schema: legacyZodSchema(3), errorMessages: { too_small: 'Too short!' } } },
      { key: 'fine', options: { schema: legacyZodSchema(3) } },
    ])!
    const result = await resolver({ plain: 'ab', overridden: 'ab', fine: 'abc' }, undefined, resolverOptions)

    // First issue only, typed by its code
    expect(result.errors).toEqual({
      plain: { type: 'too_small', message: 'At least 3 characters' },
      overridden: { type: 'too_small', message: 'Too short!' },
    })
  })

  it('accepts a schema whose validate() returns synchronously', async () => {
    const schema = syncSchema((value) =>
      value === 'ok' ? { value } : { issues: [{ message: 'Must be ok', path: [] }] },
    )
    const resolver = createFormResolver(undefined, [{ key: 'a', options: { schema } }])!

    expect((await resolver({ a: 'no' }, undefined, resolverOptions)).errors).toEqual({
      a: { type: 'validation', message: 'Must be ok' },
    })
    expect((await resolver({ a: 'ok' }, undefined, resolverOptions)).errors).toEqual({})
  })

  it('fails the field, with the thrown message, when the schema throws', async () => {
    const throwing = syncSchema(() => {
      throw new Error('Schema exploded')
    })
    const resolver = createFormResolver(undefined, [{ key: 'a', options: { schema: throwing } }])!
    expect((await resolver({ a: 'x' }, undefined, resolverOptions)).errors).toEqual({
      a: { type: 'schema', message: 'Schema exploded' },
    })
  })

  it('never passes a value through something that is not a schema', async () => {
    expect(await validateSchema({} as FormSchema, 'x')).toEqual({
      issues: [{ message: 'Invalid value', path: [], code: 'schema' }],
    })
    expect(await validateSchema(undefined as unknown as FormSchema, 'x')).toHaveProperty('issues')
    // "Failed with no issues" and a non-Error throw are still failures
    expect(
      await validateSchema(
        syncSchema(() => ({ issues: [] })),
        'x',
      ),
    ).toHaveProperty('issues.0.message', 'Invalid value')
    expect(
      await validateSchema(
        syncSchema(() => {
          throw 'nope'
        }),
        'x',
      ),
    ).toHaveProperty('issues.0.message', 'Invalid value')
  })

  it('builds register-time rules from any schema (RenderFormField without <Form>)', async () => {
    const valibotRules = createFieldValidation({ schema: v.pipe(v.string(), v.minLength(3, 'Too short')) }, false)
    const validate = valibotRules.validate as (value: unknown) => Promise<true | string>
    expect(await validate('ab')).toBe('Too short')
    expect(await validate('abc')).toBe(true)

    const zodRules = createFieldValidation({ schema: z.string().min(3), errorMessages: { too_small: 'Custom' } }, false)
    expect(await (zodRules.validate as (value: unknown) => Promise<true | string>)('ab')).toBe('Custom')
  })
})

describe('form-level schema from any Standard Schema validator', () => {
  const signup = v.pipe(
    v.object({
      password: v.pipe(v.string(), v.minLength(4, 'Password is too short')),
      confirmPassword: v.string(),
      address: v.object({ city: v.pipe(v.string(), v.minLength(1, 'City is required')) }),
    }),
    v.forward(
      v.partialCheck(
        [['password'], ['confirmPassword']],
        (input) => input.password === input.confirmPassword,
        'Passwords must match',
      ),
      ['confirmPassword'],
    ),
  )

  it('reports a nested issue on the nested field and a cross-field issue on the path the schema names', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="valibot-form"
        schema={signup}
        submit={submit}
        defaultValues={{ password: '', confirmPassword: '', address: { city: '' } }}
        fields={[
          FormFieldClass.text('password', { label: 'Password' }),
          FormFieldClass.text('confirmPassword', { label: 'Confirm' }),
          FormFieldClass.text('address.city', { label: 'City' }),
          submitButton(),
        ]}
      />,
    )

    typeInto(/password/i, 'secret')
    typeInto(/confirm/i, 'different')
    clickSubmit()
    await waitFor(() => expect(screen.getByText('Passwords must match')).toBeInTheDocument())
    expect(screen.getByText('City is required')).toBeInTheDocument()
    expect(submit).not.toHaveBeenCalled()

    typeInto(/confirm/i, 'secret')
    typeInto(/city/i, 'Springfield')
    clickSubmit()
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0]).toEqual({
      password: 'secret',
      confirmPassword: 'secret',
      address: { city: 'Springfield' },
    })
  })

  it('submits the schema output, not the raw input', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="valibot-transform"
        schema={v.object({ name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Name is required')) })}
        submit={submit}
        fields={[FormFieldClass.text('name', { label: 'Name' }), submitButton()]}
      />,
    )

    typeInto(/name/i, '  Ada  ')
    clickSubmit()
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0]).toEqual({ name: 'Ada' })
  })

  it('validates with the Zod 4 API from the zod/v4 entry of zod 3.25', async () => {
    const resolver = createFormResolver(z4.object({ email: z4.email('Enter a valid email') }), [
      { key: 'name', options: { schema: z4.string().min(2, 'Too short') } },
    ])!
    const result = await resolver({ email: 'nope', name: 'A' }, undefined, resolverOptions)
    expect(result.errors).toEqual({
      email: { type: 'invalid_format', message: 'Enter a valid email' },
      name: { type: 'too_small', message: 'Too short' },
    })
  })

  it('validates a whole form with an ArkType schema', async () => {
    const resolver = createFormResolver(type({ email: 'string.email', age: 'number >= 18' }))!
    const bad = await resolver({ email: 'nope', age: 12 }, undefined, resolverOptions)
    expect(Object.keys(bad.errors).sort()).toEqual(['age', 'email'])
    // ArkType issues carry a code, like Zod's
    expect((bad.errors as any).age.type).toBe('min')

    const good = await resolver({ email: 'ada@example.com', age: 30 }, undefined, resolverOptions)
    expect(good).toEqual({ values: { email: 'ada@example.com', age: 30 }, errors: {} })
  })

  it('keeps Zod form-level errors in the same shape as before: code as type, first issue per path', async () => {
    const schema = z
      .object({
        name: z
          .string()
          .min(2, 'Too short')
          .regex(/^[a-z]+$/, 'Lowercase only'),
        address: z.object({ city: z.string().min(1, 'City is required') }),
      })
      .refine(() => false, { message: 'Whole form is wrong' })
    const result = await standardSchemaResolver(schema)(
      { name: 'A', address: { city: '' } },
      undefined,
      resolverOptions,
    )

    expect(result.values).toEqual({})
    expect(result.errors).toEqual({
      name: { type: 'too_small', message: 'Too short' },
      address: { city: { type: 'too_small', message: 'City is required' } },
      // An issue with no path is reported on root
      root: { type: 'custom', message: 'Whole form is wrong' },
    })
  })

  it('attaches the registered ref to an error so react-hook-form can focus the field', async () => {
    const ref = { focus: vi.fn() }
    const result = await standardSchemaResolver(z.object({ address: z.object({ city: z.string().min(1) }) }))(
      { address: { city: '' } },
      undefined,
      { fields: { address: { city: { ref, name: 'address.city' } } } } as any,
    )
    expect((result.errors as any).address.city.ref).toBe(ref)
  })

  it('lets a field-level error win over the form-level schema on the same key', async () => {
    const resolver = createFormResolver(
      v.object({ a: v.pipe(v.string(), v.minLength(1, 'A from schema')), b: v.any() }),
      [
        { key: 'a', options: { required: true, errorMessages: { required: 'A from field' } } },
        { key: 'b', options: { required: true } },
      ],
    )!
    const result = await resolver({ a: '', b: '' }, undefined, resolverOptions)
    expect((result.errors as any).a.message).toBe('A from field')
    expect((result.errors as any).b.message).toBe('This field is required')
  })
})

describe('register-time rules in the resolver', () => {
  it('runs a registered validate rule for a nested key', async () => {
    // react-hook-form hands the resolver its fields nested by key
    const fields = {
      address: { phone: { name: 'address.phone', ref: {}, validate: () => 'Bad phone' } },
      plain: { name: 'plain', ref: {}, validate: { format: () => 'Bad plain' } },
    }
    const resolver = createFormResolver(undefined, [{ key: 'other', options: { required: true } }])!
    const result = await resolver({ address: { phone: '123' }, plain: 'x', other: 'y' }, undefined, {
      fields,
      shouldUseNativeValidation: false,
    } as any)

    expect(result.errors).toEqual({
      address: { phone: { type: 'validate', message: 'Bad phone' } },
      plain: { type: 'validate', message: 'Bad plain' },
    })
  })
})

describe('schema types', () => {
  it('accepts Zod, Valibot and ArkType schemas wherever schema is typed', () => {
    const zodSchema = z.object({ name: z.string() })
    const valibotSchema = v.object({ name: v.string() })
    const arkSchema = type({ name: 'string' })

    const accepted: FormSchema[] = [zodSchema, valibotSchema, arkSchema, z.string(), v.string(), type('string')]
    expect(accepted).toHaveLength(6)

    // On a field and on <Form>
    FormFieldClass.text('a', { schema: z.string() })
    FormFieldClass.text('b', { schema: v.string() })
    FormFieldClass.text('c', { schema: type('string') })
    const forms = [
      <Form key="z" id="z" schema={zodSchema} submit={vi.fn()} />,
      <Form key="v" id="v" schema={valibotSchema} submit={vi.fn()} />,
      <Form key="a" id="a" schema={arkSchema} submit={vi.fn()} />,
    ]
    expect(forms).toHaveLength(3)

    expectTypeOf<InferSchemaType<typeof zodSchema>>().toEqualTypeOf<{ name: string }>()
    expectTypeOf<InferSchemaType<typeof valibotSchema>>().toEqualTypeOf<{ name: string }>()
    expectTypeOf<InferSchemaType<typeof arkSchema>>().toEqualTypeOf<{ name: string }>()
    // Older Zod 3: no ~standard, output read from _output
    expectTypeOf<InferSchemaType<{ _output: number }>>().toEqualTypeOf<number>()
    expectTypeOf<InferSchemaType<string>>().toEqualTypeOf<never>()
  })
})
