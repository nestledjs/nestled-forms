'use client'

import clsx from 'clsx'
import { FormField, FormFieldProps, FormFieldType, useFormTheme } from '@nestledjs/forms-core'
import { fieldA11yProps } from './field-a11y'

export function TextAreaField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.TextArea }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme()
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <>
          <textarea
            rows={field.options.rows ?? 4}
            id={field.key}
            className={clsx(
              theme.textAreaField.textarea,
              theme.textAreaField.disabled,
              hasError && theme.textAreaField.error
            )}
            disabled={true}
            value={value}
          />
          {field.options.helpText && (
            <div id={`${field.key}-help`} className={clsx(theme.textAreaField.helpText)}>{field.options.helpText}</div>
          )}
        </>
      )
    }
    // Render as plain value
    return (
      <>
        <div className={theme.textAreaField.readOnlyValue}>{value || '—'}</div>
        {field.options.helpText && (
          <div id={`${field.key}-help`} className={clsx(theme.textAreaField.helpText)}>{field.options.helpText}</div>
        )}
      </>
    )
  }

  return (
    <>
      <textarea
        rows={field.options.rows ?? 4}
        id={field.key}
        disabled={field.options.disabled}
        placeholder={field.options.placeholder}
        defaultValue={field.options.defaultValue}
        required={field.options.required}
        className={clsx(
          theme.textAreaField.textarea,
          field.options.disabled && theme.textAreaField.disabled,
          hasError && theme.textAreaField.error
        )}
        {...form.register(field.key, { required: field.options.required })}
        {...fieldA11yProps(field.key, hasError, field.options.helpText)}
      />
      {field.options.helpText && (
        <div id={`${field.key}-help`} className={clsx(theme.textAreaField.helpText)}>{field.options.helpText}</div>
      )}
    </>
  )
}
