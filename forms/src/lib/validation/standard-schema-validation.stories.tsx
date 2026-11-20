import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import * as v from 'valibot'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Form } from '../form'
import { FormFieldClass } from '@nestledjs/forms-core'

/**
 * `schema` accepts any [Standard Schema](https://standardschema.dev) validator,
 * not only Zod. This form is validated entirely by [Valibot](https://valibot.dev):
 * a field-level schema on Username, and a form-level schema that checks the two
 * passwords match.
 */
const meta: Meta = {
  title: 'Forms/Validation/Standard Schema (Valibot)',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

// Form-level schema: validates the whole value object, and reports the
// cross-field rule on confirmPassword.
const signupSchema = v.pipe(
  v.object({
    username: v.string(),
    password: v.pipe(v.string(), v.minLength(8, 'Password must be at least 8 characters')),
    confirmPassword: v.string(),
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

function ValibotSignupForm() {
  const [submitted, setSubmitted] = React.useState<Record<string, unknown> | null>(null)

  return (
    <div className="max-w-md p-4 bg-white rounded-lg shadow">
      <Form
        id="standard-schema-valibot"
        schema={signupSchema}
        defaultValues={{ username: '', password: '', confirmPassword: '' }}
        fields={[
          FormFieldClass.text('username', {
            label: 'Username',
            placeholder: 'At least 3 characters',
            // Field-level schema: validates this field's value on its own
            schema: v.pipe(v.string(), v.minLength(3, 'Username must be at least 3 characters')),
          }),
          FormFieldClass.password('password', { label: 'Password', placeholder: 'At least 8 characters' }),
          FormFieldClass.password('confirmPassword', { label: 'Confirm password', placeholder: 'Re-enter password' }),
          FormFieldClass.button('submit', { text: 'Submit', type: 'submit' }),
        ]}
        submit={(values) => setSubmitted(values)}
        className="space-y-4"
      />

      {submitted && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-sm text-green-800">
          <p className="font-bold mb-2">Form submitted with:</p>
          <pre data-testid="submitted-values">{JSON.stringify(submitted, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export const ValibotSchemas: Story = {
  name: 'Valibot field and form schemas',
  render: () => <ValibotSignupForm />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const username = canvas.getByLabelText(/Username/)
    const password = canvas.getByLabelText(/^Password/)
    const confirm = canvas.getByLabelText(/Confirm password/)

    await step('Field-level Valibot schema rejects a short username', async () => {
      await userEvent.type(username, 'ab')
      await userEvent.tab()
      await waitFor(() => expect(canvas.getByText('Username must be at least 3 characters')).toBeInTheDocument())
    })

    await step('A third character clears it', async () => {
      await userEvent.type(username, 'c')
      await userEvent.tab()
      await waitFor(() => expect(canvas.queryByText('Username must be at least 3 characters')).not.toBeInTheDocument())
    })

    await step('Form-level Valibot schema blocks a mismatched confirmation', async () => {
      await userEvent.type(password, 'correct-horse')
      await userEvent.type(confirm, 'different-horse')
      await userEvent.click(canvas.getByRole('button', { name: /Submit/i }))
      await waitFor(() => expect(canvas.getByText('Passwords must match')).toBeInTheDocument())
      expect(canvas.queryByTestId('submitted-values')).not.toBeInTheDocument()
    })

    await step('Matching passwords submit', async () => {
      await userEvent.clear(confirm)
      await userEvent.type(confirm, 'correct-horse')
      await userEvent.click(canvas.getByRole('button', { name: /Submit/i }))
      await waitFor(() => expect(canvas.getByTestId('submitted-values')).toHaveTextContent('"username": "abc"'))
    })
  },
}
