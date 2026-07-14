'use client'

import clsx from 'clsx'
import { FormField, FormFieldProps, FormFieldType, useFormTheme, useFieldValidation } from '@nestledjs/forms-core'
import { fieldA11yProps } from './field-a11y'

export function NumberField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Number }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme()
  const validationRules = useFieldValidation(field, form)
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <input
          id={field.key}
          type="number"
          className={clsx(
            theme.numberField.input,
            theme.numberField.readOnlyInput,
            hasError && theme.numberField.error
          )}
          disabled={true}
          value={value}
          min={field.options.min}
          max={field.options.max}
          step={field.options.step}
        />
      )
    }
    // Render as plain value
    return (
      <div className={clsx(theme.numberField.readOnlyValue)}>
        {value === undefined || value === null || value === '' ? '—' : value}
      </div>
    )
  }

  return (
    <div>
      <input
        id={field.key}
        type="number"
        placeholder={field.options.placeholder}
        className={clsx(
          theme.numberField.input,
          field.options.disabled && theme.numberField.disabled,
          hasError && theme.numberField.error
        )}
        disabled={field.options.disabled}
        required={field.options.required}
        min={field.options.min}
        max={field.options.max}
        step={field.options.step}
        defaultValue={field.options.defaultValue}
        {...form.register(field.key, {
          ...validationRules,
          setValueAs: (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
          valueAsDate: false,
          pattern: undefined,
        })}
        {...fieldA11yProps(field.key, hasError, field.options.helpText)}
      />
      {field.options.helpText && (
        <div id={`${field.key}-help`} className="text-xs text-gray-500">{field.options.helpText}</div>
      )}
    </div>
  )
}
