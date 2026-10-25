import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import { useForm } from 'react-hook-form'
import { FormContext, FormFieldClass, buildFieldsResolver, type FormField } from '@nestledjs/forms-core'
import { RenderFormField } from './render-form-field'

// Native mirror of forms/src/lib/render-form-field-standalone.spec.tsx. The
// fields sit in a memoized section with stable props, so when the host
// re-renders on an error change React skips them: any message has to come
// from the field's own subscription.
//
// RNTL v14 renders on a concurrent root, so render() is async and must be
// awaited before querying.

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
  const [stableFields] = React.useState(fields)
  const form = useForm({
    mode: 'onSubmit',
    resolver: buildFieldsResolver({ fields: stableFields, defaultRequiredMessage: 'This field is required' }),
  })
  return (
    <FormContext.Provider value={form}>
      <FieldSection fields={stableFields} />
      <Pressable onPress={() => form.handleSubmit(onValid)()}>
        <Text>SAVE</Text>
      </Pressable>
    </FormContext.Provider>
  )
}

const press = async (text: string) => {
  const result: unknown = fireEvent.press(screen.getByText(text))
  if (result && typeof (result as Promise<unknown>).then === 'function') await result
}

describe('standalone native RenderFormField shows its own validation error', () => {
  it('shows the required error when nothing above the field re-renders', async () => {
    const onValid = jest.fn()
    await render(
      <StandaloneHost onValid={onValid} fields={[FormFieldClass.text('name', { label: 'Name', required: true })]} />,
    )
    await press('SAVE')
    await waitFor(() => expect(screen.getByText('This field is required')).toBeTruthy())
    expect(onValid).not.toHaveBeenCalled()
  })

  it('resolves the error for a nested (dotted) key', async () => {
    const onValid = jest.fn()
    await render(
      <StandaloneHost
        onValid={onValid}
        fields={[FormFieldClass.text('address.city', { label: 'City', required: true })]}
      />,
    )
    await press('SAVE')
    await waitFor(() => expect(screen.getByText('This field is required')).toBeTruthy())
    expect(onValid).not.toHaveBeenCalled()
  })
})
