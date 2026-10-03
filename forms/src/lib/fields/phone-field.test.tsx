import React from 'react'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { Form } from '../form'
import { FormFieldClass } from '@nestledjs/forms-core'

describe('PhoneField Validation', () => {
  it('should reject invalid phone numbers after effects settle', async () => {
    const handleSubmit = vi.fn()

    render(
      <Form
        id="test-phone-form"
        fields={[
          FormFieldClass.phone('phone', {
            label: 'Phone',
            defaultValue: '123',
          }),
          FormFieldClass.button('submit', {
            type: 'submit',
            text: 'Submit',
          }),
        ]}
        submit={handleSubmit}
      />
    )

    // Wait for the lazy-loaded PhoneField to mount and register its validator.
    // (Also guards the original bug: a re-register effect used to strip the
    // phone validation after mount.)
    await screen.findByLabelText('Phone', {}, { timeout: 15000 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    fireEvent.click(submitButton)

    await waitFor(
      () => {
        expect(handleSubmit).not.toHaveBeenCalled()
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  it('should accept valid phone numbers', async () => {
    const handleSubmit = vi.fn()

    render(
      <Form
        id="test-phone-form"
        fields={[
          FormFieldClass.phone('phone', {
            label: 'Phone',
            defaultValue: '+12025551234',
          }),
          FormFieldClass.button('submit', {
            type: 'submit',
            text: 'Submit',
          }),
        ]}
        submit={handleSubmit}
      />
    )

    await screen.findByLabelText('Phone', {}, { timeout: 15000 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ phone: '+12025551234' })
    })
  })

  it('should accept international phone numbers', async () => {
    const handleSubmit = vi.fn()

    render(
      <Form
        id="test-phone-form"
        fields={[
          FormFieldClass.phone('phone', {
            label: 'Phone',
            defaultValue: '+442071234567',
          }),
          FormFieldClass.button('submit', {
            type: 'submit',
            text: 'Submit',
          }),
        ]}
        submit={handleSubmit}
      />
    )

    await screen.findByLabelText('Phone', {}, { timeout: 15000 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ phone: '+442071234567' })
    })
  })

  it('should allow empty phone fields when not required', async () => {
    const handleSubmit = vi.fn()

    render(
      <Form
        id="test-phone-form"
        fields={[
          FormFieldClass.phone('phone', {
            label: 'Phone',
          }),
          FormFieldClass.button('submit', {
            type: 'submit',
            text: 'Submit',
          }),
        ]}
        submit={handleSubmit}
      />
    )

    await screen.findByLabelText('Phone', {}, { timeout: 15000 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

describe('PhoneField defaultCountry', () => {
  it('should accept US-local format numbers with no defaultCountry set (default is US)', async () => {
    const handleSubmit = vi.fn()

    render(
      <Form
        id="test-phone-form"
        fields={[
          FormFieldClass.phone('phone', {
            label: 'Phone',
            defaultValue: '5035551234',
          }),
          FormFieldClass.button('submit', {
            type: 'submit',
            text: 'Submit',
          }),
        ]}
        submit={handleSubmit}
      />
    )

    await screen.findByLabelText('Phone', {}, { timeout: 15000 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ phone: '5035551234' })
    })
  })

  it('should accept US-local format numbers when defaultCountry is US', async () => {
    const handleSubmit = vi.fn()

    render(
      <Form
        id="test-phone-form"
        fields={[
          FormFieldClass.phone('phone', {
            label: 'Phone',
            defaultValue: '5035551234',
            defaultCountry: 'US',
          }),
          FormFieldClass.button('submit', {
            type: 'submit',
            text: 'Submit',
          }),
        ]}
        submit={handleSubmit}
      />
    )

    await screen.findByLabelText('Phone', {}, { timeout: 15000 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ phone: '5035551234' })
    })
  })

  it('should accept formatted US numbers when defaultCountry is US', async () => {
    const handleSubmit = vi.fn()

    render(
      <Form
        id="test-phone-form"
        fields={[
          FormFieldClass.phone('phone', {
            label: 'Phone',
            defaultValue: '(503) 555-1234',
            defaultCountry: 'US',
          }),
          FormFieldClass.button('submit', {
            type: 'submit',
            text: 'Submit',
          }),
        ]}
        submit={handleSubmit}
      />
    )

    await screen.findByLabelText('Phone', {}, { timeout: 15000 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({ phone: '(503) 555-1234' })
    })
  })

  it('should reject invalid numbers even with defaultCountry set', async () => {
    const handleSubmit = vi.fn()

    render(
      <Form
        id="test-phone-form"
        fields={[
          FormFieldClass.phone('phone', {
            label: 'Phone',
            defaultValue: '123',
            defaultCountry: 'US',
          }),
          FormFieldClass.button('submit', {
            type: 'submit',
            text: 'Submit',
          }),
        ]}
        submit={handleSubmit}
      />
    )

    await screen.findByLabelText('Phone', {}, { timeout: 15000 })
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(
      () => {
        expect(handleSubmit).not.toHaveBeenCalled()
        expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })
})
