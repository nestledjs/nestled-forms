// Types, enums, interfaces
export * from './lib/form-types'
export { FormThemeSchema } from './lib/form-theme'
export type { FormTheme } from './lib/form-theme'
export type { DeepPartial } from './lib/types/deep-partial'

// Constants
export * from './lib/constants'

// Factory
export * from './lib/form-fields'

// Contexts
export { FormContext, useFormContext } from './lib/form-context'
export { FormConfigContext, useFormConfig } from './lib/form-config-context'
export type { FormConfig } from './lib/form-config-context'
export { ThemeContext, useFormTheme } from './lib/theme-context'

// Hooks
export { useFieldValidation } from './lib/hooks/use-field-validation'
export { useDebounce } from './lib/utils/debounce'

// Validation utilities
export {
  createFieldValidation,
  createFormResolver,
  validateGroup,
  getValidationGroups,
  getFieldsInGroup,
  shouldValidateField,
  type InferSchemaType,
} from './lib/utils/validation'

// Currency utilities
export {
  CURRENCY_CONFIGS,
  getCurrencyConfig,
  getCurrencyOptions,
  getPopularCurrencyOptions,
  formatCurrency,
  parseCurrency,
  getCurrencyStep,
  resolveCurrencyConfig,
  isSupportedCurrency,
  convertCurrency,
  formatCurrencyForDisplay,
} from './lib/utils/currency'

// Date/time utilities
export {
  getDateFromDateTime,
  formatDateFromDateTime,
  getDateTimeFromValue,
  formatDateTimeFromValue,
} from './lib/utils/date-time'

// Re-export react-hook-form's FieldValues for consumers
export type { FieldValues } from 'react-hook-form'
