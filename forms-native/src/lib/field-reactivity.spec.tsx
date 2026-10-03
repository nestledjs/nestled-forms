import { fireEvent, render, screen } from '@testing-library/react-native'
import { Text, Pressable } from 'react-native'
import { NativeForm } from './form'
import { FormField, FormFieldClass, useFormContext } from '@nestledjs/forms-core'

// Native mirror of forms/src/lib/field-reactivity.spec.tsx. Fields used to read
// their value with form.getValues(field.key), a one-shot read that creates no
// subscription, so anything rendered from it froze at its first render. A write
// from a sibling component updated form state but not the UI. Every render path
// now reads through useWatch.
//
// RNTL v14 renders on a concurrent root, so render() is async and must be
// awaited before querying.

function Writer({ target, value }: { target: string; value: unknown }) {
  const form = useFormContext()
  return (
    <Pressable onPress={() => form.setValue(target, value as never)}>
      <Text>GO</Text>
    </Pressable>
  )
}

async function renderWithWriter(field: FormField, target: string, value: unknown) {
  await render(
    <NativeForm
      id="reactivity"
      submit={jest.fn()}
      fields={[field, FormFieldClass.custom('writer', { customField: () => <Writer target={target} value={value} /> })]}
    />,
  )
}

const press = async (text: string) => {
  const result: unknown = fireEvent.press(screen.getByText(text))
  if (result && typeof (result as Promise<unknown>).then === 'function') await result
}

describe('CustomField render prop stays in sync', () => {
  it('re-renders with the new value after the render prop calls onChange', async () => {
    await render(
      <NativeForm
        id="custom-onchange"
        submit={jest.fn()}
        fields={[
          FormFieldClass.custom<string>('nickname', {
            label: 'Nickname',
            defaultValue: 'start',
            customField: ({ value, onChange }) => (
              <>
                <Text testID="custom-value">{String(value)}</Text>
                <Pressable onPress={() => onChange('changed')}>
                  <Text>SET</Text>
                </Pressable>
              </>
            ),
          }),
        ]}
      />,
    )

    expect(screen.getByTestId('custom-value')).toHaveTextContent('start')
    await press('SET')
    expect(screen.getByTestId('custom-value')).toHaveTextContent('changed')
  })

  it('re-renders when a sibling component writes to the custom field key', async () => {
    await renderWithWriter(
      FormFieldClass.custom<string>('mirror', {
        label: 'Mirror',
        customField: ({ value }) => <Text testID="mirror-value">{value ?? 'empty'}</Text>,
      }),
      'mirror',
      'from-sibling',
    )

    expect(screen.getByTestId('mirror-value')).toHaveTextContent('empty')
    await press('GO')
    expect(screen.getByTestId('mirror-value')).toHaveTextContent('from-sibling')
  })
})

describe('read-only fields follow an external setValue', () => {
  const cases: ReadonlyArray<readonly [string, FormField, unknown, string]> = [
    ['text', FormFieldClass.text('k', { label: 'L', readOnly: true }), 'written', 'written'],
    ['textArea', FormFieldClass.textArea('k', { label: 'L', readOnly: true }), 'written', 'written'],
    ['email', FormFieldClass.email('k', { label: 'L', readOnly: true }), 'a@b.co', 'a@b.co'],
    ['url', FormFieldClass.url('k', { label: 'L', readOnly: true }), 'https://x.co', 'https://x.co'],
    ['number', FormFieldClass.number('k', { label: 'L', readOnly: true }), 42, '42'],
  ]

  it.each(cases)('%s read-only display updates', async (_name, field, value, expected) => {
    await renderWithWriter(field, 'k', value)
    expect(screen.queryByText(expected)).toBeNull()
    await press('GO')
    expect(screen.queryByText(expected)).not.toBeNull()
  })
})

describe('editable fields follow an external setValue', () => {
  it('switch reflects the written state', async () => {
    await renderWithWriter(FormFieldClass.switch('k', { label: 'L' }), 'k', true)
    expect(screen.getByRole('switch').props.value).toBe(false)
    await press('GO')
    expect(screen.getByRole('switch').props.value).toBe(true)
  })
})
