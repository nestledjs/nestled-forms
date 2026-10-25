import { get, useFormState, type FieldError } from 'react-hook-form'
import { useFormContext } from '../form-context'
import { useFormConfig } from '../form-config-context'

/**
 * Reads one field's validation error, subscribed to that field alone.
 *
 * `useFormContext().formState.errors[name]` creates no subscription of its
 * own: it only updates when something above the caller re-renders. A field
 * inside a memoized section or under a custom provider never showed its
 * message. This subscribes with `useFormState({ name })`, and `get()` resolves
 * dotted and nested keys such as `address.city`.
 *
 * `errorMessage` falls back to the localized required message when the error
 * carries none, and is `null` when there's no error.
 */
export function useFieldError(name: string): { error: FieldError | undefined; errorMessage: string | null } {
  const form = useFormContext()
  const { strings } = useFormConfig()
  const { errors } = useFormState({ control: form.control, name })
  const error = get(errors, name) as FieldError | undefined
  const errorMessage = error ? ((error.message as string | undefined) ?? strings.requiredError) : null
  return { error, errorMessage }
}
