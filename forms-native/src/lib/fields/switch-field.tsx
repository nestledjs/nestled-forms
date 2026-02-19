import { View, Text, Switch } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function SwitchField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.Switch }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme()
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key)

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <View style={theme.switchField.container}>
          <Text style={theme.switchField.label}>
            {field.options.label}
            {field.options.required && <Text style={{ color: '#dc2626' }}> *</Text>}
          </Text>
          <Switch
            value={!!value}
            disabled={true}
            trackColor={{ false: '#d1d5db', true: '#7dd3fc' }}
            thumbColor={value ? '#0284c7' : '#f3f4f6'}
          />
        </View>
      )
    }
    return (
      <Text style={theme.switchField.readOnlyValue}>{value ? 'On' : 'Off'}</Text>
    )
  }

  return (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={field.options.defaultValue}
      render={({ field: { onChange, value } }) => (
        <View>
          <View style={theme.switchField.container}>
            <Text style={[theme.switchField.label, field.options.disabled && theme.switchField.disabled]}>
              {field.options.label}
              {field.options.required && <Text style={{ color: '#dc2626' }}> *</Text>}
            </Text>
            <Switch
              value={!!value}
              onValueChange={(val) => { if (!field.options.disabled) onChange(val) }}
              disabled={field.options.disabled}
              trackColor={{ false: '#d1d5db', true: '#7dd3fc' }}
              thumbColor={value ? '#0284c7' : '#f3f4f6'}
              accessibilityLabel={field.options.label}
              accessibilityRole="switch"
            />
          </View>
          {(field.options as any).helpText && (
            <Text style={theme.switchField.helpText}>{(field.options as any).helpText}</Text>
          )}
        </View>
      )}
    />
  )
}
