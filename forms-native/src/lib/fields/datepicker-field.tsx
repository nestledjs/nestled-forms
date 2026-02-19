import { useState } from 'react'
import { View, Text, Pressable, Platform } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType, formatDateFromDateTime, getDateFromDateTime } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let DateTimePicker: any = null
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default
} catch {
  // @react-native-community/datetimepicker not installed
}

export function DatePickerField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.DatePicker }>> & {
  hasError?: boolean
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme().datePicker
  const options = field.options
  const isReadOnly = options.readOnly ?? formReadOnly
  const effectiveReadOnlyStyle = options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''
  const [showPicker, setShowPicker] = useState(false)

  if (!DateTimePicker) {
    return (
      <View style={theme.trigger}>
        <Text style={theme.placeholderText}>
          Install @react-native-community/datetimepicker to use DatePickerField
        </Text>
      </View>
    )
  }

  if (isReadOnly) {
    if (effectiveReadOnlyStyle === 'disabled') {
      return (
        <>
          <View style={[theme.trigger, theme.disabled]}>
            <Text style={theme.triggerText}>{value ? formatDateFromDateTime(value) ?? value : '—'}</Text>
          </View>
          {options.helpText && <Text style={theme.helpText}>{options.helpText}</Text>}
        </>
      )
    }
    return (
      <>
        <View style={theme.readOnlyValue}>
          <Text style={{ fontSize: 16, color: '#374151' }}>{formatDateFromDateTime(value) || '—'}</Text>
        </View>
        {options.helpText && <Text style={theme.helpText}>{options.helpText}</Text>}
      </>
    )
  }

  return (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={getDateFromDateTime(options.defaultValue ?? '')}
      rules={{ required: options.required }}
      render={({ field: controllerField }) => {
        const dateValue = controllerField.value ? new Date(controllerField.value) : new Date()

        return (
          <View>
            <Pressable
              onPress={() => !options.disabled && setShowPicker(true)}
              style={[
                theme.trigger,
                options.disabled && theme.disabled,
                hasError && theme.error,
              ]}
              accessibilityLabel={options.label ?? 'Select date'}
              accessibilityRole="button"
            >
              <Text style={controllerField.value ? theme.triggerText : theme.placeholderText}>
                {controllerField.value ? (formatDateFromDateTime(controllerField.value) ?? controllerField.value) : (options.placeholder || 'Select date...')}
              </Text>
            </Pressable>
            {showPicker && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={options.min ? new Date(options.min) : undefined}
                maximumDate={options.max ? new Date(options.max) : undefined}
                onChange={(_event: any, selectedDate?: Date) => {
                  setShowPicker(Platform.OS === 'ios')
                  if (selectedDate) {
                    const formatted = selectedDate.toISOString().split('T')[0]
                    controllerField.onChange(formatted)
                  }
                }}
              />
            )}
            {options.helpText && <Text style={theme.helpText}>{options.helpText}</Text>}
          </View>
        )
      }}
    />
  )
}
