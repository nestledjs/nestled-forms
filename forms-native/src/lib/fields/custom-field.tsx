import React from 'react'
import { View, Text, TextInput } from 'react-native'
import { FormField, FormFieldProps, FormFieldType, CustomFieldRenderProps } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function CustomField<T = unknown>({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.Custom }>> & {
  hasError?: boolean
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme().customField
  const options = field.options
  const isReadOnly = options.readOnly ?? formReadOnly
  const effectiveReadOnlyStyle = options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? options.defaultValue

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
      return (
        <View style={theme.wrapper}>
          <TextInput editable={false} value={displayValue} style={{ fontSize: 16, color: '#9ca3af' }} />
        </View>
      )
    }

    return (
      <View style={theme.wrapper}>
        <View style={theme.readOnlyValue}>
          <Text style={{ fontSize: 16, color: '#374151' }}>{displayValue}</Text>
        </View>
      </View>
    )
  }

  const renderProps: CustomFieldRenderProps<T> = {
    value: value as T,
    onChange: (newValue: T) => {
      form.setValue(field.key, newValue)
      form.trigger(field.key)
    },
    field: field as any,
  }

  try {
    const customFieldContent = options.customField(renderProps)

    if (options.customWrapper) {
      return options.customWrapper(customFieldContent)
    }

    return (
      <View style={theme.wrapper}>
        {customFieldContent}
      </View>
    )
  } catch (error) {
    console.error('Error rendering custom field:', error)
    return (
      <View style={theme.wrapper}>
        <Text style={theme.errorText}>
          Error rendering custom field: {field.key}
        </Text>
      </View>
    )
  }
}

CustomField.displayName = 'CustomField'
