import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType, CheckboxGroupOption, CheckboxGroupOptions } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let ExpoCheckbox: any = null
try {
  ExpoCheckbox = require('expo-checkbox').default
} catch {
  // expo-checkbox not available
}

function FallbackCheckbox({ value, onValueChange, disabled, color }: {
  value: boolean
  onValueChange: (val: boolean) => void
  disabled?: boolean
  color?: string
}) {
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={{
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: value ? (color || '#0284c7') : '#d1d5db',
        borderRadius: 4,
        backgroundColor: value ? (color || '#0284c7') : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
    >
      {value && (
        <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>✓</Text>
      )}
    </Pressable>
  )
}

const stringToArray = (value: string | null | undefined, separator: string): string[] => {
  if (!value || value.trim() === '') return []
  return value.split(separator).map(v => v.trim()).filter(v => v !== '')
}

const arrayToString = (values: string[], separator: string): string => {
  return values.join(separator)
}

export function CheckboxGroupField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.CheckboxGroup }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme()
  const groupTheme = theme.checkboxGroup
  const options: CheckboxGroupOptions = field.options
  const isReadOnly = options.readOnly ?? formReadOnly
  const readOnlyStyle = options.readOnlyStyle ?? formReadOnlyStyle
  const separator = options.valueSeparator ?? ','
  const CheckboxComponent = ExpoCheckbox || FallbackCheckbox

  if (isReadOnly) {
    const value = form.getValues(field.key)
    const selectedValues = stringToArray(value, separator)
    const selectedOptions = options.checkboxOptions.filter(opt =>
      selectedValues.includes(String(opt.value))
    )

    if (readOnlyStyle === 'disabled') {
      return (
        <View style={groupTheme.wrapper}>
          <View style={options.checkboxDirection === 'row' ? groupTheme.containerRow : groupTheme.containerColumn}>
            {options.checkboxOptions.map((option: CheckboxGroupOption) => {
              const isChecked = selectedValues.includes(String(option.value))
              return (
                <View key={option.key} style={groupTheme.optionContainer}>
                  <CheckboxComponent
                    value={isChecked}
                    onValueChange={() => {}}
                    disabled={true}
                    color={isChecked ? '#0284c7' : undefined}
                  />
                  <Text style={[groupTheme.label, groupTheme.disabled]}>{option.label}</Text>
                </View>
              )
            })}
          </View>
        </View>
      )
    }

    return (
      <View>
        {selectedOptions.length > 0 ? (
          selectedOptions.map((option) => (
            <Text key={option.key} style={groupTheme.readOnlySelected}>✓ {option.label}</Text>
          ))
        ) : (
          <Text style={groupTheme.readOnlyUnselected}>No options selected</Text>
        )}
      </View>
    )
  }

  return (
    <Controller
      control={form.control}
      name={field.key}
      defaultValue={options.defaultValue || ''}
      rules={{ required: options.required }}
      render={({ field: { onChange, value } }) => {
        const selectedValues = stringToArray(value, separator)

        const handleCheckboxChange = (optionValue: string | number, isChecked: boolean) => {
          const valueStr = String(optionValue)
          let newSelectedValues: string[]
          if (isChecked) {
            newSelectedValues = selectedValues.includes(valueStr)
              ? selectedValues
              : [...selectedValues, valueStr]
          } else {
            newSelectedValues = selectedValues.filter(v => v !== valueStr)
          }
          onChange(arrayToString(newSelectedValues, separator))
        }

        return (
          <View style={groupTheme.wrapper}>
            <View style={options.checkboxDirection === 'row' ? groupTheme.containerRow : groupTheme.containerColumn}>
              {options.checkboxOptions.map((option: CheckboxGroupOption) => {
                if (option.hidden) return null
                const isChecked = selectedValues.includes(String(option.value))
                return (
                  <View key={option.key} style={groupTheme.optionContainer}>
                    <CheckboxComponent
                      value={isChecked}
                      onValueChange={(val: boolean) => handleCheckboxChange(option.value, val)}
                      disabled={!!options.disabled}
                      color={isChecked ? '#0284c7' : undefined}
                    />
                    <Text style={[groupTheme.label, options.disabled && groupTheme.disabled]}>
                      {option.label}
                    </Text>
                  </View>
                )
              })}
            </View>
          </View>
        )
      }}
    />
  )
}
