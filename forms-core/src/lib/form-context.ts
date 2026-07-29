'use client'

import { createContext, useContext } from 'react'
import { UseFormReturn, FieldValues } from 'react-hook-form'

// The context will hold the entire return value of useForm()
export const FormContext = createContext<UseFormReturn<FieldValues> | null>(null)

/**
 * Hook to access the form context and methods within a Form component.
 *
 * Provides access to react-hook-form's useForm return value, including
 * form state, validation methods, and field registration.
 *
 * Must be used within a Form component.
 *
 * ⚠️ **Do not use `form.watch(name)` to read a value during render.** It compiles,
 * returns the right value on first render, and then silently never updates — no
 * error, no warning, no type-level signal. `watch()` re-renders only the component
 * that owns `useForm()`, which is `<Form>` itself; because `<Form>` passes `children`
 * straight through, React reuses that element reference and skips reconciling the
 * subtree, so the caller never re-renders.
 *
 * Use {@link useFormValue} (or `useWatch({ control: form.control, name })`) instead —
 * both subscribe the *calling* component. `form.watch(callback)` is fine: the callback
 * form returns a real subscription rather than relying on a re-render.
 *
 * `getValues`, `setValue`, `register` and the rest behave normally here; the caveat
 * is specific to reading reactively during render.
 *
 * @template T - The type of the form values object
 * @returns The form context object with methods like register, setValue, getValues, formState, etc.
 * @throws Error if used outside of a Form component
 *
 * @example
 * ```tsx
 * function CustomField() {
 *   const form = useFormContext<{ username: string }>()
 *
 *   return (
 *     <input
 *       {...form.register('username', { required: true })}
 *       className={form.formState.errors.username ? 'error' : ''}
 *     />
 *   )
 * }
 *
 * // Reading another field's value reactively — use useFormValue, not form.watch()
 * function Mirror() {
 *   const username = useFormValue<string>('username')
 *   return <p>{username}</p>
 * }
 *
 * // Usage within a Form
 * <Form id="my-form" submit={handleSubmit}>
 *   <CustomField />
 *   <Mirror />
 * </Form>
 * ```
 */
export function useFormContext<T extends FieldValues = FieldValues>() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('FormField components must be used within a <Form> component.')
  }
  return context as UseFormReturn<T>
}
