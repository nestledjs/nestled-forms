// Types, enums, interfaces
export * from './lib/form-types'
export { FormThemeSchema } from './lib/form-theme'
export type { FormTheme } from './lib/form-theme'
export type { DeepPartial } from './lib/types/deep-partial'

// Constants
export * from './lib/constants'

// Factory
export * from './lib/form-fields'

// Submit transforms (defaults applied by the Form submit path)
export {
  singleSelectSubmitTransform,
  multiSelectSubmitTransform,
  DEFAULT_SUBMIT_TRANSFORMS,
  resolveSubmitTransform,
} from './lib/submit-transforms'

// Contexts
export { FormContext, useFormContext } from './lib/form-context'
export { FormConfigContext, useFormConfig, DEFAULT_FORM_STRINGS, resolveFormStrings } from './lib/form-config-context'
export type { FormConfig, FormStrings } from './lib/form-config-context'
export { ThemeContext, useFormTheme } from './lib/theme-context'

// Search query adapter contract (Apollo adapter lives in '@nestledjs/forms-core/apollo')
export { SearchQueryContext, SearchQueryProvider, useSearchQueryAdapter } from './lib/search-query-context'
export type { SearchQueryResult, UseSearchQuery } from './lib/search-query-context'

// Hooks
export { useFieldValidation } from './lib/hooks/use-field-validation'
export { useSearchSelect, defaultOptionsMap } from './lib/hooks/use-search-select'
export { useDebounce } from './lib/utils/debounce'
export { deepEqual } from './lib/utils/deep-equal'

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
  parseLocalDate,
  parseLocalDateTime,
  formatLocalDate,
  formatLocalDateTime,
} from './lib/utils/date-time'

// Re-export react-hook-form's FieldValues for consumers
export type { FieldValues } from 'react-hook-form'
