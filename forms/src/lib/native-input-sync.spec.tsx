import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Form } from './form'
import { FormFieldClass } from '@nestledjs/forms-core'

// Values that arrive without key events (paste, drag-drop, browser and
// password-manager autofill) must reach the form state, or a required field
// blocks the submit even though the input visibly holds a value.

type FieldFactory = 'text' | 'email' | 'password' | 'url' | 'textArea'

const FIELD_CASES: Array<{ factory: FieldFactory; value: string }> = [
  { factory: 'text', value: 'pasted-user' },
  { factory: 'email', value: 'user@example.com' },
  { factory: 'password', value: 'correct horse battery staple' },
  { factory: 'url', value: 'https://example.com' },
  { factory: 'textArea', value: 'a pasted paragraph' },
]

function renderLogin(factory: FieldFactory) {
  const submit = vi.fn()
  render(
    <Form
      id="login-form"
      submit={submit}
      fields={[
        (FormFieldClass as any)[factory]('secret', { label: 'Secret', required: true }),
        FormFieldClass.button('go', { text: 'Log In', type: 'submit' }),
      ]}
    />,
  )
  const input = screen.getByLabelText(/secret/i) as HTMLInputElement | HTMLTextAreaElement
  const button = screen.getByRole('button', { name: /log in/i })
  return { submit, input, button }
}

/**
 * How a script (a password manager, a browser extension, autofill) fills a
 * field: assign `.value` on the element, then dispatch a bare event. React
 * tracks assignments made through the element, so it treats the following
 * `input` event as "no change" and never calls `onChange`.
 */
function scriptFill(el: HTMLInputElement | HTMLTextAreaElement, value: string, eventType: 'input' | 'change') {
  el.value = value
  el.dispatchEvent(new Event(eventType, { bubbles: true }))
}

/** Autofill that fires no event at all until the user interacts. */
function silentFill(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value)
}

describe('Form registers values that arrive without key events', () => {
  for (const { factory, value } of FIELD_CASES) {
    describe(`${factory} field`, () => {
      it('submits a value pasted with user.paste', async () => {
        const user = userEvent.setup()
        const { submit, input, button } = renderLogin(factory)
        await user.click(input)
        await user.paste(value)
        await user.click(button)
        await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
        expect(submit.mock.calls[0][0]).toMatchObject({ secret: value })
      })

      const FILLS: Array<[string, (el: HTMLInputElement | HTMLTextAreaElement) => void]> = [
        ['delivered by fireEvent.input', (el) => fireEvent.input(el, { target: { value } })],
        ['a script set before dispatching a native input event', (el) => scriptFill(el, value, 'input')],
        ['a script set before dispatching a native change event', (el) => scriptFill(el, value, 'change')],
        ['autofilled without firing any event, read when the form submits', (el) => silentFill(el, value)],
      ]

      for (const [how, fill] of FILLS) {
        it(`submits a value ${how}`, async () => {
          const { submit, input, button } = renderLogin(factory)
          fill(input)
          fireEvent.click(button)
          await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
          expect(submit.mock.calls[0][0]).toMatchObject({ secret: value })
        })
      }
    })
  }

  it('clears the required error once a script fills the field after a blocked submit', async () => {
    const { submit, input, button } = renderLogin('password')
    fireEvent.click(button)
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    scriptFill(input, 'hunter2', 'input')
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument())
    fireEvent.click(button)
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(submit.mock.calls[0][0]).toMatchObject({ secret: 'hunter2' })
  })
})

describe('Form focuses the first invalid field when a submit is blocked', () => {
  it('moves focus to the first invalid field in document order', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="focus-form"
        submit={submit}
        fields={[
          FormFieldClass.text('name', { label: 'Name' }),
          FormFieldClass.email('email', { label: 'Email', required: true }),
          FormFieldClass.password('password', { label: 'Password', required: true }),
          FormFieldClass.button('go', { text: 'Log In', type: 'submit' }),
        ]}
      />,
    )
    const button = screen.getByRole('button', { name: /log in/i })
    button.focus()
    fireEvent.click(button)
    await waitFor(() => expect(screen.getByLabelText(/email/i)).toHaveFocus())
    expect(submit).not.toHaveBeenCalled()
  })

  it('focuses a controlled field that precedes the native inputs', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="focus-controlled"
        submit={submit}
        fields={[
          FormFieldClass.checkbox('agree', { label: 'I agree', required: true }),
          FormFieldClass.email('email', { label: 'Email', required: true }),
          FormFieldClass.button('go', { text: 'Log In', type: 'submit' }),
        ]}
      />,
    )
    const button = screen.getByRole('button', { name: /log in/i })
    button.focus()
    fireEvent.click(button)
    await waitFor(() => expect(screen.getByRole('checkbox', { name: /i agree/i })).toHaveFocus())
    expect(submit).not.toHaveBeenCalled()
  })

  it('does not move focus when the submit succeeds', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="focus-ok"
        submit={submit}
        defaultValues={{ email: 'user@example.com' }}
        fields={[
          FormFieldClass.email('email', { label: 'Email', required: true }),
          FormFieldClass.button('go', { text: 'Log In', type: 'submit' }),
        ]}
      />,
    )
    const button = screen.getByRole('button', { name: /log in/i })
    button.focus()
    fireEvent.click(button)
    await waitFor(() => expect(submit).toHaveBeenCalledTimes(1))
    expect(button).toHaveFocus()
  })
})
