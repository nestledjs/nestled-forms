import React from 'react'
import { View, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let Dropdown: any = null
try {
  Dropdown = require('react-native-element-dropdown').Dropdown
} catch {
  // react-native-element-dropdown not installed
}

export function SelectFieldSearch({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.SearchSelect }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme().searchSelect
  const options = field.options.options || []
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key)

  if (!Dropdown) {
    return (
      <View style={theme.container}>
        <Text style={theme.placeholder}>
          Install react-native-element-dropdown to use SelectFieldSearch
        </Text>
      </View>
    )
  }

  if (isReadOnly) {
    const selectedOption = options.find(o => o.value === value)
    if (readOnlyStyle === 'disabled') {
      return (
        <Dropdown
          data={options.map(o => ({ label: o.label, value: o.value }))}
          labelField="label"
          valueField="value"
          value={value}
          disable={true}
          search
          placeholder={field.options.placeholder || 'Search...'}
          style={[theme.container, theme.disabled]}
          onChange={() => {}}
        />
      )
    }
    return (
      <View style={theme.readOnlyValue}>
        <Text style={{ fontSize: 16, color: '#374151' }}>{selectedOption?.label || '—'}</Text>
      </View>
    )
  }

  return (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={field.options.defaultValue}
      rules={{ required: field.options.required }}
      render={({ field: controllerField }) => (
        <View style={theme.wrapper}>
          <Dropdown
            data={options.map(o => ({ label: o.label, value: o.value }))}
            labelField="label"
            valueField="value"
            value={controllerField.value}
            search
            searchPlaceholder="Search..."
            onChange={(item: { value: string }) => {
              controllerField.onChange(item.value)
              if (form.trigger) form.trigger(field.key)
            }}
            onBlur={controllerField.onBlur}
            disable={field.options.disabled}
            placeholder={field.options.placeholder || 'Search...'}
            style={[theme.container, field.options.disabled && theme.disabled, hasError && theme.error]}
            placeholderStyle={theme.placeholder}
            inputSearchStyle={theme.inputSearch}
            accessibilityLabel={field.options.label}
          />
          {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
        </View>
      )}
    />
  )
}
