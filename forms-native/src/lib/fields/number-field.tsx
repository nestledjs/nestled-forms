import React from 'react'
import { TextInput, View, Text } from 'react-native'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function NumberField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.Number }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme()
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <TextInput
          nativeID={field.key}
          editable={false}
          value={String(value)}
          keyboardType="decimal-pad"
          style={[theme.numberField.input, theme.numberField.disabled, hasError && theme.numberField.error]}
          accessibilityLabel={field.options.label}
        />
      )
    }
    return (
      <View style={theme.numberField.readOnlyValue}>
        <Text style={{ fontSize: 16, color: '#374151' }}>
          {value === undefined || value === null || value === '' ? '—' : String(value)}
        </Text>
      </View>
    )
  }

  const handleChangeText = (text: string) => {
    // Filter to allow only numeric input (digits, decimal point, negative sign)
    const filtered = text.replace(/[^0-9.-]/g, '')

    // Parse to number
    const numValue = filtered === '' || filtered === '-' ? filtered : parseFloat(filtered)

    // Apply min/max constraints on blur, not during typing
    form.setValue(field.key, numValue === '' || isNaN(numValue as number) ? '' : numValue, { shouldValidate: true })
  }

  const handleBlur = () => {
    const currentValue = form.getValues(field.key)
    if (currentValue !== '' && currentValue !== undefined) {
      let numValue = typeof currentValue === 'string' ? parseFloat(currentValue) : currentValue
      if (!isNaN(numValue)) {
        if (field.options.min !== undefined && numValue < field.options.min) {
          numValue = field.options.min
        }
        if (field.options.max !== undefined && numValue > field.options.max) {
          numValue = field.options.max
        }
        form.setValue(field.key, numValue)
      }
    }
    form.trigger(field.key)
  }

  return (
    <>
      <TextInput
        nativeID={field.key}
        editable={!field.options.disabled}
        placeholder={field.options.placeholder}
        placeholderTextColor="#9ca3af"
        defaultValue={field.options.defaultValue !== undefined ? String(field.options.defaultValue) : undefined}
        keyboardType="decimal-pad"
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        style={[
          theme.numberField.input,
          field.options.disabled && theme.numberField.disabled,
          hasError && theme.numberField.error,
        ]}
        accessibilityLabel={field.options.label}
      />
      {field.options.helpText && <Text style={theme.numberField.helpText}>{field.options.helpText}</Text>}
    </>
  )
}
