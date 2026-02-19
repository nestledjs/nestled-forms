import { merge } from 'lodash-es'
import clsx from 'clsx'
import { FormThemeSchema } from '@nestledjs/forms-core'
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
      ;(result as Record<string, unknown>)[key] = mergeKey(global[key], (section as Record<string, unknown>)[key])
    }
  }
  return result
}

export function createFinalTheme(userTheme: DeepPartial<FormTheme> = {}): FormTheme {
  // --- Step 1: Handle User Overrides ---
  const mergedTheme = merge({}, tailwindTheme, userTheme)

  // --- Step 2: Handle Inheritance from Global (The Smart Way) ---
  const finalTheme = { ...mergedTheme }
  const globalStyles = finalTheme.global

  if (!globalStyles) {
    return FormThemeSchema.parse(finalTheme)
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
    ;(finalTheme as Record<string, object>)[key] = mergeSection(
      globalStyles,
      section as Record<string, string>
    )
  }

  return FormThemeSchema.parse(finalTheme)
}
