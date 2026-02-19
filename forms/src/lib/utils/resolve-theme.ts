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

// Helper function for type-safe merging
function mergeSection<T extends object>(global: Partial<Record<string, string>>, section: T): T {
  const result = { ...section }
  for (const key in global) {
    if (key in section && typeof (section as any)[key] === 'string' && typeof global[key] === 'string') {
      ;(result as any)[key] = clsx(global[key], (section as any)[key])
    } else if (
      key in section &&
      ((section as any)[key] == null ||
        (typeof (section as any)[key] === 'string' && (section as any)[key].trim() === '')) &&
      typeof global[key] === 'string'
    ) {
      ;(result as any)[key] = global[key]
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
