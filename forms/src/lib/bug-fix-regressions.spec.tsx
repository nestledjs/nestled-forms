import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Form } from './form'
import {
  FormField,
  FormFieldClass,
  FormFieldType,
  CURRENCY_CONFIGS,
  parseCurrency,
  useFormContext,
} from '@nestledjs/forms-core'

// Note: fix 8 (native comma-decimal sanitizing in forms-native number/money fields)
// is inline component logic in react-native TextInput handlers and is not exported,
// so it is not unit-testable from this web package.

describe('SelectFieldEnum: numeric enums exclude reverse mappings', () => {
  enum NumericStatus {
    Active,
    Inactive,
  }

  enum StringColor {
    Red = 'red',
    Blue = 'blue',
  }

  it('renders only the named members of a numeric enum', () => {
    render(
      <Form
        id="enum-numeric"
        submit={vi.fn()}
        fields={[FormFieldClass.enumSelect('status', { label: 'Status', enum: NumericStatus })]}
      />,
    )

    const optionLabels = screen
      .getAllByRole('option')
      .map((o) => o.textContent)
      .filter((label) => label !== 'Select an option...')
    expect(optionLabels).toEqual(['Active', 'Inactive'])
  })

  it('keeps string enums working unchanged', () => {
    render(
      <Form
        id="enum-string"
        submit={vi.fn()}
        fields={[FormFieldClass.enumSelect('color', { label: 'Color', enum: StringColor })]}
      />,
    )

    const options = screen
      .getAllByRole('option')
      .filter((o) => o.textContent !== 'Select an option...') as HTMLOptionElement[]
    expect(options.map((o) => [o.textContent, o.value])).toEqual([
      ['Red', 'red'],
      ['Blue', 'blue'],
    ])
  })
})

describe('Number and currency fields: empty inputs submit undefined, not NaN', () => {
  it('submits undefined for an empty optional number field and a number when filled', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="num-empty"
        submit={submit}
        fields={[
          FormFieldClass.number('qty', { label: 'Qty' }),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    const input = screen.getByLabelText(/Qty/)

    // Type a value then clear it: cleared field must submit undefined, not NaN
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0].qty).toBeUndefined()

    fireEvent.change(input, { target: { value: '7' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2))
    expect(submit.mock.calls[1][0].qty).toBe(7)
  })

  it('submits undefined for an empty optional currency field and a number when filled', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="money-empty"
        submit={submit}
        fields={[
          FormFieldClass.currency('price', { label: 'Price' }),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    const input = screen.getByLabelText(/Price/)

    fireEvent.change(input, { target: { value: '10.5' } })
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0].price).toBeUndefined()

    fireEvent.change(input, { target: { value: '10.5' } })
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(2))
    expect(submit.mock.calls[1][0].price).toBe(10.5)
  })
})

describe('RadioField: falsy default values (false, 0) are applied', () => {
  function radioField(key: string, defaultValue: unknown, values: [unknown, unknown]): FormField {
    return {
      key,
      type: FormFieldType.Radio,
      options: {
        label: 'Choice',
        defaultValue,
        radioOptions: [
          { key: 'a', value: values[0], label: 'Option A' },
          { key: 'b', value: values[1], label: 'Option B' },
        ],
      },
    } as FormField
  }

  it('applies a defaultValue of false', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="radio-false"
        submit={submit}
        defaultValues={{ choice: '' }}
        fields={[
          radioField('choice', false, [true, false]),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0].choice).toBe(false)
  })

  it('applies a defaultValue of 0', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="radio-zero"
        submit={submit}
        defaultValues={{ rating: '' }}
        fields={[
          radioField('rating', 0, [0, 1]),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0].rating).toBe(0)
  })
})

