import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { Controller, useWatch } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let Dropdown: any = null
try {
  Dropdown = require('react-native-element-dropdown').Dropdown
} catch {
  // not installed
}

function singleSelectSubmitTransform(value: any): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'value' in value) return value.value
  return String(value)
}

export function SelectFieldSearchApollo<
  TDataItem extends { id: string; name?: string }
>({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.SearchSelectApollo }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme().searchSelect
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle

  field.options.submitTransform ??= singleSelectSubmitTransform

  // Try to use Apollo search — this requires @apollo/client to be installed
  let apolloOptions: any[] = []
  let apolloLoading = false
  let handleSearchChange: (search: string) => void = () => {}

  try {
    // Dynamic import of useApolloSearch from forms web or consumer's implementation
    // For now, provide a fallback that uses initialOptions
    apolloOptions = field.options.initialOptions ?? []
  } catch {
    // Apollo not available
  }

  const watchedValue = useWatch({
    control: form.control,
    name: field.key,
  })

  const selectedOption = useMemo(() => {
    if (!watchedValue) return null
    if (watchedValue && typeof watchedValue === 'object' && 'value' in watchedValue && 'label' in watchedValue) {
      return watchedValue
    }
    if (typeof watchedValue === 'string') {
      const found = apolloOptions.find(o => o.value === watchedValue)
      return found || { value: watchedValue, label: watchedValue }
    }
    return { value: String(watchedValue), label: String(watchedValue) }
  }, [watchedValue, apolloOptions])

  if (!Dropdown) {
    return (
      <View style={theme.container}>
        <Text style={theme.placeholder}>
          Install react-native-element-dropdown to use SelectFieldSearchApollo
        </Text>
      </View>
    )
  }

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <Dropdown
          data={apolloOptions}
          labelField="label"
          valueField="value"
          value={selectedOption?.value}
          disable={true}
          search
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
            data={apolloOptions}
            labelField="label"
            valueField="value"
            value={selectedOption?.value}
            search
            searchPlaceholder="Search..."
            onChangeText={handleSearchChange}
            onChange={(item: { value: string; label: string }) => {
              controllerField.onChange(item)
              if (form.trigger) form.trigger(field.key)
            }}
            onBlur={controllerField.onBlur}
            disable={field.options.disabled}
            placeholder={(field.options as any).placeholder || 'Search...'}
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
