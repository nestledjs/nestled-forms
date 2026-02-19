import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function CustomCheckboxField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.CustomCheckbox }>> & {
  hasError?: boolean
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme().customCheckbox
  const options = field.options
  const isReadOnly = options.readOnly ?? formReadOnly
  const effectiveReadOnlyStyle = options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key)

  const checkedIcon = options.checkedIcon ?? <Text style={{ fontSize: 20 }}>☑</Text>
  const uncheckedIcon = options.uncheckedIcon ?? <Text style={{ fontSize: 20 }}>☐</Text>

  const labelNode = options.label ? (
    <Text style={theme.label}>
      {options.label}
      {options.required && <Text style={{ color: '#dc2626' }}> *</Text>}
    </Text>
  ) : null

  const helpTextNode = options.helpText ? (
    <Text style={theme.helpText}>{options.helpText}</Text>
  ) : null

  if (isReadOnly) {
    if (effectiveReadOnlyStyle === 'disabled') {
      return (
        <View style={theme.wrapper}>
          <View style={theme.row}>
            <View style={[theme.checkboxContainer, theme.disabled]}>
              {value ? checkedIcon : uncheckedIcon}
            </View>
            {labelNode}
          </View>
          {helpTextNode}
        </View>
      )
    }
    return (
      <View style={theme.wrapper}>
        <Text style={theme.readOnly}>{value ? 'Yes' : 'No'}</Text>
      </View>
    )
  }

  return (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={options.defaultValue}
      rules={{ required: options.required }}
      render={({ field: controllerField }) => (
        <View style={theme.wrapper}>
          <View style={theme.row}>
            <Pressable
              onPress={() => !options.disabled && controllerField.onChange(!controllerField.value)}
              style={[theme.checkboxContainer, options.disabled && theme.disabled]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !!controllerField.value, disabled: options.disabled }}
            >
              {controllerField.value ? checkedIcon : uncheckedIcon}
            </Pressable>
            {labelNode}
          </View>
          {helpTextNode}
        </View>
      )}
    />
  )
}
