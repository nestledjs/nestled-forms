import { useEffect, useState } from 'react'
import { TextInput, View, Text, Pressable } from 'react-native'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function PasswordField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Password }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme()
  const [showPassword, setShowPassword] = useState(false)
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''

  // Reflect form-level values / field defaults in the uncontrolled TextInput,
  // and seed form state with the default so untouched forms submit it (web parity)
  const initialValue = form.getValues(field.key) ?? field.options.defaultValue ?? ''
  useEffect(() => {
    const currentValue = form.getValues(field.key)
    if ((currentValue === undefined || currentValue === null) && field.options.defaultValue !== undefined) {
      form.setValue(field.key, field.options.defaultValue)
    }
  }, [form, field.key, field.options.defaultValue])

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <TextInput
          nativeID={field.key}
          editable={false}
          secureTextEntry
          value={value}
          style={[theme.passwordField.input, theme.passwordField.disabled, hasError && theme.passwordField.error]}
          accessibilityLabel={field.options.label}
        />
      )
    }
    return (
      <View style={theme.passwordField.readOnlyValue}>
        <Text style={{ fontSize: 16, color: '#374151' }}>{'*'.repeat(value.length) || '—'}</Text>
      </View>
    )
  }

  return (
    <View style={theme.passwordField.container}>
      <TextInput
        nativeID={field.key}
        editable={!field.options.disabled}
        placeholder={field.options.placeholder}
        placeholderTextColor="#9ca3af"
        defaultValue={initialValue}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoComplete="password"
        onChangeText={(text) => form.setValue(field.key, text, { shouldValidate: true })}
        onBlur={() => form.trigger(field.key)}
        style={[
          theme.passwordField.input,
          field.options.disabled && theme.passwordField.disabled,
          hasError && theme.passwordField.error,
        ]}
        accessibilityLabel={field.options.label}
      />
      <Pressable
        onPress={() => setShowPassword(!showPassword)}
        style={theme.passwordField.toggleButton}
        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        accessibilityRole="button"
      >
        <Text style={theme.passwordField.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
      </Pressable>
      {field.options.helpText && <Text style={theme.passwordField.helpText}>{field.options.helpText}</Text>}
    </View>
  )
}
