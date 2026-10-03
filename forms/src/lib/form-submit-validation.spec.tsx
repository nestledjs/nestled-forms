import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { Form } from './form'
import { FormFieldClass, FormFieldType, createFormResolver } from '@nestledjs/forms-core'

describe('Form submit transforms', () => {
  it('applies the default multi-select transform: option objects submit as ID strings', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="t"
        submit={submit}
        defaultValues={{
          tags: [
            { value: 'id1', label: 'One' },
            { value: 'id2', label: 'Two' },
          ],
        }}
        fields={[
          FormFieldClass.searchSelectMulti('tags', {
            label: 'Tags',
            options: [
              { value: 'id1', label: 'One' },
              { value: 'id2', label: 'Two' },
            ],
          }),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0]).toEqual({ tags: ['id1', 'id2'] })
  })

  it('lets an explicit submitTransform override the default', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="t2"
        submit={submit}
        defaultValues={{ tags: [{ value: 'id1', label: 'One' }] }}
        fields={[
          FormFieldClass.searchSelectMulti('tags', {
            label: 'Tags',
            options: [{ value: 'id1', label: 'One' }],
            submitTransform: (v: any) => v.map((o: any) => `custom:${o.value}`),
          }),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0]).toEqual({ tags: ['custom:id1'] })
  })

  it('does not mutate the caller field config', async () => {
    const submit = vi.fn()
    const field = FormFieldClass.searchSelectMulti('tags', {
      label: 'Tags',
      options: [{ value: 'id1', label: 'One' }],
    })
    render(
      <Form id="t3" submit={submit} fields={[field, FormFieldClass.button('go', { text: 'Submit', type: 'submit' })]} />,
    )
    expect(field.options.submitTransform).toBeUndefined()
  })
})

describe('Form validation via resolver', () => {
  it('enforces required on a plain field even when another field has a zod schema', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="v1"
        submit={submit}
        fields={[
          FormFieldClass.text('name', { label: 'Name', required: true }),
          FormFieldClass.text('code', { label: 'Code', schema: z.string().min(2, 'Too short').optional() }),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(screen.getByText('This field is required')).toBeInTheDocument())
    expect(submit).not.toHaveBeenCalled()
  })

  it('honors errorMessages.required', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="v2"
        submit={submit}
        fields={[
          FormFieldClass.text('name', {
            label: 'Name',
            required: true,
            errorMessages: { required: 'Name me!' },
          }),
          FormFieldClass.text('other', { label: 'Other', schema: z.string().optional() }),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(screen.getByText('Name me!')).toBeInTheDocument())
  })

  it('accepts 0 as a filled-in required value', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="v3"
        submit={submit}
        defaultValues={{ qty: 0 }}
        fields={[
          FormFieldClass.number('qty', { label: 'Qty', required: true, schema: z.number() }),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0]).toEqual({ qty: 0 })
  })

  it('runs form-level schema AND field-level validation together', async () => {
    const resolver = createFormResolver(
      z.object({ a: z.string().min(1, 'A from schema'), b: z.any() }),
      [{ key: 'b', options: { required: true } }],
    )!
    const result = await resolver({ a: '', b: '' }, undefined, { fields: {}, shouldUseNativeValidation: false } as any)
    expect((result.errors as any).a?.message).toBe('A from schema')
    expect((result.errors as any).b?.message).toBe('This field is required')
  })

  it('skips fields outside the active validationGroup', async () => {
    const resolver = createFormResolver(
      undefined,
      [
        { key: 'step1Field', options: { required: true, validationGroup: 'step-1' } },
        { key: 'step2Field', options: { required: true, validationGroup: 'step-2' } },
      ],
      'step-1',
    )!
    const result = await resolver({ step1Field: '', step2Field: '' }, undefined, {
      fields: {},
      shouldUseNativeValidation: false,
    } as any)
    expect((result.errors as any).step1Field?.type).toBe('required')
    expect((result.errors as any).step2Field).toBeUndefined()
  })
})
