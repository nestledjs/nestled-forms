import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Form } from './form'
import { FormFieldClass } from '@nestledjs/forms-core'

describe('Form strings localization', () => {
  it('renders the default English strings when no overrides are given', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="s1"
        submit={submit}
        fields={[
          FormFieldClass.text('name', { label: 'Name', required: true }),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(screen.getByText('This field is required')).toBeInTheDocument())
    expect(submit).not.toHaveBeenCalled()
  })

  it('shows the overridden requiredError string on a failed submit', async () => {
    const submit = vi.fn()
    render(
      <Form
        id="s2"
        submit={submit}
        strings={{ requiredError: 'Champ requis', noResults: 'Aucun résultat' }}
        fields={[
          FormFieldClass.text('name', { label: 'Name', required: true }),
          FormFieldClass.button('go', { text: 'Submit', type: 'submit' }),
        ]}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(screen.getByText('Champ requis')).toBeInTheDocument())
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
    expect(submit).not.toHaveBeenCalled()
  })

  it('renders the overridden select placeholder', () => {
    const submit = vi.fn()
    render(
      <Form
        id="s3"
        submit={submit}
        strings={{ selectPlaceholder: 'Choisissez une option...' }}
        fields={[
          FormFieldClass.select('color', {
            label: 'Color',
            options: [
              { value: 'red', label: 'Red' },
              { value: 'blue', label: 'Blue' },
            ],
          }),
        ]}
      />,
    )

    expect(screen.getByText('Choisissez une option...')).toBeInTheDocument()
    expect(screen.queryByText('Select an option...')).not.toBeInTheDocument()
  })
})
