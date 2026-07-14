import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text } from 'react-native'
import { Controller, useWatch } from 'react-hook-form'
import {
  FormField,
  FormFieldProps,
  FormFieldType,
  SearchSelectOption,
  useSearchSelect,
  useFormConfig,
} from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let MultiSelect: any = null
try {
  MultiSelect = require('react-native-element-dropdown').MultiSelect
} catch {
  // not installed
}

export { multiSelectSubmitTransform } from '@nestledjs/forms-core'

/**
 * @deprecated Use multiSelectSubmitTransform instead. This alias is kept for backward compatibility.
 */
export { multiSelectSubmitTransform as apolloMultiSelectSubmitTransform } from '@nestledjs/forms-core'

type RequiredItemShape = { id: string; name?: string; firstName?: string; lastName?: string }

export function SelectFieldMultiSearchApollo<TDataItem extends RequiredItemShape>({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.SearchSelectMultiApollo }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme().multiSelect
  const { strings } = useFormConfig()
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const { options: apolloOptions, handleSearchChange } = useSearchSelect<TDataItem>(field.options)
  const [selectedOptionsCache, setSelectedOptionsCache] = useState<Map<string, SearchSelectOption>>(new Map())

  const watchedValue = useWatch({ control: form.control, name: field.key })

  const processedValue: string[] = useMemo(() => {
    const value = watchedValue ?? []
    if (!Array.isArray(value)) return []
    return value.map((item: any) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object' && 'value' in item) return String(item.value)
      return String(item)
    })
  }, [watchedValue])

  useEffect(() => {
    if (apolloOptions.length > 0) {
      setSelectedOptionsCache(prev => {
        let hasChanges = false
        for (const option of apolloOptions) {
          if (!prev.has(option.value)) { hasChanges = true; break }
        }
        if (!hasChanges) return prev
        const next = new Map(prev)
        apolloOptions.forEach(o => next.set(o.value, o))
        return next
      })
    }
  }, [apolloOptions])

  // Build display options from cache + apollo (must be before early returns for hooks rules)
  const allOptions = useMemo(() => {
    const map = new Map<string, SearchSelectOption>()
    selectedOptionsCache.forEach((v, k) => map.set(k, v))
    apolloOptions.forEach(o => map.set(o.value, o))
    return Array.from(map.values())
  }, [apolloOptions, selectedOptionsCache])

  const findOrCreateOption = useCallback((id: string): SearchSelectOption => {
    const opt = allOptions.find(o => o.value === id)
    return opt || { value: id, label: id }
  }, [allOptions])

  if (!MultiSelect) {
    return (
      <View style={theme.container}>
        <Text style={theme.placeholder}>
          Install react-native-element-dropdown to use SelectFieldMultiSearchApollo
        </Text>
      </View>
    )
  }

  if (isReadOnly) {
    const selectedLabels = processedValue
      .map(v => allOptions.find(o => o.value === v)?.label ?? v)

    if (readOnlyStyle === 'disabled') {
      return (
        <MultiSelect
          data={allOptions}
          labelField="label"
          valueField="value"
          value={processedValue}
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
      render={({ field: controllerField }) => (
        <View style={theme.wrapper}>
          <MultiSelect
            data={allOptions}
            labelField="label"
            valueField="value"
            value={processedValue}
            search
            searchPlaceholder={strings.searchPlaceholder}
            onChangeText={handleSearchChange}
            onChange={(items: string[]) => {
              const itemObjects = items.map(item => findOrCreateOption(item))
              controllerField.onChange(itemObjects)
              if (form.trigger) form.trigger(field.key)
            }}
            disable={field.options.disabled}
            placeholder={(field.options as any).placeholder || strings.searchPlaceholder}
            style={[theme.container, field.options.disabled && theme.disabled, hasError && theme.error]}
            placeholderStyle={theme.placeholder}
            accessibilityLabel={field.options.label}
          />
          {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
        </View>
      )}
    />
  )
}
