import { View, Text, Pressable } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType, DEFAULT_REQUIRED_ERROR_MESSAGE } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

type CheckboxFieldType = Extract<FormField, { type: FormFieldType.Checkbox }>

interface CheckboxFieldProps extends Omit<FormFieldProps<CheckboxFieldType>, 'hasError'> {
  hasError?: boolean
  errorMessage?: string
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}

/**
 * Attempts to import expo-checkbox. Falls back to a Pressable-based checkbox if unavailable.
 */
let ExpoCheckbox: any = null
try {
  ExpoCheckbox = require('expo-checkbox').default
} catch {
  // expo-checkbox not available
}

function FallbackCheckbox({ value, onValueChange, disabled, color }: {
  value: boolean
  onValueChange: (val: boolean) => void
  disabled?: boolean
  color?: string
}) {
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={{
        width: 22,
        height: 22,
        borderWidth: 2,
        borderColor: value ? (color || '#0284c7') : '#d1d5db',
        borderRadius: 4,
        backgroundColor: value ? (color || '#0284c7') : 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
      }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value, disabled }}
    >
      {value && (
        <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '700' }}>✓</Text>
      )}
    </Pressable>
  )
}

export function CheckboxField(props: Readonly<CheckboxFieldProps>) {
  const { field, form, hasError, errorMessage, formReadOnly = false, formReadOnlyStyle = 'value' } = props
  const options = field.options
  const theme = useNativeTheme()
  const checkboxTheme = theme.checkbox
  const isReadOnly = options.readOnly ?? formReadOnly
  const readOnlyStyle = options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key)

  const CheckboxComponent = ExpoCheckbox || FallbackCheckbox

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <View style={checkboxTheme.wrapper}>
          <View style={checkboxTheme.row}>
            <CheckboxComponent
              value={!!value}
              onValueChange={() => {}}
              disabled={true}
            />
            {options.label && (
              <Text style={[checkboxTheme.label, checkboxTheme.disabled]}>{options.label}</Text>
            )}
          </View>
          {options.helpText && <Text style={checkboxTheme.helpText}>{options.helpText}</Text>}
        </View>
      )
    }
    return (
      <View style={checkboxTheme.wrapper}>
        <Text style={checkboxTheme.readOnly}>{value ? 'Yes' : 'No'}</Text>
      </View>
    )
  }

  return (
    <Controller
      name={field.key}
      control={form.control}
      defaultValue={options.defaultValue}
      rules={{ required: options.required ? DEFAULT_REQUIRED_ERROR_MESSAGE : false }}
      render={({ field: controllerField }) => (
        <View style={checkboxTheme.wrapper}>
          <View style={checkboxTheme.row}>
            <CheckboxComponent
              value={!!controllerField.value}
              onValueChange={(val: boolean) => controllerField.onChange(val)}
              disabled={options.disabled}
              color={controllerField.value ? '#0284c7' : undefined}
            />
            {options.label && (
              <Text style={[checkboxTheme.label, options.disabled && checkboxTheme.disabled]}>
                {options.label}
                {options.required && <Text style={{ color: '#dc2626' }}> *</Text>}
              </Text>
            )}
          </View>
          {options.helpText && <Text style={checkboxTheme.helpText}>{options.helpText}</Text>}
          {hasError && errorMessage && (
            <Text style={checkboxTheme.errorMessage}>{errorMessage}</Text>
          )}
        </View>
      )}
    />
  )
}
