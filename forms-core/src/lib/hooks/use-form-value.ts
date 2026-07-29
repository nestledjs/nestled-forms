'use client'

import type { FieldValues } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { useFormContext } from '../form-context'

/**
 * Reactively read a single form value from any component inside a `<Form>`.
 *
 * Use this instead of `form.watch(name)` when you need a value in a component
 * that does not own the form. `watch()` called during render re-renders only the
 * component that owns `useForm()` — which is `<Form>` itself — and `<Form>` passes
 * `children` straight through, so React reuses that element reference and skips
 * reconciling the subtree. The value is correct on first render and then silently
 * never updates. `useWatch` subscribes the *calling* component instead, so it
 * re-renders wherever it is used.
 *
 * @param name - Dot-path of the field to read, e.g. `'answer'` or `'address.city'`
 * @returns The current value, updating on every change
 *
 * @example
 * ```tsx
 * function Mirror() {
 *   const answer = useFormValue<string>('answer')
 *   return <p>answer = {answer}</p>
 * }
 *
 * <Form id="repro" submit={handleSubmit} defaultValues={{ answer: '' }} fields={fields}>
 *   <Mirror />
 * </Form>
 * ```
 */
export function useFormValue<T = unknown>(name: string): T {
  const form = useFormContext()
  return useWatch({ control: form.control, name }) as T
}

/**
 * Reactively read every form value from any component inside a `<Form>`.
 *
 * The whole-form counterpart to {@link useFormValue}. Re-renders the caller on any
 * change, so prefer {@link useFormValue} when you only need one field.
 *
 * @returns All current form values, updating on every change
 *
 * @example
 * ```tsx
 * function DebugPanel() {
 *   const values = useFormValues()
 *   return <pre>{JSON.stringify(values, null, 2)}</pre>
 * }
 * ```
 */
export function useFormValues<T extends FieldValues = FieldValues>(): T {
  const form = useFormContext()
  return useWatch({ control: form.control }) as T
}