describe('parseCurrency: ambiguous separators', () => {
  const USD = CURRENCY_CONFIGS.USD
  const EUR = CURRENCY_CONFIGS.EUR

  it('parses unambiguous grouped inputs as before', () => {
    expect(parseCurrency('1.234,56', EUR)).toBe(1234.56)
    expect(parseCurrency('€1.234,56', EUR)).toBe(1234.56)
    expect(parseCurrency('$1,234.56', USD)).toBe(1234.56)
    expect(parseCurrency('1,234', USD)).toBe(1234)
    expect(parseCurrency('1.234', EUR)).toBe(1234)
  })

  it('treats a single separator followed by 1-2 digits as a decimal regardless of config', () => {
    expect(parseCurrency('1,5', USD)).toBe(1.5)
    expect(parseCurrency('1.5', USD)).toBe(1.5)
    expect(parseCurrency('1,5', EUR)).toBe(1.5)
    expect(parseCurrency('1.5', EUR)).toBe(1.5)
    expect(parseCurrency('12,34', EUR)).toBe(12.34)
  })

  it('uses the last-occurring separator as the decimal when both are present', () => {
    expect(parseCurrency('1,234.56', EUR)).toBe(1234.56)
    expect(parseCurrency('1.234,56', USD)).toBe(1234.56)
  })

  it('keeps the configured decimal separator for single-occurrence inputs', () => {
    expect(parseCurrency('1.234', USD)).toBe(1.234)
    expect(parseCurrency('0.12345', USD)).toBe(0.12345)
  })

  it('returns null for invalid input', () => {
    expect(parseCurrency('', USD)).toBeNull()
    expect(parseCurrency('abc', USD)).toBeNull()
  })
})

describe('CustomField: render prop value stays in sync with form state', () => {
  it('re-renders with the new value after the render prop calls onChange', () => {
    render(
      <Form
        id="custom-onchange"
        submit={vi.fn()}
        fields={[
          FormFieldClass.custom<string>('nickname', {
            label: 'Nickname',
            defaultValue: 'start',
            customField: ({ value, onChange }) => (
              <div>
                <span data-testid="custom-value">{String(value)}</span>
                <button type="button" onClick={() => onChange('changed')}>
                  set
                </button>
              </div>
            ),
          }),
        ]}
      />,
    )

    expect(screen.getByTestId('custom-value').textContent).toBe('start')
    fireEvent.click(screen.getByText('set'))
    expect(screen.getByTestId('custom-value').textContent).toBe('changed')
  })

  it('re-renders when a sibling component writes to the custom field key', () => {
    function SiblingWriter() {
      const form = useFormContext()
      return (
        <button type="button" onClick={() => form.setValue('mirror', 'from-sibling')}>
          write mirror
        </button>
      )
    }

    render(
      <Form
        id="custom-external-write"
        submit={vi.fn()}
        defaultValues={{ mirror: '' }}
        fields={[
          FormFieldClass.custom('writer', {
            label: 'Writer',
            customField: () => <SiblingWriter />,
          }),
          FormFieldClass.custom<string>('mirror', {
            label: 'Mirror',
            customField: ({ value }) => <span data-testid="mirror-value">{value || 'empty'}</span>,
          }),
        ]}
      />,
    )

    expect(screen.getByTestId('mirror-value').textContent).toBe('empty')
    fireEvent.click(screen.getByText('write mirror'))
    expect(screen.getByTestId('mirror-value').textContent).toBe('from-sibling')
  })

  it('submits the value written through the render prop onChange', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="custom-submit"
        submit={submit}
        fields={[
          FormFieldClass.custom<string>('nickname', {
            label: 'Nickname',
            customField: ({ value, onChange }) => (
              <div>
                <span data-testid="submit-value">{String(value ?? '')}</span>
                <button type="button" onClick={() => onChange('typed')}>
                  set
                </button>
              </div>
            ),
          }),
        ]}
      />,
    )

    fireEvent.click(screen.getByText('set'))
    expect(screen.getByTestId('submit-value').textContent).toBe('typed')

    fireEvent.submit(document.getElementById('custom-submit') as HTMLFormElement)
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0].nickname).toBe('typed')
  })
})
