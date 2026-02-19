import { View, Text } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType, SelectOption } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let Dropdown: any = null
try {
  Dropdown = require('react-native-element-dropdown').Dropdown
} catch {
  // react-native-element-dropdown not installed
}

export function SelectField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.Select }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme().selectField
  const options: SelectOption[] = field.options.options || []
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key)

  if (!Dropdown) {
    return (
      <View style={theme.container}>
        <Text style={theme.placeholder}>
          Install react-native-element-dropdown to use SelectField
        </Text>
      </View>
    )
  }

  if (isReadOnly) {
    const selectedOption = options.find(o => o.value === value)
    if (readOnlyStyle === 'disabled') {
      return (
        <>
          <Dropdown
            data={options.map(o => ({ label: o.label, value: String(o.value) }))}
            labelField="label"
            valueField="value"
            value={value ? String(value) : null}
            disable={true}
            placeholder={field.options.placeholder || 'Select...'}
            style={[theme.container, theme.disabled, hasError && theme.error]}
            placeholderStyle={theme.placeholder}
            selectedTextStyle={theme.selectedText}
            onChange={() => {}}
          />
          {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
        </>
      )
    }
    return (
      <>
        <View style={theme.readOnlyValue}>
          <Text style={{ fontSize: 16, color: '#374151' }}>{selectedOption?.label || '—'}</Text>
        </View>
        {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
      </>
    )
  }

  return (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={field.options.defaultValue}
      rules={{ required: field.options.required }}
      render={({ field: controllerField }) => (
        <View style={theme.wrapper}>
          <Dropdown
            data={options.map(o => ({ label: o.label, value: String(o.value) }))}
            labelField="label"
            valueField="value"
            value={controllerField.value ? String(controllerField.value) : null}
            onChange={(item: { value: string }) => {
              controllerField.onChange(item.value)
            }}
            onBlur={controllerField.onBlur}
            disable={field.options.disabled}
            placeholder={field.options.placeholder || 'Select...'}
            style={[theme.container, field.options.disabled && theme.disabled, hasError && theme.error]}
            placeholderStyle={theme.placeholder}
            selectedTextStyle={theme.selectedText}
            itemTextStyle={theme.itemText}
            activeColor={theme.selectedItem?.backgroundColor}
            accessibilityLabel={field.options.label}
          />
          {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
        </View>
      )}
    />
  )
}
