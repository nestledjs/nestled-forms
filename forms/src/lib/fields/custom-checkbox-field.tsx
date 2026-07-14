'use client'

import clsx from 'clsx'
import React from 'react'
import { Controller } from 'react-hook-form'
import { useFormTheme, useFormConfig, FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'

// Helper to render the disabled style checkbox
function renderDisabledCheckbox(
  theme: any,
  hasError: boolean | undefined,
  value: any,
  checkedIcon: React.ReactNode,
  uncheckedIcon: React.ReactNode
) {
  return (
    <div className={clsx(theme.checkboxContainer)}>
      <span
        data-testid="custom-checkbox-icon"
        className={clsx(
          theme.customCheckbox,
          hasError && theme.error,
          theme.disabled,
          value && theme.checked
        )}
      >
        {value ? checkedIcon : uncheckedIcon}
      </span>
    </div>
  )
}

// Helper to render the icon-based read-only display
function renderReadOnlyIcon(icon: React.ReactNode, value: any, yes: string, no: string) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {icon}
      <span className="sr-only">{value ? yes : no}</span>
    </span>
  )
}

// Helper to render plain text read-only value
function renderReadOnlyText(theme: any, value: any, yes: string, no: string) {
  return <div className={theme.readOnly}>{value ? yes : no}</div>
}

// Icons config for read-only rendering
interface ReadOnlyIcons {
  checked: React.ReactNode
  unchecked: React.ReactNode
  readonlyChecked: React.ReactNode
  readonlyUnchecked: React.ReactNode
}

// Helper to determine the read-only content based on style and icons
function getReadOnlyContent(
  effectiveReadOnlyStyle: string,
  theme: any,
  hasError: boolean | undefined,
  value: any,
  icons: ReadOnlyIcons,
  strings: { readOnlyYes: string; readOnlyNo: string }
) {
  if (effectiveReadOnlyStyle === 'disabled') {
    return renderDisabledCheckbox(theme, hasError, value, icons.checked, icons.unchecked)
  }

  if (effectiveReadOnlyStyle === 'value') {
    return renderReadOnlyText(theme, value, strings.readOnlyYes, strings.readOnlyNo)
  }

  // Icon-based display
  if (value && icons.readonlyChecked) {
    return renderReadOnlyIcon(icons.readonlyChecked, value, strings.readOnlyYes, strings.readOnlyNo)
  }

  if (!value && icons.readonlyUnchecked) {
    return renderReadOnlyIcon(icons.readonlyUnchecked, value, strings.readOnlyYes, strings.readOnlyNo)
  }

  // Fallback to text
  return renderReadOnlyText(theme, value, strings.readOnlyYes, strings.readOnlyNo)
}

export function CustomCheckboxField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.CustomCheckbox }>> & {
  hasError?: boolean
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme().customCheckbox
  const { strings } = useFormConfig()
  const options = field.options
  const isReadOnly = options.readOnly ?? formReadOnly
  const effectiveReadOnlyStyle = options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key)

  const labelNode = options.label ? (
    <label
      htmlFor={field.key}
      className={clsx(theme.label, options.fullWidthLabel && theme.fullWidthLabel)}
    >
      {options.label}
      {options.required && <span style={{ color: 'red', marginLeft: 2 }}>*</span>}
    </label>
  ) : null

  const helpTextNode = options.helpText ? <div className={clsx(theme.helpText)}>{options.helpText}</div> : null

  // Determine which icons to use (options override theme defaults)
  const checkedIcon = options.checkedIcon ?? theme.checkedIcon
  const uncheckedIcon = options.uncheckedIcon ?? theme.uncheckedIcon
  const readonlyCheckedIcon = options.readonlyCheckedIcon ?? theme.readonlyCheckedIcon
  const readonlyUncheckedIcon = options.readonlyUncheckedIcon ?? theme.readonlyUncheckedIcon

  if (isReadOnly) {
    const readOnlyContent = getReadOnlyContent(
      effectiveReadOnlyStyle,
      theme,
      hasError,
      value,
      { checked: checkedIcon, unchecked: uncheckedIcon, readonlyChecked: readonlyCheckedIcon, readonlyUnchecked: readonlyUncheckedIcon },
      strings
    )

    return (
      <div className={clsx(theme.wrapper, options.wrapperClassNames)}>
        <div className={clsx(options.fullWidthLabel ? theme.rowFullWidth : theme.row)}>
          {readOnlyContent}
          {labelNode}
        </div>
        {helpTextNode}
      </div>
    )
  }

  const input = (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={options.defaultValue}
      rules={{ required: options.required }}
      render={({ field: controllerField }) => (
        <div className={clsx(theme.checkboxContainer)}>
          <input
            id={field.key}
            type="checkbox"
            checked={!!controllerField.value}
            onChange={e => controllerField.onChange(e.target.checked)}
            disabled={options.disabled}
            className={clsx(theme.hiddenInput)}
            aria-invalid={hasError}
            aria-checked={!!controllerField.value}
            aria-disabled={options.disabled}
            required={options.required}
          />
          <span
            className={clsx(
              theme.customCheckbox,
              options.disabled && theme.disabled,
              hasError && theme.error,
              controllerField.value === true && theme.checked
            )}
          >
            {controllerField.value === true ? checkedIcon : uncheckedIcon}
          </span>
        </div>
      )}
    />
  )

  if (options.customWrapper) {
    let elements
    if (options.fullWidthLabel) {
      elements = [labelNode, input]
    } else {
      elements = [input, labelNode]
    }
    return options.customWrapper(elements)
  }

  return (
    <div key={`${field.key}_wrapper`} className={clsx(theme.wrapper, options.wrapperClassNames)}>
      <div className={clsx(options.fullWidthLabel ? theme.rowFullWidth : theme.row)}>
        {input}
        {labelNode}
      </div>
      {helpTextNode}
    </div>
  )
} 