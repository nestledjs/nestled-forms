import { Text, ViewStyle, TextStyle } from 'react-native'
import { useNativeTheme } from '../native-theme-context'

interface FormLabelProps {
  fieldKey: string
  label: string
  required?: boolean
  unstyled?: boolean
  containerStyle?: ViewStyle
  labelStyle?: TextStyle
  requiredIndicatorStyle?: TextStyle
  containerClassName?: string
  labelClassName?: string
  requiredIndicatorClassName?: string
}

export function FormLabel({
  fieldKey,
  label,
  required,
  unstyled,
  containerStyle,
  labelStyle,
  requiredIndicatorStyle,
  containerClassName,
  labelClassName,
  requiredIndicatorClassName,
}: Readonly<FormLabelProps>) {
  const theme = useNativeTheme()

  return (
    <Text
      nativeID={`${fieldKey}-label`}
      style={[!unstyled && theme.label.base, labelStyle]}
      {...(labelClassName ? { className: labelClassName } : {})}
    >
      {label}
      {required && (
        <Text
          style={[!unstyled && theme.label.requiredIndicator, requiredIndicatorStyle]}
          {...(requiredIndicatorClassName ? { className: requiredIndicatorClassName } : {})}
        >
          {' *'}
        </Text>
      )}
    </Text>
  )
}
