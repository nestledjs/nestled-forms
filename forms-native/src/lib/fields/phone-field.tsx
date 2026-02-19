import { TextInput, View, Text } from 'react-native'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

/**
 * Phone field using a basic TextInput with phone-pad keyboard.
 * For full country-picker support, consumers should install
 * `react-native-phone-number-input` and use a CustomField.
 * This basic implementation handles phone input with validation
 * delegated to forms-core.
 */
export function PhoneField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Phone }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme()
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <TextInput
          nativeID={field.key}
          editable={false}
          value={value}
          style={[theme.phoneField.input, theme.phoneField.disabled, hasError && theme.phoneField.error]}
          accessibilityLabel={field.options.label}
        />
      )
    }
    return (
      <View style={theme.phoneField.readOnlyValue}>
        <Text style={{ fontSize: 16, color: '#374151' }}>
          {value === undefined || value === null || value === '' ? '—' : value}
        </Text>
      </View>
    )
  }

  return (
    <>
      <TextInput
        nativeID={field.key}
        editable={!field.options.disabled}
        placeholder={field.options.placeholder}
        placeholderTextColor="#9ca3af"
        defaultValue={field.options.defaultValue}
        keyboardType="phone-pad"
        autoComplete="tel"
        onChangeText={(text) => form.setValue(field.key, text, { shouldValidate: true })}
        onBlur={() => form.trigger(field.key)}
        style={[
          theme.phoneField.input,
          field.options.disabled && theme.phoneField.disabled,
          hasError && theme.phoneField.error,
        ]}
        accessibilityLabel={field.options.label}
      />
      {field.options.helpText && <Text style={theme.phoneField.helpText}>{field.options.helpText}</Text>}
    </>
  )
}
