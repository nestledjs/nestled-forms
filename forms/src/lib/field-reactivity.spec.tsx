import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Form } from './form'
import { FormField, FormFieldClass, useFormContext } from '@nestledjs/forms-core'

// Fields used to read their value with `form.getValues(field.key)`, which is a
// one-shot read that creates no subscription. Anything the field rendered from
// that value therefore froze at its first render: a write from a sibling
// component (or any setValue that doesn't otherwise disturb formState) updated
// form state but not the UI. Every render path now reads through useWatch.
//
// Note reset() was never affected — it perturbs formState, which re-renders the
// whole form — so these tests deliberately use setValue, the case that broke.

function Writer({ target, value }: { target: string; value: unknown }) {
  const form = useFormContext()
  return (
    <button type="button" onClick={() => form.setValue(target, value as never)}>
      GO
    </button>
  )
}

function renderWithWriter(field: FormField, target: string, value: unknown) {
  return render(
    <Form
      id="reactivity"
      submit={vi.fn()}
      fields={[field, FormFieldClass.custom('writer', { customField: () => <Writer target={target} value={value} /> })]}
    />,
  )
}

const write = () => fireEvent.click(screen.getByText('GO'))

describe('read-only fields follow an external setValue', () => {
  const cases: ReadonlyArray<readonly [string, FormField, unknown, string]> = [
    ['text', FormFieldClass.text('k', { label: 'L', readOnly: true }), 'written', 'written'],
    ['textArea', FormFieldClass.textArea('k', { label: 'L', readOnly: true }), 'written', 'written'],
    ['email', FormFieldClass.email('k', { label: 'L', readOnly: true }), 'a@b.co', 'a@b.co'],
    ['url', FormFieldClass.url('k', { label: 'L', readOnly: true }), 'https://x.co', 'https://x.co'],
    ['number', FormFieldClass.number('k', { label: 'L', readOnly: true }), 42, '42'],
    ['datePicker', FormFieldClass.datePicker('k', { label: 'L', readOnly: true }), '2026-01-02', 'January 02, 2026'],
    [
      'select',
      FormFieldClass.select('k', { label: 'L', readOnly: true, options: [{ value: 'x', label: 'ExLabel' }] }),
      'x',
      'ExLabel',
    ],
    [
      'searchSelect',
      FormFieldClass.searchSelect('k', { label: 'L', readOnly: true, options: [{ value: 'x', label: 'ExLabel' }] }),
      'x',
      'ExLabel',
    ],
  ]

  it.each(cases)('%s read-only display updates', (_name, field, value, expected) => {
    renderWithWriter(field, 'k', value)
    expect(screen.queryByText(expected)).toBeNull()
    write()
    expect(screen.queryByText(expected)).not.toBeNull()
  })
})

describe('editable fields follow an external setValue', () => {
  it('searchSelect shows the newly selected label', () => {
    renderWithWriter(
      FormFieldClass.searchSelect('k', { label: 'L', options: [{ value: 'x', label: 'ExLabel' }] }),
      'k',
      'x',
    )
    write()
    const inputs = screen.getAllByRole('combobox') as HTMLInputElement[]
    expect(inputs.map((i) => i.value).join('|')).toContain('ExLabel')
  })

  it('select shows the newly selected option', () => {
    renderWithWriter(FormFieldClass.select('k', { label: 'L', options: [{ value: 'x', label: 'Ex' }] }), 'k', 'x')
    const combo = screen.getByRole('combobox') as HTMLSelectElement
    expect(combo.value).not.toBe('x')
    write()
    expect(combo.value).toBe('x')
  })

  it('switch reflects the written state', () => {
    renderWithWriter(FormFieldClass.switch('k', { label: 'L' }), 'k', true)
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('false')
    write()
    expect(screen.getByRole('switch').getAttribute('aria-checked')).toBe('true')
  })

  it('checkbox reflects the written state', () => {
    renderWithWriter(FormFieldClass.checkbox('k', { label: 'L' }), 'k', true)
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false)
    write()
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true)
  })

  it('radio reflects the written state', () => {
    renderWithWriter(
      {
        key: 'k',
        type: 'Radio',
        options: {
          label: 'L',
          radioOptions: [
            { key: 'k1', label: 'A', value: 'a' },
            { key: 'k2', label: 'B', value: 'b' },
          ],
        },
      } as unknown as FormField,
      'k',
      'b',
    )
    expect((screen.getAllByRole('radio') as HTMLInputElement[]).some((r) => r.checked)).toBe(false)
    write()
    expect((screen.getAllByRole('radio') as HTMLInputElement[])[1].checked).toBe(true)
  })
})
