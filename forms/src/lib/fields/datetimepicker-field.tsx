'use client'

import clsx from 'clsx'
import { useEffect } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import {
  useFormTheme,
  FormField,
  FormFieldProps,
  FormFieldType,
  formatDateTimeFromValue,
  formatLocalDateTime,
  getDateTimeFromValue,
  parseLocalDateTime,
} from '@nestledjs/forms-core'

export function DateTimePickerField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.DateTimePicker }>> & {
  hasError?: boolean
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme().dateTimePicker
  const options = field.options

  // Normalize a full ISO default (e.g. with 'Z' or an offset) into the input's
  // local YYYY-MM-DDTHH:mm format. A datetime is a real instant, so conversion
  // to the viewer's local wall time is the correct behavior — and without this
  // the input renders blank while form state keeps the raw string.
  useEffect(() => {
    const current = form.getValues(field.key)
    if (typeof current === 'string' && current && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(current)) {
      const parsed = parseLocalDateTime(current)
      if (parsed) {
        form.setValue(field.key, formatLocalDateTime(parsed))
      }
    }
  }, [form, field.key])

  const isReadOnly = options.readOnly ?? formReadOnly
  const effectiveReadOnlyStyle = options.readOnlyStyle ?? formReadOnlyStyle
  const value = useWatch({ control: form.control, name: field.key }) ?? ''

  if (isReadOnly) {
    if (effectiveReadOnlyStyle === 'disabled') {
      return (
        <div className={clsx(theme.wrapper)}>
          <input
            id={field.key}
            type="datetime-local"
            disabled={true}
            value={value}
            className={clsx(theme.readOnlyInput, hasError && theme.error)}
            readOnly
          />
        </div>
      )
    }
    
    // Render as plain value (formatted)
    const formattedDateTime = formatDateTimeFromValue(value) ?? '—'
    return (
      <div className={clsx(theme.wrapper)}>
        <div className={clsx(theme.readOnlyValue)}>{formattedDateTime}</div>
      </div>
    )
  }

  const inputProps = {
    id: field.key,
    type: 'datetime-local' as const,
    disabled: options.disabled,
    placeholder: options.placeholder,
    min: options.min,
    max: options.max,
    step: options.step,
    className: clsx(
      theme.input,
      options.disabled && theme.disabled,
      hasError && theme.error
    ),
  }

  const input = options.useController ? (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={getDateTimeFromValue(options.defaultValue ?? '')}
      rules={{ required: options.required }}
      render={({ field: controllerField }) => (
        <input
          {...inputProps}
          required={options.required}
          value={controllerField.value || ''}
          onChange={(e) => controllerField.onChange(e.target.value)}
          onBlur={controllerField.onBlur}
          ref={controllerField.ref}
        />
      )}
    />
  ) : (
    <input
      {...inputProps}
      required={options.required}
      defaultValue={getDateTimeFromValue(options.defaultValue ?? '') ?? ''}
      {...form.register(field.key, {
        required: options.required,
        setValueAs: (v) => v || '',
      })}
    />
  )

  if (options.customWrapper) {
    return options.customWrapper(input)
  }

  return (
    <div className={clsx(theme.wrapper)}>
      {input}
    </div>
  )
}
