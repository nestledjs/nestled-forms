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

type SubmitField = { key: string; type: FormFieldType; options?: { submitTransform?: (value: any) => unknown } }

/**
 * Builds the validated-values submit pipeline shared by Form (web) and
 * NativeForm: strips button-field keys, applies each field's submit transform
 * (explicit or per-type default), then calls the consumer's submit handler.
 */
export function createSubmitHandler<T>(
  fields: Array<SubmitField | null> | undefined,
  submit: (values: T) => void | Promise<unknown>,
): (values: T) => void | Promise<unknown> {
  return (values: T) => {
    const filteredValues: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
      const isButtonField = fields?.some((f) => f?.key === key && f.type === FormFieldType.Button)
      if (!isButtonField) {
        filteredValues[key] = value
      }
    }

    if (!fields) {
      return submit(filteredValues as T)
    }

    const transformedValues: Record<string, unknown> = { ...filteredValues }
    fields
      .filter((field): field is SubmitField => field !== null)
      .filter((field) => field.type !== FormFieldType.Button)
      .forEach((field) => {
        const transform = resolveSubmitTransform(field)
        if (transform && field.key in transformedValues) {
          transformedValues[field.key] = transform(transformedValues[field.key])
        }
      })

    return submit(transformedValues as T)
  }
}
