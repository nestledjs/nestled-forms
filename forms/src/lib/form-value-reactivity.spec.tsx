import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Form } from './form'
import { FormFieldClass, useFormContext, useFormValue, useFormValues } from '@nestledjs/forms-core'

// A component inside <Form> that does not own the form could not reactively read
// a value. The documented route — useFormContext() then form.watch(name) — compiles,
// returns the right value on first render, then silently never updates.
//
// watch() during render re-renders only the component that owns useForm(), which is
// <Form>. <Form> passes `children` straight through, so React sees the same element
// reference and skips reconciling that subtree; the subscription fires and the caller
// is never reached. useFormValue/useWatch subscribe the *calling* component instead.
//
// Distinct from the 0.8.1 fix in field-reactivity.spec.tsx: that covers a field
// reading its *own* value. This covers a component reading a field owned by another.

function Writer({ target, value }: { target: string; value: unknown }) {
  const form = useFormContext()
  return (
    <button type="button" onClick={() => form.setValue(target, value as never)}>
      GO
    </button>
  )
}

/** The trap, kept under test so the reason useFormValue exists stays pinned. */
function WatchMirror() {
  const form = useFormContext()
  return <p data-testid="watch">{String(form.watch('answer') ?? '')}</p>
}

function ValueMirror() {
  return <p data-testid="value">{String(useFormValue<string>('answer') ?? '')}</p>
}

function ValuesMirror() {
  const values = useFormValues<{ answer?: string }>()
  return <p data-testid="values">{String(values.answer ?? '')}</p>
}

function renderWithMirror(mirror: React.ReactNode) {
  return render(
    <Form
      id="form-value"
      submit={vi.fn()}
      defaultValues={{ answer: 'initial' }}
      fields={[FormFieldClass.custom('writer', { customField: () => <Writer target="answer" value="picked" /> })]}
    >
      {mirror}
    </Form>,
  )
}

const write = () => fireEvent.click(screen.getByText('GO'))

describe('reading another field-s value from a sibling component', () => {
  it('useFormValue re-renders the caller when the value changes', () => {
    renderWithMirror(<ValueMirror />)
    expect(screen.getByTestId('value').textContent).toBe('initial')

    write()
    expect(screen.getByTestId('value').textContent).toBe('picked')
  })

  it('useFormValues re-renders the caller when any value changes', () => {
    renderWithMirror(<ValuesMirror />)
    expect(screen.getByTestId('values').textContent).toBe('initial')

    write()
    expect(screen.getByTestId('values').textContent).toBe('picked')
  })

  it('useFormValue tracks repeated writes, not just the first', () => {
    renderWithMirror(<ValueMirror />)

    write()
    expect(screen.getByTestId('value').textContent).toBe('picked')

    fireEvent.click(screen.getByText('GO'))
    expect(screen.getByTestId('value').textContent).toBe('picked')
  })

  // Characterisation, not an endorsement: this is the reported bug. If <Form> is ever
  // changed to reconcile its children subtree, this will start failing — at which point
  // the fix is to update this expectation, not to reintroduce form.watch() in docs.
  it('form.watch during render is correct initially and then goes stale', () => {
    renderWithMirror(<WatchMirror />)
    expect(screen.getByTestId('watch').textContent).toBe('initial')

    write()
    expect(screen.getByTestId('watch').textContent).toBe('initial')
  })

  it('useFormValue is reactive where form.watch is not, in the same tree', () => {
    renderWithMirror(
      <>
        <WatchMirror />
        <ValueMirror />
      </>,
    )

    write()
    expect(screen.getByTestId('value').textContent).toBe('picked')
    expect(screen.getByTestId('watch').textContent).toBe('initial')
  })
})
