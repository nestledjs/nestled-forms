import { useState } from 'react'
import { View, Text, Pressable, Platform } from 'react-native'
import { Controller, useWatch } from 'react-hook-form'
import {
  FormField,
  FormFieldProps,
  FormFieldType,
  formatDateTimeFromValue,
  formatLocalDateTime,
  getDateTimeFromValue,
  parseLocalDateTime,
} from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let DateTimePicker: any = null
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default
} catch {
  // @react-native-community/datetimepicker not installed
}

export function DateTimePickerField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.DateTimePicker }>> & {
  hasError?: boolean
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme().dateTimePicker
  const options = field.options
  const isReadOnly = options.readOnly ?? formReadOnly
  const effectiveReadOnlyStyle = options.readOnlyStyle ?? formReadOnlyStyle
  const value = useWatch({ control: form.control, name: field.key }) ?? ''
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [tempDate, setTempDate] = useState<Date | null>(null)

  if (!DateTimePicker) {
    return (
      <View style={theme.trigger}>
        <Text style={theme.placeholderText}>
          Install @react-native-community/datetimepicker to use DateTimePickerField
        </Text>
      </View>
    )
  }

  if (isReadOnly) {
    if (effectiveReadOnlyStyle === 'disabled') {
      return (
        <View style={[theme.trigger, theme.disabled]}>
          <Text style={theme.triggerText}>{value ? formatDateTimeFromValue(value) ?? value : '—'}</Text>
        </View>
      )
    }
    return (
      <View style={theme.readOnlyValue}>
        <Text style={{ fontSize: 16, color: '#374151' }}>{formatDateTimeFromValue(value) ?? '—'}</Text>
      </View>
    )
  }

  return (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={getDateTimeFromValue(options.defaultValue ?? '')}
      rules={{ required: options.required }}
      render={({ field: controllerField }) => {
        const dateValue = (controllerField.value ? parseLocalDateTime(controllerField.value) : null) ?? new Date()

        return (
          <View>
            <Pressable
              onPress={() => !options.disabled && setShowDatePicker(true)}
              style={[
                theme.trigger,
                options.disabled && theme.disabled,
                hasError && theme.error,
              ]}
              accessibilityLabel={options.label ?? 'Select date and time'}
              accessibilityRole="button"
            >
              <Text style={controllerField.value ? theme.triggerText : theme.placeholderText}>
                {controllerField.value
                  ? (formatDateTimeFromValue(controllerField.value) ?? controllerField.value)
                  : (options.placeholder || 'Select date and time...')}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={options.min ? new Date(options.min) : undefined}
                maximumDate={options.max ? new Date(options.max) : undefined}
                onChange={(_event: any, selectedDate?: Date) => {
                  setShowDatePicker(false)
                  if (selectedDate) {
                    setTempDate(selectedDate)
                    setShowTimePicker(true)
                  }
                }}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={tempDate || dateValue}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_event: any, selectedTime?: Date) => {
                  setShowTimePicker(false)
                  if (selectedTime && tempDate) {
                    const combined = new Date(tempDate)
                    combined.setHours(selectedTime.getHours())
                    combined.setMinutes(selectedTime.getMinutes())
                    // Local wall-clock time, matching web's datetime-local input
                    // (toISOString would shift the value by the UTC offset)
                    controllerField.onChange(formatLocalDateTime(combined))
                  }
                  setTempDate(null)
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
