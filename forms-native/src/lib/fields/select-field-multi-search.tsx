import React from 'react'
import { View, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType, useFormConfig } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let MultiSelect: any = null
try {
  MultiSelect = require('react-native-element-dropdown').MultiSelect
} catch {
  // not installed
}

function normalizeToString(v: any): string {
  if (typeof v === 'string') return v
  if (v?.value !== undefined) return String(v.value)
  return String(v)
}

export function SelectFieldMultiSearch({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.SearchSelectMulti }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme().multiSelect
  const { strings } = useFormConfig()
  const options = (field.options.options || []).map(o => ({ label: o.label, value: o.value }))
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  if (!MultiSelect) {
    return (
      <View style={theme.container}>
        <Text style={theme.placeholder}>
          Install react-native-element-dropdown to use SelectFieldMultiSearch
        </Text>
      </View>
    )
  }

  if (isReadOnly) {
    const value = form.getValues(field.key) ?? []
    const selectedValues = Array.isArray(value) ? value.map(normalizeToString) : []
    const selectedLabels = options.filter(o => selectedValues.includes(o.value)).map(o => o.label)

    if (readOnlyStyle === 'disabled') {
      return (
        <MultiSelect
          data={options}
          labelField="label"
          valueField="value"
          value={selectedValues}
          disable={true}
          search
          style={[theme.container, theme.disabled]}
          onChange={() => {}}
        />
      )
    }
    return (
      <View style={theme.readOnlyValue}>
        <Text style={{ fontSize: 16, color: '#374151' }}>{selectedLabels.join(', ') || '—'}</Text>
      </View>
    )
  }

  return (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={field.options.defaultValue ?? []}
      rules={{ required: field.options.required }}
      render={({ field: controllerField }) => {
        const selectedValues = Array.isArray(controllerField.value)
          ? controllerField.value.map(normalizeToString)
          : []

        return (
          <View style={theme.wrapper}>
            <MultiSelect
              data={options}
              labelField="label"
              valueField="value"
              value={selectedValues}
              search
              searchPlaceholder={strings.searchPlaceholder}
              onChange={(items: string[]) => {
                controllerField.onChange(items)
                if (form.trigger) form.trigger(field.key)
              }}
              disable={field.options.disabled}
              placeholder={field.options.placeholder || strings.searchPlaceholder}
              style={[theme.container, field.options.disabled && theme.disabled, hasError && theme.error]}
              placeholderStyle={theme.placeholder}
              accessibilityLabel={field.options.label}
            />
            {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
          </View>
        )
      }}
    />
  )
}
