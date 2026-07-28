'use client'

import { useMemo } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import PhoneInput, { isPossiblePhoneNumber, type Country } from 'react-phone-number-input'
import clsx from 'clsx'
import { FormField, FormFieldProps, FormFieldType, useFormTheme, useFieldValidation } from '@nestledjs/forms-core'

// 'US' matches the library's original behaviour. E.164 numbers (+44..., +1...) pass
// regardless of this default, so international forms are unaffected.
const DEFAULT_PHONE_COUNTRY = 'US' as Country

function makePhoneValidator(defaultCountry?: string) {
  const country = (defaultCountry as Country | undefined) ?? DEFAULT_PHONE_COUNTRY
  return (val: string | null | undefined): string | boolean => {
    if (val == null || val === '') return true
    return isPossiblePhoneNumber(val.toString(), country) || 'Please enter a valid phone number'
  }
}

export function PhoneField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Phone }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme()

  const fieldWithPhoneValidation = useMemo(() => {
    if (field.options.validate) return field
    // showCountrySelect always produces E.164 values, so no defaultCountry needed for validation
    const country = field.options.showCountrySelect ? undefined : field.options.defaultCountry
    return {
      ...field,
      options: { ...field.options, validate: makePhoneValidator(country) },
    }
  }, [field])

  const validationRules = useFieldValidation(fieldWithPhoneValidation, form)

  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = useWatch({ control: form.control, name: field.key }) ?? ''

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <input
          id={field.key}
          type="tel"
          className={clsx(
            theme.phoneField.input,
            theme.phoneField.readOnlyInput,
            hasError && theme.phoneField.error
          )}
          disabled={true}
          value={value}
        />
      )
    }
    return (
      <div className={clsx(theme.phoneField.readOnlyValue)}>
        {value === undefined || value === null || value === '' ? '—' : value}
      </div>
    )
  }

  if (field.options.showCountrySelect) {
    return (
      <div>
        <Controller
          control={form.control}
          name={field.key}
          defaultValue={field.options.defaultValue ?? ''}
          rules={validationRules}
          render={({ field: { onChange, value: fieldValue, onBlur } }) => (
            <PhoneInput
              value={fieldValue}
              onChange={onChange}
              onBlur={onBlur}
              defaultCountry={field.options.defaultCountry as Country}
              placeholder={field.options.placeholder}
              disabled={field.options.disabled}
              className={clsx('flex', field.options.disabled && theme.phoneField.disabled)}
              numberInputProps={{
                className: clsx(
                  theme.phoneField.input,
                  field.options.disabled && theme.phoneField.disabled,
                  hasError && theme.phoneField.error
                ),
              }}
            />
          )}
        />
        {field.options.helpText && (
          <div className="text-xs text-gray-500">{field.options.helpText}</div>
        )}
      </div>
    )
  }

  return (
    <div>
      <input
        id={field.key}
        type="tel"
        placeholder={field.options.placeholder}
        className={clsx(
          theme.phoneField.input,
          field.options.disabled && theme.phoneField.disabled,
          hasError && theme.phoneField.error
        )}
        disabled={field.options.disabled}
        required={field.options.required}
        defaultValue={field.options.defaultValue}
        {...form.register(field.key, validationRules)}
      />
      {field.options.helpText && (
        <div className="text-xs text-gray-500">{field.options.helpText}</div>
      )}
    </div>
  )
}
