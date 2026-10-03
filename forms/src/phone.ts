/**
 * Separate export for PhoneField to keep libphonenumber's ~150 KB country
 * metadata out of the main bundle. Declarative forms (the `fields` prop)
 * lazy-load it automatically; import from here only when composing PhoneField
 * directly.
 *
 * @example
 * ```tsx
 * import { PhoneField } from '@nestledjs/forms/phone'
 * ```
 */
export { PhoneField } from './lib/fields/phone-field'
