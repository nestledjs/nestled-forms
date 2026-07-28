import { useState } from 'react'
import { TextInput, Text } from 'react-native'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'
import { useTextFieldDefault } from '../hooks/use-text-field-default'
import { useWatch } from 'react-hook-form'

export function TextAreaField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.TextArea }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme()
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = useWatch({ control: form.control, name: field.key }) ?? ''
  const rows = field.options.rows ?? 4
  const [height, setHeight] = useState(rows * 20)

  const initialValue = useTextFieldDefault(form, field)

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <>
          <TextInput
            nativeID={field.key}
            multiline
            numberOfLines={rows}
            editable={false}
            value={value}
            style={[theme.textAreaField.textarea, theme.textAreaField.disabled, hasError && theme.textAreaField.error, { minHeight: rows * 20 }]}
            accessibilityLabel={field.options.label}
          />
          {field.options.helpText && <Text style={theme.textAreaField.helpText}>{field.options.helpText}</Text>}
        </>
      )
    }
    return (
      <>
        <Text style={theme.textAreaField.readOnlyValue}>{value || '—'}</Text>
        {field.options.helpText && <Text style={theme.textAreaField.helpText}>{field.options.helpText}</Text>}
      </>
    )
  }

  return (
    <>
      <TextInput
        nativeID={field.key}
        multiline
        numberOfLines={rows}
        editable={!field.options.disabled}
        placeholder={field.options.placeholder}
        placeholderTextColor="#9ca3af"
        defaultValue={initialValue}
        onChangeText={(text) => form.setValue(field.key, text, { shouldValidate: true })}
        onBlur={() => form.trigger(field.key)}
        onContentSizeChange={(e) => {
          setHeight(Math.max(rows * 20, e.nativeEvent.contentSize.height))
        }}
        style={[
          theme.textAreaField.textarea,
          { minHeight: height },
          field.options.disabled && theme.textAreaField.disabled,
          hasError && theme.textAreaField.error,
        ]}
        accessibilityLabel={field.options.label}
      />
      {field.options.helpText && <Text style={theme.textAreaField.helpText}>{field.options.helpText}</Text>}
    </>
  )
}
