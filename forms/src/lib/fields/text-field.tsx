'use client'

import clsx from 'clsx'
import { FormField, FormFieldProps, FormFieldType, useFormTheme, useFieldValidation } from '@nestledjs/forms-core'
import { fieldA11yProps } from './field-a11y'
import { useWatch } from 'react-hook-form'

export function TextField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Text }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme()

  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = useWatch({ control: form.control, name: field.key }) ?? ''

  // Get validation rules including Zod schema and cross-field validation
  const validationRules = useFieldValidation(
    field,
    form
  )

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <>
          <input
            id={field.key}
            type="text"
            className={clsx(
              theme.textField.input,
              hasError && theme.textField.error,
              theme.textField.disabled
            )}
            disabled={true}
            value={value}
          />
          {field.options.helpText && (
            <div id={`${field.key}-help`} className={clsx(theme.textField.helpText)}>{field.options.helpText}</div>
          )}
        </>
      )
    }
    // Render as plain value
    return (
      <>
        <div className={theme.textField.readOnly}>{value || '—'}</div>
        {field.options.helpText && (
          <div id={`${field.key}-help`} className={clsx(theme.textField.helpText)}>{field.options.helpText}</div>
        )}
      </>
    )
  }

  return (
    <>
      <input
        id={field.key}
        type="text"
        disabled={field.options.disabled}
        autoComplete="on"
        placeholder={field.options.placeholder}
        defaultValue={field.options.defaultValue}
        required={field.options.required}
        {...form.register(field.key, validationRules)}
        {...fieldA11yProps(field.key, hasError, field.options.helpText)}
        className={clsx(
          theme.textField.input,
          field.options.disabled && theme.textField.disabled,
          hasError && theme.textField.error
        )}
      />
      {field.options.helpText && (
        <div id={`${field.key}-help`} className={clsx(theme.textField.helpText)}>{field.options.helpText}</div>
      )}
    </>
  )
}
