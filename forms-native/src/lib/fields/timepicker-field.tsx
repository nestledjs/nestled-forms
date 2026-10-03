import { useState } from 'react'
import { View, Text, Pressable, Platform } from 'react-native'
import { Controller, useWatch } from 'react-hook-form'
import { FormFieldProps, FormFieldType, BaseFieldOptions } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let DateTimePicker: any = null
try {
  DateTimePicker = require('@react-native-community/datetimepicker').default
} catch {
  // @react-native-community/datetimepicker not installed
}

interface TimePickerFieldType {
  key: string
  type: FormFieldType.TimePicker
  options: BaseFieldOptions
}

export function TimePickerField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<TimePickerFieldType> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme().timePicker
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = useWatch({ control: form.control, name: field.key }) ?? ''
  const [showPicker, setShowPicker] = useState(false)

  if (!DateTimePicker) {
    return (
      <View style={theme.trigger}>
        <Text style={theme.placeholderText}>
          Install @react-native-community/datetimepicker to use TimePickerField
        </Text>
      </View>
    )
  }

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <>
          <View style={[theme.trigger, theme.disabled]}>
            <Text style={theme.triggerText}>{value || '—'}</Text>
          </View>
          {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
        </>
      )
    }
    return (
      <>
        <Text style={{ fontSize: 16, color: '#374151' }}>{value || '—'}</Text>
        {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
      </>
    )
  }

  const parseTimeToDate = (timeStr: string): Date => {
    const date = new Date()
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      date.setHours(hours || 0)
      date.setMinutes(minutes || 0)
    }
    return date
  }

  return (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={field.options.defaultValue}
      rules={{ required: field.options.required }}
      render={({ field: controllerField }) => (
        <View>
          <Pressable
            onPress={() => !field.options.disabled && setShowPicker(true)}
            style={[
              theme.trigger,
              field.options.disabled && theme.disabled,
              hasError && theme.error,
            ]}
            accessibilityLabel={field.options.label ?? 'Select time'}
            accessibilityRole="button"
          >
            <Text style={controllerField.value ? theme.triggerText : theme.placeholderText}>
              {controllerField.value || 'Select time...'}
            </Text>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={parseTimeToDate(controllerField.value || '')}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_event: any, selectedTime?: Date) => {
                setShowPicker(Platform.OS === 'ios')
                if (selectedTime) {
                  const hours = selectedTime.getHours().toString().padStart(2, '0')
                  const minutes = selectedTime.getMinutes().toString().padStart(2, '0')
                  controllerField.onChange(`${hours}:${minutes}`)
                }
              }}
            />
          )}
          {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
        </View>
      )}
    />
  )
}
