import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useForm } from 'react-hook-form'
import { FormContext, FormFieldClass, type FormField } from '@nestledjs/forms-core'
import { RenderFormField } from './render-form-field'

// The fields sit in a memoized section with stable props, the way an app
// splits a long form into sections. When the host re-renders on an error
// change, React skips this subtree, so any error message has to come from the
// field's own subscription.
const FieldSection = React.memo(function FieldSection({ fields }: { fields: FormField[] }) {
  return (
    <>
      {fields.map((field) => (
        <RenderFormField key={field.key} field={field} />
      ))}
    </>
  )
})

function StandaloneHost({ fields, onValid }: { fields: FormField[]; onValid: (v: unknown) => void }) {
  const form = useForm({ mode: 'onSubmit' })
  const [stableFields] = React.useState(fields)
  return (
    <FormContext.Provider value={form}>
      <form noValidate onSubmit={form.handleSubmit(onValid)}>
        <FieldSection fields={stableFields} />
        <button type="submit">Save</button>
      </form>
    </FormContext.Provider>
  )
}

describe('standalone RenderFormField shows its own validation error', () => {
  it('shows the required error and sets aria-invalid when nothing above the field re-renders', async () => {
    const onValid = vi.fn()
    render(<StandaloneHost onValid={onValid} fields={[FormFieldClass.text('name', { label: 'Name', required: true })]} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i)
    expect(screen.getByLabelText(/name/i)).toHaveAttribute('aria-invalid', 'true')
    expect(onValid).not.toHaveBeenCalled()
  })

  it('shows a validate-rule message', async () => {
    render(
      <StandaloneHost
        onValid={vi.fn()}
        fields={[
          FormFieldClass.text('code', {
            label: 'Code',
            validate: (value: unknown) => value === 'ok' || 'Code must be ok',
          } as any),
        ]}
      />,
    )
    fireEvent.input(screen.getByLabelText(/code/i), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Code must be ok')
  })

  it('resolves the error for a nested (dotted) key', async () => {
    const onValid = vi.fn()
    render(
      <StandaloneHost
        onValid={onValid}
        fields={[FormFieldClass.text('address.city', { label: 'City', required: true })]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i)
    expect(screen.getByLabelText(/city/i)).toHaveAttribute('aria-invalid', 'true')
    expect(onValid).not.toHaveBeenCalled()
  })

  it('clears the error once the field becomes valid', async () => {
    const onValid = vi.fn()
    render(<StandaloneHost onValid={onValid} fields={[FormFieldClass.text('name', { label: 'Name', required: true })]} />)

    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()

    fireEvent.input(screen.getByLabelText(/name/i), { target: { value: 'Ada' } })
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows the error on a required checkbox', async () => {
    render(
      <StandaloneHost onValid={vi.fn()} fields={[FormFieldClass.checkbox('agree', { label: 'I agree', required: true })]} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /save/i }))
    await waitFor(() => expect(screen.getByText(/required/i)).toBeInTheDocument())
  })
})
