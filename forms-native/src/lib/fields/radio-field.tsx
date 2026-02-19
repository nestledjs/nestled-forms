import { useEffect, useState } from 'react'
import { View, Text, Pressable, TextInput } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormFieldProps, FormField, FormFieldType, RadioOption, RadioFormFieldOptions } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function RadioField(
  props: FormFieldProps<Extract<FormField, { type: FormFieldType.Radio }>> & {
    formReadOnly?: boolean
    formReadOnlyStyle?: 'value' | 'disabled'
  },
) {
  const theme = useNativeTheme()
  const [subOptionKey, setSubOptionKey] = useState<string>()
  const [subOptionValue, setSubOptionValue] = useState<string>('')
  const options: RadioFormFieldOptions = props.field?.options

  useEffect(() => {
    const currentValue = props.form.getValues(props.field.key)
    if (options?.defaultValue !== undefined && (currentValue === undefined || currentValue === '')) {
      const defaultOption = options?.radioOptions?.find((o: RadioOption) => o.value === options?.defaultValue)
      if (defaultOption?.value) {
        props.form.setValue(props.field.key, defaultOption.value)
      }
      if (options?.defaultSubValue !== undefined && defaultOption?.checkedSubOption) {
        setSubOptionKey(defaultOption.checkedSubOption.key)
        setSubOptionValue(options.defaultSubValue)
        props.form.setValue(defaultOption.checkedSubOption.key, options.defaultSubValue)
      }
    }
  }, [options?.defaultValue, options?.defaultSubValue, props.field.key])

  const isReadOnly = options.readOnly ?? props.formReadOnly
  const readOnlyStyle = options.readOnlyStyle ?? props.formReadOnlyStyle
  const value = props.form.getValues(props.field.key)
  const selectedOption = options.radioOptions?.find(o => o.value === value)
  const radioTheme = theme.radioField

  function handleRadioChange(option: RadioOption, onChange: (value: any) => void) {
    onChange(option.value)
    if (option?.checkedSubOption?.key) {
      setSubOptionKey(option.checkedSubOption.key)
      setSubOptionValue('')
      props.form.setValue(option.checkedSubOption.key, '')
    } else if (subOptionKey) {
      props.form.setValue(subOptionKey, '')
      setSubOptionKey(undefined)
      setSubOptionValue('')
    }
  }

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <View style={options.radioDirection === 'row' ? radioTheme.containerRow : radioTheme.containerColumn}>
          {options?.radioOptions?.map((option: RadioOption) => (
            <View key={option.key} style={radioTheme.optionContainer}>
              <View style={[radioTheme.radio, option.value === value && radioTheme.radioSelected, radioTheme.disabled]}>
                {option.value === value && <View style={radioTheme.radioInner} />}
              </View>
              <Text style={[radioTheme.label, radioTheme.disabled]}>{option.label}</Text>
            </View>
          ))}
        </View>
      )
    }

    return selectedOption ? (
      <View style={radioTheme.readOnlySelected}>
        <Text style={radioTheme.label}>{selectedOption.label}</Text>
      </View>
    ) : (
      <Text style={radioTheme.readOnlyUnselected}>—</Text>
    )
  }

  return (
    <Controller
      name={props.field.key}
      control={props.form.control}
      defaultValue={options?.defaultValue}
      render={({ field: { value, onChange } }) => (
        <View>
          {options.helpText && <Text style={radioTheme.helpText}>{options.helpText}</Text>}
          <View style={options.radioDirection === 'row' ? radioTheme.containerRow : radioTheme.containerColumn}>
            {options?.radioOptions?.map((option: RadioOption) => {
              if (option.hidden) return null
              const isSelected = option.value === value

              return (
                <View key={option.key}>
                  <Pressable
                    onPress={() => !options.disabled && handleRadioChange(option, onChange)}
                    style={radioTheme.optionContainer}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected, disabled: options.disabled }}
                  >
                    <View style={[radioTheme.radio, isSelected && radioTheme.radioSelected, options.disabled && radioTheme.disabled]}>
                      {isSelected && <View style={radioTheme.radioInner} />}
                    </View>
                    <Text style={[radioTheme.label, options.disabled && radioTheme.disabled]}>
                      {option.label}
                    </Text>
                  </Pressable>
                  {isSelected && option.checkedSubOption && (
                    <TextInput
                      placeholder={option.checkedSubOption.label}
                      placeholderTextColor="#9ca3af"
                      value={subOptionValue}
                      onChangeText={(text) => {
                        setSubOptionValue(text)
                        if (option.checkedSubOption?.key) {
                          props.form.setValue(option.checkedSubOption.key, text)
                        }
                      }}
                      editable={!options.disabled}
                      style={radioTheme.subOptionInput}
                    />
                  )}
                </View>
              )
            })}
          </View>
        </View>
      )}
    />
  )
}
