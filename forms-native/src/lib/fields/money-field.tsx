import { useState, useEffect } from 'react'
import { TextInput, View, Text } from 'react-native'
import { FormField, FormFieldType, FormFieldProps, resolveCurrencyConfig, formatCurrency } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function MoneyField({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Currency }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useNativeTheme()
  const currencyConfig = resolveCurrencyConfig(field.options.currency, field.options.customCurrency)
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle
  const value = form.getValues(field.key) ?? ''

  const hideSymbolWhenEmpty = field.options.hideSymbolWhenEmpty ?? true
  const [hasContent, setHasContent] = useState(Boolean(value))

  useEffect(() => {
    const currentValue = form.getValues(field.key)
    setHasContent(Boolean(currentValue))
  }, [form, field.key])

  const shouldShowSymbol = !hideSymbolWhenEmpty || hasContent

  const currencySymbol = shouldShowSymbol ? (
    <Text style={theme.moneyField.currencySymbol}>
      {currencyConfig.symbol}
      {field.options.showCurrencyCode && (
        <Text style={{ fontSize: 12, opacity: 0.75 }}> {currencyConfig.code}</Text>
      )}
    </Text>
  ) : null

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <View style={theme.moneyField.container}>
          {currencyConfig.symbolPosition === 'before' && currencySymbol}
          <TextInput
            nativeID={field.key}
            editable={false}
            value={String(value)}
            keyboardType="decimal-pad"
            style={[theme.moneyField.input, theme.moneyField.disabled, hasError && theme.moneyField.error]}
            accessibilityLabel={field.options.label}
          />
          {currencyConfig.symbolPosition === 'after' && currencySymbol}
        </View>
      )
    }
    const formattedValue = formatCurrency(value, currencyConfig, {
      showSymbol: true,
      showCode: field.options.showCurrencyCode,
    })
    return (
      <View style={theme.moneyField.readOnlyValue}>
        <Text style={{ fontSize: 16, color: '#374151' }}>{formattedValue || '—'}</Text>
      </View>
    )
  }

  return (
    <View style={theme.moneyField.container}>
      {currencyConfig.symbolPosition === 'before' && currencySymbol}
      <TextInput
        nativeID={field.key}
        editable={!field.options.disabled}
        placeholder={field.options.placeholder}
        placeholderTextColor="#9ca3af"
        defaultValue={field.options.defaultValue === undefined ? undefined : String(field.options.defaultValue)}
        keyboardType="decimal-pad"
        onChangeText={(text) => {
          const filtered = text.replaceAll(/[^0-9.-]/g, '')
          const numValue = filtered === '' ? '' : Number.parseFloat(filtered)
          setHasContent(Boolean(filtered))
          form.setValue(field.key, numValue === '' || Number.isNaN(numValue as number) ? '' : numValue, { shouldValidate: true })
        }}
        onBlur={() => form.trigger(field.key)}
        style={[
          theme.moneyField.input,
          field.options.disabled && theme.moneyField.disabled,
          hasError && theme.moneyField.error,
        ]}
        accessibilityLabel={field.options.label}
      />
      {currencyConfig.symbolPosition === 'after' && currencySymbol}
    </View>
  )
}
