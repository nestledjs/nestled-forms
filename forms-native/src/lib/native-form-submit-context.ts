'use client'

import { createContext, useContext } from 'react'

/**
 * Carries NativeForm's validated, transform-applying submit handler so
 * ButtonField (and custom submit buttons) can trigger real submission.
 * Value is null when rendered outside a NativeForm.
 */
export const NativeFormSubmitContext = createContext<(() => Promise<void>) | null>(null)

/**
 * Returns NativeForm's submit trigger: runs validation, applies each field's
 * submitTransform (explicit or per-type default), then calls the form's `submit` prop.
 *
 * @example
 * ```tsx
 * const submitForm = useNativeFormSubmit()
 * <Pressable onPress={() => submitForm?.()}>...</Pressable>
 * ```
 */
export function useNativeFormSubmit() {
  return useContext(NativeFormSubmitContext)
}
