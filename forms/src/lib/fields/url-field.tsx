'use client'

import clsx from 'clsx'
import { FormField, FormFieldProps, FormFieldType, useFormTheme, useFieldValidation } from '@nestledjs/forms-core'
import { fieldA11yProps } from './field-a11y'
import { useWatch } from 'react-hook-form'

export function UrlField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Url }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme()
  const validationRules = useFieldValidation(field, form)
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = useWatch({ control: form.control, name: field.key }) ?? ''

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <>
          <input
            id={field.key}
            type="url"
            className={clsx(
              theme.urlField.input,
              theme.urlField.disabled,
              hasError && theme.urlField.error
            )}
            disabled={true}
            value={value}
          />
          {field.options.helpText && (
            <div id={`${field.key}-help`} className={clsx(theme.urlField.helpText)}>{field.options.helpText}</div>
          )}
        </>
      )
    }
    // Render as plain value
    return (
      <>
        <div className={theme.urlField.readOnlyValue}>{value || '—'}</div>
        {field.options.helpText && (
          <div id={`${field.key}-help`} className={clsx(theme.urlField.helpText)}>{field.options.helpText}</div>
        )}
      </>
    )
  }

  return (
    <>
      <input
        id={field.key}
        type="url"
        disabled={field.options.disabled}
        placeholder={field.options.placeholder}
        defaultValue={field.options.defaultValue}
        required={field.options.required}
        {...form.register(field.key, validationRules)}
        {...fieldA11yProps(field.key, hasError, field.options.helpText)}
        className={clsx(
          theme.urlField.input,
          field.options.disabled && theme.urlField.disabled,
          hasError && theme.urlField.error
        )}
      />
      {field.options.helpText && (
        <div id={`${field.key}-help`} className={clsx(theme.urlField.helpText)}>{field.options.helpText}</div>
      )}
    </>
  )
}
