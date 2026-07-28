'use client'

import clsx from 'clsx'
import { useWatch } from 'react-hook-form'
import { FormField, FormFieldType, FormFieldProps, useFormTheme, resolveCurrencyConfig, getCurrencyStep, formatCurrency } from '@nestledjs/forms-core'
import { fieldA11yProps } from './field-a11y'

// The component now accepts the new props structure and is strongly typed.
// We use `Extract` to get the specific member of the FormField union we care about.
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
  // Get the fully resolved theme from the context
  const theme = useFormTheme()
  const moneyTheme = theme.moneyField

  // Resolve currency configuration
  const currencyConfig = resolveCurrencyConfig(
    field.options.currency,
    field.options.customCurrency
  )

  // Determine read-only state with field-level precedence
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle

  // Track if input has content (to show/hide currency symbol).
  // useWatch keeps this in sync with the form state, including reset()/setValue.
  const hideSymbolWhenEmpty = field.options.hideSymbolWhenEmpty ?? true
  const watchedValue = useWatch({ control: form.control, name: field.key })
  const value = watchedValue ?? ''
  const hasContent = watchedValue !== '' && watchedValue !== null && watchedValue !== undefined

  // Determine if symbol should be shown
  const shouldShowSymbol = !hideSymbolWhenEmpty || hasContent

  // Currency symbol element
  const currencySymbol = (
    <div 
      className={clsx(
        currencyConfig.symbolPosition === 'before' 
          ? moneyTheme.currencySymbol 
          : moneyTheme.currencySymbol.replace('left-3', 'right-3'),
        !shouldShowSymbol && moneyTheme.currencySymbolHidden
      )}
    >
      {currencyConfig.symbol}
      {field.options.showCurrencyCode && (
        <span className="ml-1 text-xs opacity-75">{currencyConfig.code}</span>
      )}
    </div>
  )

  if (isReadOnly) {
    if (readOnlyStyle === 'disabled') {
      return (
        <div className={clsx(moneyTheme.container)}>
          {currencyConfig.symbolPosition === 'before' && currencySymbol}
          <input
            id={field.key}
            type="number"
            step={getCurrencyStep(currencyConfig)}
            disabled={true}
            value={value}
            readOnly
            className={clsx(
              moneyTheme.input,
              shouldShowSymbol && moneyTheme.inputWithSymbol,
              moneyTheme.disabled,
              hasError && moneyTheme.error
            )}
          />
          {currencyConfig.symbolPosition === 'after' && currencySymbol}
        </div>
      )
    }
    // Render as formatted value
    const formattedValue = formatCurrency(value, currencyConfig, {
      showSymbol: true,
      showCode: field.options.showCurrencyCode,
    })
    return (
      <div className={clsx(moneyTheme.readOnlyValue)}>
        {formattedValue || '—'}
      </div>
    )
  }

  return (
    <div className={clsx(moneyTheme.container)}>
      {currencyConfig.symbolPosition === 'before' && currencySymbol}
      <input
        id={field.key}
        type="number"
        step={getCurrencyStep(currencyConfig)}
        {...form.register(field.key, {
          required: field.options.required,
          setValueAs: (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
        })}
        {...fieldA11yProps(field.key, hasError, field.options.helpText)}
        disabled={field.options.disabled}
        defaultValue={field.options.defaultValue}
        placeholder={field.options.placeholder}
        className={clsx(
          moneyTheme.input,
          shouldShowSymbol && currencyConfig.symbolPosition === 'before' && moneyTheme.inputWithSymbol,
          shouldShowSymbol && currencyConfig.symbolPosition === 'after' && 'pr-12', // Right padding for after symbols
          field.options.disabled && moneyTheme.disabled,
          hasError && moneyTheme.error
        )}
      />
      {currencyConfig.symbolPosition === 'after' && currencySymbol}
    </div>
  )
}
