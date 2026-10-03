import React from 'react'
import { View, Text } from 'react-native'
import { Controller, useWatch } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType, useFormConfig, useLoadOptions } from '@nestledjs/forms-core'
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
  const staticOptions = field.options.options || []
  // loadOptions mode: async source with internal debounce (native dropdowns
  // don't debounce their search input themselves)
  const asyncSearch = useLoadOptions(field.options.loadOptions, staticOptions, field.options.searchDebounceMs ?? 300)
  const usingLoadOptions = !!field.options.loadOptions
  const onSearchText = usingLoadOptions ? asyncSearch.handleSearchChange : field.options.onSearchChange
  const options = (usingLoadOptions ? asyncSearch.options : staticOptions).map(o => ({ label: o.label, value: o.value }))
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  // hoisted above the early return below so the hook order stays stable
  const watchedValue = useWatch({ control: form.control, name: field.key })
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
    const value = watchedValue ?? []
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
              onChangeText={onSearchText}
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
