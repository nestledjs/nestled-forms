import clsx from 'clsx'
import { resolveFormTheme } from '@nestledjs/forms-core'
import type { FormTheme, DeepPartial } from '@nestledjs/forms-core'
import { tailwindTheme } from '../themes/tailwind'

/**
 * Creates the final, fully resolved theme for the entire form. This is the
 * single source of truth for theme processing, called once within the <Form> component.
 *
 * It performs a two-step process:
 * 1. Deeply merges the user-provided `userTheme` on top of the `tailwindTheme` base.
 * 2. Performs an "inheritance" pass, where only specific component themes
 *    (like `textField`) have the `global` theme section merged into them.
 *
 * @param userTheme The partial theme provided by the user from the <Form> props.
 * @returns The final, complete, and inherited FormTheme object to be put in context.
 */

// Check if a value is empty (null, undefined, or empty string)
function isEmptyValue(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}

// Merge a single key from global into section
function mergeKey(
  globalValue: string | undefined,
  sectionValue: unknown
): unknown {
  // Both are strings - combine with clsx
  if (typeof sectionValue === 'string' && typeof globalValue === 'string') {
    return clsx(globalValue, sectionValue)
  }
  // Section is empty but global has value - use global
  if (isEmptyValue(sectionValue) && typeof globalValue === 'string') {
    return globalValue
  }
  // Keep section value
  return sectionValue
}

// Helper function for type-safe merging
function mergeSection<T extends object>(global: Partial<Record<string, string>>, section: T): T {
  const result = { ...section }
  for (const key in global) {
    if (key in section) {
      (result as Record<string, unknown>)[key] = mergeKey(global[key], (section as Record<string, unknown>)[key])
    }
  }
  return result
}

/**
 * Lays a user theme over a base theme, one section at a time.
 *
 * Deliberately not a deep merge. The theme is exactly two levels — section, then
 * class name or element — so a per-section copy is both correct and cheaper.
 * `lodash.merge` used to do this and got element slots wrong: a React element is
 * a plain object, so a user's `readonlyCheckedIcon` was deep-merged *into* the
 * default icon rather than replacing it, which can render a hybrid of the two
 * (the user's `type` with leftovers of the default's `props`/children). It also
 * cloned every default icon on the way through, and pulled the whole of
 * lodash-es into the published bundle for this one call.
 *
 * An `undefined` override is ignored, as it was before: it means "not set".
 */
function layerOverBase(base: FormTheme, override: DeepPartial<FormTheme>): FormTheme {
  const overrides = override as Record<string, Record<string, unknown> | undefined>
  const result: Record<string, Record<string, unknown>> = {}

  for (const [section, values] of Object.entries(base)) {
    const merged: Record<string, unknown> = { ...(values as Record<string, unknown>) }
    for (const [key, value] of Object.entries(overrides[section] ?? {})) {
      if (value !== undefined) merged[key] = value
    }
    result[section] = merged
  }

  return result as FormTheme
}

export function createFinalTheme(userTheme: DeepPartial<FormTheme> = {}): FormTheme {
  // --- Step 1: Handle User Overrides ---
  const mergedTheme = layerOverBase(tailwindTheme, userTheme)

  // --- Step 2: Handle Inheritance from Global (The Smart Way) ---
  const finalTheme = { ...mergedTheme }
  const globalStyles = finalTheme.global

  if (!globalStyles) {
    return resolveFormTheme(finalTheme)
  }

  // Define which keys to apply inheritance to
  const inheritableKeys: (keyof FormTheme)[] = [
    'textField',
    'checkbox',
    'customCheckbox',
    'customField',
    'datePicker',
    'dateTimePicker',
    'emailField',
    'moneyField',
    'numberField',
    'passwordField',
    'phoneField',
    'radioField',
    'checkboxGroup',
    'searchSelectField',
    'searchSelectMultiField',
    'selectField',
    'switchField',
    'textAreaField',
    'markdownEditor',
    'timePickerField',
    'urlField',
    'button'
  ]

  for (const key of inheritableKeys) {
    const section = finalTheme[key]
    if (!section) continue

    // Use type assertion to merge all inheritable sections uniformly
    (finalTheme as Record<string, object>)[key] = mergeSection(
      globalStyles,
      section as Record<string, string>
    )
  }

  return resolveFormTheme(finalTheme)
}
