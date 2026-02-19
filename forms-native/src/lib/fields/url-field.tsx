import { TextInput, View, Text } from 'react-native'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function UrlField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.Url }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme()
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <>
          <TextInput
            nativeID={field.key}
            editable={false}
            value={value}
            style={[theme.urlField.input, theme.urlField.disabled, hasError && theme.urlField.error]}
            accessibilityLabel={field.options.label}
          />
          {field.options.helpText && <Text style={theme.urlField.helpText}>{field.options.helpText}</Text>}
        </>
      )
    }
    return (
      <>
        <View style={theme.urlField.readOnlyValue}>
          <Text style={{ fontSize: 16, color: '#374151' }}>{value || '—'}</Text>
        </View>
        {field.options.helpText && <Text style={theme.urlField.helpText}>{field.options.helpText}</Text>}
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
        defaultValue={field.options.defaultValue}
        keyboardType="url"
        autoCapitalize="none"
        onChangeText={(text) => form.setValue(field.key, text, { shouldValidate: true })}
        onBlur={() => form.trigger(field.key)}
        style={[
          theme.urlField.input,
          field.options.disabled && theme.urlField.disabled,
          hasError && theme.urlField.error,
        ]}
        accessibilityLabel={field.options.label}
      />
      {field.options.helpText && <Text style={theme.urlField.helpText}>{field.options.helpText}</Text>}
    </>
  )
}
