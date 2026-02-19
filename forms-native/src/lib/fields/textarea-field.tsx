import React, { useState } from 'react'
import { TextInput, View, Text } from 'react-native'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function TextAreaField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.TextArea }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme()
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''
  const rows = field.options.rows ?? 4
  const [height, setHeight] = useState(rows * 20)

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
        defaultValue={field.options.defaultValue}
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
