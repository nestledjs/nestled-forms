import type { FieldValues, UseFormRegisterReturn, UseFormReturn } from 'react-hook-form'

type TextControl = HTMLInputElement | HTMLTextAreaElement

interface SyncTarget {
  form: UseFormReturn<FieldValues>
  name: string
}

// The form and field name each element was last registered under. Read at
// event time, so a re-render that changes either is picked up.
const targets = new WeakMap<Element, SyncTarget>()

function isTextControl(el: unknown): el is TextControl {
  return (
    typeof HTMLInputElement !== 'undefined' &&
    (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
  )
}

/**
 * Copies the element's DOM value into the form state when the two disagree.
 * Returns true when it changed the form state.
 */
function syncElement(el: TextControl, shouldValidate: boolean): boolean {
  const target = targets.get(el)
  if (!target) return false
  const { form, name } = target
  const domValue = el.value
  const current = form.getValues(name)
  if ((current ?? '') === domValue) return false
  form.setValue(name, domValue, { shouldDirty: true, shouldValidate })
  return true
}

function onNativeEvent(event: Event) {
  const el = event.currentTarget
  if (!isTextControl(el)) return
  // React's own onChange runs from its root listener later in this same
  // dispatch. Deferring to a microtask lets it go first, so ordinary typing
  // stays a no-op here and only events React ignored are synced.
  queueMicrotask(() => {
    const target = targets.get(el)
    if (!target) return
    syncElement(el, target.form.formState.isSubmitted)
  })
}

/**
 * Wraps a text-like field's `register()` result so its value also syncs from
 * the native `input` and `change` events.
 *
 * React only calls `onChange` when it sees the value change. A value assigned
 * by a script — a password manager, a browser extension, some autofill — sets
 * `.value` on the element first, so React's value tracker already holds it and
 * the following `input` event is ignored. The field shows the value, the form
 * state doesn't have it, and a required rule blocks the submit.
 */
export function withNativeInputSync<T extends FieldValues>(
  form: UseFormReturn<T>,
  registration: UseFormRegisterReturn,
): UseFormRegisterReturn {
  const { ref, name } = registration
  return {
    ...registration,
    ref: (el: unknown) => {
      ref(el as never)
      if (!isTextControl(el)) return
      if (!targets.has(el)) {
        el.addEventListener('input', onNativeEvent)
        el.addEventListener('change', onNativeEvent)
      }
      targets.set(el, { form: form as unknown as UseFormReturn<FieldValues>, name })
    },
  }
}

/**
 * Last-resort sync at submit: copies the DOM value of every field wired with
 * `withNativeInputSync` inside `container` into the form state. Covers autofill
 * that fills an input without firing any event until the user interacts.
 */
export function syncNativeValues(container: ParentNode) {
  container.querySelectorAll('input, textarea').forEach((el) => {
    if (isTextControl(el)) syncElement(el, false)
  })
}
