import { TextInput, View, Text } from 'react-native'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'
import { useTextFieldDefault } from '../hooks/use-text-field-default'

export function TextField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Text }>> & {
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
        <>
          <TextInput
            nativeID={field.key}
            editable={false}
            value={value}
            style={[theme.textField.input, hasError && theme.textField.error, theme.textField.disabled]}
            accessibilityLabel={field.options.label}
          />
          {field.options.helpText && <Text style={theme.textField.helpText}>{field.options.helpText}</Text>}
        </>
      )
    }
    return (
      <>
        <View style={theme.textField.readOnly}>
          <Text style={theme.textField.readOnlyText}>{value || '—'}</Text>
        </View>
        {field.options.helpText && <Text style={theme.textField.helpText}>{field.options.helpText}</Text>}
      </>
    )
  }

  return (
    <>
      <TextInput
        nativeID={field.key}
        editable={!field.options.disabled}
        placeholder={field.options.placeholder}
        placeholderTextColor="#9ca3af"
        defaultValue={initialValue}
        onChangeText={(text) => form.setValue(field.key, text, { shouldValidate: true })}
        onBlur={() => form.trigger(field.key)}
        style={[
          theme.textField.input,
          field.options.disabled && theme.textField.disabled,
          hasError && theme.textField.error,
        ]}
        accessibilityLabel={field.options.label}
        keyboardType="default"
      />
      {field.options.helpText && <Text style={theme.textField.helpText}>{field.options.helpText}</Text>}
    </>
  )
}
