import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

/**
 * Shared default-value handling for the text-style native fields.
 *
 * Reflects form-level values / field defaults in the uncontrolled TextInput,
 * and seeds form state with the default so untouched forms submit it (web parity).
 *
 * Returns the initial value to pass as the TextInput's `defaultValue`.
 */
export function useTextFieldDefault(
  form: UseFormReturn,
  field: { key: string; options: { defaultValue?: unknown } },
): string {
  const initialValue = form.getValues(field.key) ?? field.options.defaultValue ?? ''

  useEffect(() => {
    const currentValue = form.getValues(field.key)
    if ((currentValue === undefined || currentValue === null) && field.options.defaultValue !== undefined) {
      form.setValue(field.key, field.options.defaultValue)
    }
  }, [form, field.key, field.options.defaultValue])

  return initialValue
}
