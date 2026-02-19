// Re-export everything from forms-core for backward compatibility
export * from '@nestledjs/forms-core'

// Web-specific exports
export * from './lib/form'
export type { FormProps } from './lib/form'
export { tailwindTheme } from './lib/themes/tailwind'
export { themeReference, generateThemeTemplate, createCustomTheme } from './lib/theme-reference'
export { RenderFormField } from './lib/render-form-field'
export { createFinalTheme } from './lib/utils/resolve-theme'

// Field Components
export { TextField } from './lib/fields/text-field'
export { TextAreaField } from './lib/fields/textarea-field'
// MarkdownEditor removed from main exports to avoid SSR issues
// Import from '@nestledjs/forms/markdown' when needed
export { EmailField } from './lib/fields/email-field'
export { PasswordField } from './lib/fields/password-field'
export { UrlField } from './lib/fields/url-field'
export { PhoneField } from './lib/fields/phone-field'
export { NumberField } from './lib/fields/number-field'
export { MoneyField } from './lib/fields/money-field'
export { CheckboxField } from './lib/fields/checkbox-field'
export { SwitchField } from './lib/fields/switch-field'
export { ButtonField } from './lib/fields/button-field'
export { DatePickerField } from './lib/fields/datepicker-field'
export { DateTimePickerField } from './lib/fields/datetimepicker-field'
export { TimePickerField } from './lib/fields/timepicker-field'
export { SelectField } from './lib/fields/select-field'
export { SelectFieldEnum } from './lib/fields/select-field-enum'
export { SelectFieldMulti } from './lib/fields/select-field-multi'
export { RadioField } from './lib/fields/radio-field'
export { CheckboxGroupField } from './lib/fields/checkbox-group'
export { SelectFieldSearch } from './lib/fields/select-field-search'
export { SelectFieldSearchApollo, singleSelectSubmitTransform } from './lib/fields/select-field-search-apollo'
export { SelectFieldMultiSearch } from './lib/fields/select-field-multi-search'
export { SelectFieldMultiSearchApollo, multiSelectSubmitTransform, apolloMultiSelectSubmitTransform } from './lib/fields/select-field-multi-search-apollo'
export { CustomField } from './lib/fields/custom-field'
export { CustomCheckboxField } from './lib/fields/custom-checkbox-field'
