import { TextInput, View, Text } from 'react-native'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'
import { useTextFieldDefault } from '../hooks/use-text-field-default'

export function EmailField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Email }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme()
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''

  const initialValue = useTextFieldDefault(form, field)

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <TextInput
          nativeID={field.key}
          editable={false}
          value={value}
          style={[theme.emailField.input, theme.emailField.disabled, hasError && theme.emailField.error]}
          accessibilityLabel={field.options.label}
        />
      )
    }
    return (
      <View style={theme.emailField.readOnlyValue}>
        <Text style={{ fontSize: 16, color: '#374151' }}>{value || '—'}</Text>
      </View>
    )
  }

  return (
    <TextInput
      nativeID={field.key}
      editable={!field.options.disabled}
      placeholder={field.options.placeholder}
      placeholderTextColor="#9ca3af"
      defaultValue={initialValue}
      keyboardType="email-address"
      autoCapitalize="none"
      autoComplete="email"
      onChangeText={(text) => form.setValue(field.key, text, { shouldValidate: true })}
      onBlur={() => form.trigger(field.key)}
      style={[
        theme.emailField.input,
        field.options.disabled && theme.emailField.disabled,
        hasError && theme.emailField.error,
      ]}
      accessibilityLabel={field.options.label}
    />
  )
}
