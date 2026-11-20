import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, expectTypeOf, it, vi } from 'vitest'
import { z } from 'zod'
import { z as z4 } from 'zod/v4'
import * as v from 'valibot'
import { type } from 'arktype'
import { Form } from './form'
import {
  FORM_ERROR_KEY,
  FormFieldClass,
  useFormContext,
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
      // An issue with no path is reported under the empty key, never `root`
      [FORM_ERROR_KEY]: { type: 'custom', message: 'Whole form is wrong' },
    })
    expect(FORM_ERROR_KEY).toBe('')
  })

  it.each([
    [
      'a refinement with no path',
      z.object({ name: z.string() }).refine(() => false, { message: 'Whole form is wrong' }),
    ],
    [
      'a schema that throws',
      syncSchema(() => {
        throw new Error('Schema exploded')
      }),
    ],
  ])('blocks the submit when the only failure is %s', async (_label, schema) => {
    // react-hook-form clears errors.root before deciding whether to submit,
    // so a pathless failure reported there would submit `{}`
    const submit = vi.fn()
    let form: any
    function Capture() {
      form = useFormContext()
      return null
    }
    render(
      <Form
        id="pathless"
        schema={schema}
        submit={submit}
        fields={[FormFieldClass.text('name', { label: 'Name' }), submitButton()]}
      >
        <Capture />
      </Form>,
    )

    typeInto(/name/i, 'Ada')
    clickSubmit()
    await waitFor(() => expect(form.formState.errors[FORM_ERROR_KEY]).toBeTruthy())
    expect(form.formState.isSubmitSuccessful).toBe(false)
    expect(submit).not.toHaveBeenCalled()
  })

  it('keeps an array-level issue beside the item issues, whichever comes first', async () => {
    const itemFirst = syncSchema(() => ({
      issues: [
        { message: 'Name is required', path: ['items', 0, 'name'] },
        { message: 'Add at least two items', path: ['items'] },
        { message: 'Ignored duplicate', path: ['items'] },
      ],
    }))
    const arrayFirst = syncSchema(() => ({
      issues: [
        { message: 'Add at least two items', path: ['items'] },
        { message: 'Name is required', path: ['items', { key: 0 }, 'name'] },
      ],
    }))
    for (const schema of [itemFirst, arrayFirst]) {
      const result = await standardSchemaResolver(schema)({ items: [{ name: '' }] }, undefined, resolverOptions)
      // Read the way react-hook-form reads them: errors.items[0].name and errors.items.root
      const items = (result.errors as any).items
      expect(items[0].name).toEqual({ type: 'validation', message: 'Name is required' })
      expect(items.root).toEqual({ type: 'validation', message: 'Add at least two items' })
    }

    // With no item issue, the registered names say it is an array
    const onlyArray = syncSchema(() => ({ issues: [{ message: 'Add at least two items', path: ['items'] }] }))
    const result = await standardSchemaResolver(onlyArray)({ items: [{ name: 'a' }] }, undefined, {
      fields: {},
      names: ['items.0.name'],
      shouldUseNativeValidation: false,
    } as any)
    expect(result.errors).toEqual({ items: { root: { type: 'validation', message: 'Add at least two items' } } })
  })

  it('keeps an object-level issue and its child issues, whichever comes first', async () => {
    const parent = { message: 'Address is incomplete', path: ['address'] }
    const child = { message: 'City is required', path: ['address', 'city'] }
    const expected = {
      address: {
        type: 'validation',
        message: 'Address is incomplete',
        city: { type: 'validation', message: 'City is required' },
      },
    }
    for (const issues of [
      [parent, child],
      [child, parent],
    ]) {
      const result = await standardSchemaResolver(syncSchema(() => ({ issues })))({}, undefined, resolverOptions)
      expect(result.errors).toEqual(expected)
    }
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

  it('finds registered fields under a container whose children are called ref, validate or name', async () => {
    const leaf = (name: string) => ({ name, ref: {}, validate: () => `Bad ${name}` })
    const fields = {
      address: {
        ref: leaf('address.ref'),
        validate: leaf('address.validate'),
        name: leaf('address.name'),
        phone: leaf('address.phone'),
      },
    }
    const resolver = createFormResolver(undefined, [{ key: 'other', options: { required: true } }])!
    const result = await resolver({ address: {}, other: 'y' }, undefined, {
      fields,
      shouldUseNativeValidation: false,
    } as any)

    expect(result.errors).toEqual({
      address: {
        ref: { type: 'validate', message: 'Bad address.ref' },
        validate: { type: 'validate', message: 'Bad address.validate' },
        name: { type: 'validate', message: 'Bad address.name' },
        phone: { type: 'validate', message: 'Bad address.phone' },
      },
    })
  })

  it('skips the registered rules of a field outside the active validation group or gated by validateWhen', async () => {
    const leaf = (name: string) => ({ name, ref: {}, validate: () => `Bad ${name}` })
    const fields = {
      address: { city: leaf('address.city'), zip: leaf('address.zip') },
      later: leaf('later'),
      gated: leaf('gated'),
      phone: leaf('phone'),
    }
    const resolver = createFormResolver(
      undefined,
      [
        { key: 'name', options: { required: true, validationGroup: 'step-1' } },
        { key: 'address.city', options: { schema: z.string().min(1), validationGroup: 'step-2' } },
        { key: 'later', options: { validationGroup: 'step-2' } },
        { key: 'gated', options: { validateWhen: () => false } },
        // In the active group, and not configured at all: both still run
        { key: 'address.zip', options: { validationGroup: 'step-1' } },
      ],
      'step-1',
    )!
    const result = await resolver({ name: 'Ada', address: { city: '', zip: '' } }, undefined, {
      fields,
      shouldUseNativeValidation: false,
    } as any)

    expect(result.errors).toEqual({
      address: { zip: { type: 'validate', message: 'Bad address.zip' } },
      phone: { type: 'validate', message: 'Bad phone' },
    })
  })

  it('does not fail a step-1 submit on a step-2 field with a schema', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="grouped"
        validationGroup="step-1"
        submit={submit}
        defaultValues={{ name: '', address: { city: '' } }}
        fields={[
          FormFieldClass.text('name', { label: 'Name', required: true, validationGroup: 'step-1' }),
          FormFieldClass.text('address.city', {
            label: 'City',
            schema: z.string().min(1, 'City is required'),
            validationGroup: 'step-2',
          }),
          submitButton(),
        ]}
      />,
    )

    typeInto(/name/i, 'Ada')
    clickSubmit()
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(screen.queryByText('City is required')).not.toBeInTheDocument()
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
