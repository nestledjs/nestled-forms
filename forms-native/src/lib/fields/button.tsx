import React from 'react'
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native'
import { useNativeTheme } from '../native-theme-context'

export interface ButtonProps {
  children?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  onPress?: () => void
  style?: ViewStyle
  textStyle?: TextStyle
  className?: string
  type?: 'button' | 'submit' | 'reset'
  accessibilityLabel?: string
}

export function Button({
  children,
  variant = 'primary',
  disabled,
  loading = false,
  fullWidth = false,
  onPress,
  style,
  textStyle,
  className,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useNativeTheme()
  const buttonTheme = theme.button
  const isDisabled = disabled || loading

  const getTextStyle = () => {
    switch (variant) {
      case 'danger':
        return buttonTheme.dangerText
      case 'secondary':
        return buttonTheme.secondaryText
      default:
        return buttonTheme.primaryText
    }
  }

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={variant === 'secondary' ? '#374151' : '#ffffff'} />
    }
    if (typeof children === 'string') {
      return (
        <Text style={[buttonTheme.text, getTextStyle(), isDisabled && buttonTheme.disabledText, textStyle]}>
          {children}
        </Text>
      )
    }
    return children
  }

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      style={[
        buttonTheme.base,
        buttonTheme[variant],
        isDisabled && buttonTheme.disabled,
        loading && buttonTheme.loading,
        fullWidth && buttonTheme.fullWidth,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel}
      {...(className ? { className } : {})}
    >
      {renderContent()}
    </Pressable>
  )
}
