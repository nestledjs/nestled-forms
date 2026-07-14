import { useEffect } from 'react'
import { TextInput, View, Text } from 'react-native'
import { useWatch } from 'react-hook-form'
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
  // useWatch keeps the symbol visibility in sync with the form state, including reset()/setValue
  const watchedValue = useWatch({ control: form.control, name: field.key })
  const hasContent = watchedValue !== '' && watchedValue !== null && watchedValue !== undefined

  // Reflect form-level values / field defaults in the uncontrolled TextInput,
  // and seed form state with the default so untouched forms submit it (web parity)
  const initialValue = form.getValues(field.key) ?? field.options.defaultValue ?? ''
  useEffect(() => {
    const currentValue = form.getValues(field.key)
    if ((currentValue === undefined || currentValue === null) && field.options.defaultValue !== undefined) {
      form.setValue(field.key, field.options.defaultValue)
    }
  }, [form, field.key, field.options.defaultValue])

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
        defaultValue={initialValue === '' ? '' : String(initialValue)}
        keyboardType="decimal-pad"
        onChangeText={(text) => {
          // Treat a single trailing comma-decimal as a decimal point (European input, e.g. '1,5')
          const normalized = text.includes('.') ? text : text.replace(/,(\d{1,2})$/, '.$1')
          const filtered = normalized.replaceAll(/[^0-9.-]/g, '')
          const numValue = filtered === '' ? '' : Number.parseFloat(filtered)
          form.setValue(field.key, numValue === '' || Number.isNaN(numValue) ? '' : numValue, { shouldValidate: true })
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
