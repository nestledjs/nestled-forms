import { FormFieldType } from './form-types'

/**
 * Transforms a single-select value from display format to submission format:
 * a `{ value, label }` option object (or raw string) becomes the ID string.
 */
export function singleSelectSubmitTransform(value: any): string | null {
  if (!value) {
    return null
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'object' && 'value' in value) {
    return value.value
  }
  return String(value)
}

/**
 * Transforms a multi-select value from display format to submission format:
 * `SearchSelectOption[]` (or mixed string/option arrays) becomes `string[]` of IDs.
 */
export function multiSelectSubmitTransform(value: any): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value.map((item) => {
    if (typeof item === 'string') {
      return item
    }
    if (item && typeof item === 'object' && 'value' in item) {
      return item.value
    }
    return String(item)
  })
}

/**
 * Default submit transforms per field type, applied by the Form submit path
 * whenever the field doesn't define its own `submitTransform`. These fields
 * hold option objects in form state for display; APIs expect ID strings.
 */
export const DEFAULT_SUBMIT_TRANSFORMS: Partial<Record<FormFieldType, (value: any) => unknown>> = {
  [FormFieldType.SearchSelectApollo]: singleSelectSubmitTransform,
  [FormFieldType.SearchSelectMultiApollo]: multiSelectSubmitTransform,
  [FormFieldType.MultiSelect]: multiSelectSubmitTransform,
  [FormFieldType.SearchSelectMulti]: multiSelectSubmitTransform,
}

/**
 * Resolves the effective submit transform for a field definition:
 * an explicit `options.submitTransform` wins, otherwise the type default (if any).
 */
export function resolveSubmitTransform(field: {
  type: FormFieldType
  options?: { submitTransform?: (value: any) => unknown }
}): ((value: any) => unknown) | undefined {
  return field.options?.submitTransform ?? DEFAULT_SUBMIT_TRANSFORMS[field.type]
}
