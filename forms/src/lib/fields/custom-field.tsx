'use client'

import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useWatch } from 'react-hook-form'
import { useFormTheme, FormField, FormFieldProps, FormFieldType, CustomFieldRenderProps } from '@nestledjs/forms-core'

export function CustomField<T = unknown>({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Custom }>> & {
  hasError?: boolean
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme().customField
  const options = field.options
  const isReadOnly = options.readOnly ?? formReadOnly
  const effectiveReadOnlyStyle = options.readOnlyStyle ?? formReadOnlyStyle
  // useWatch subscribes to this field, so the render prop receives the current value
  // after onChange/setValue/reset. getValues() is a one-shot read and never re-renders.
  const watchedValue = useWatch({ control: form.control, name: field.key })
  const value = watchedValue ?? options.defaultValue

  if (isReadOnly) {
    let displayValue: string
    if (value === undefined || value === null || value === '') {
      displayValue = '—'
    } else if (typeof value === 'string') {
      displayValue = value
    } else {
      try {
        displayValue = JSON.stringify(value)
      } catch {
        displayValue = String(value)
      }
    }
    
    if (effectiveReadOnlyStyle === 'disabled') {
      // Render as disabled input (fallback to string value)
      return (
        <div className={clsx(theme.wrapper)}>
          <input
            type="text"
            disabled={true}
            value={displayValue}
            className={clsx(theme.readOnlyInput)}
            readOnly
          />
        </div>
      )
    }
    
    // Render as plain value
    return (
      <div className={clsx(theme.wrapper)}>
        <div className={clsx(theme.readOnlyValue)}>{displayValue}</div>
      </div>
    )
  }

  // Create render props for the custom field
  const renderProps: CustomFieldRenderProps<T> = {
    value: value as T,
    onChange: (newValue: T) => {
      form.setValue(field.key, newValue, { shouldDirty: true, shouldTouch: true })
      // Trigger validation if the field has validation rules
      form.trigger(field.key)
    },
    field: field,
  }

  // Only the caller's callbacks run inside the try. React renders returned JSX later, so a try
  // around building it catches nothing more; the wrapper markup itself can't throw.
  let content: ReactNode = null
  let wrapped = false
  let wrappedContent: ReturnType<NonNullable<typeof options.customWrapper>> | undefined
  let failed = false
  let renderError: unknown
  try {
    // Render the custom field component with the render props
    content = options.customField(renderProps)

    if (options.customWrapper) {
      wrappedContent = options.customWrapper(content)
      wrapped = true
    }
  } catch (error) {
    failed = true
    renderError = error
  }

  if (failed) {
    console.error('Error rendering custom field:', renderError)
    return (
      <div className={clsx(theme.wrapper)}>
        <div className={clsx(theme.errorContainer)}>
          <div className={clsx(theme.errorText)}>
            Error rendering custom field: {field.key}
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className={clsx(theme.errorText, 'mt-1 text-xs')}>
              {renderError instanceof Error ? renderError.message : String(renderError)}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (wrapped) {
    // Keeps the component's JSX.Element return type, which customWrapper's own return type matches
    return wrappedContent as ReturnType<NonNullable<typeof options.customWrapper>>
  }

  return <div className={clsx(theme.wrapper)}>{content}</div>
}

CustomField.displayName = 'CustomField'
