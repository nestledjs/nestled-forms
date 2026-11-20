import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import {
  FormThemeSchema,
  createDefaultFormTheme,
  defaultFormTheme,
  resolveFormTheme,
  type FormTheme,
} from './form-theme'

/** The sections the theme is contractually made of, in declaration order. */
const SECTIONS = [
  'global',
  'label',
  'textField',
  'checkbox',
  'customCheckbox',
  'customField',
  'datePicker',
  'dateTimePicker',
  'button',
  'emailField',
  'moneyField',
  'multiSelect',
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
] as const

describe('FormThemeSchema.parse({})', () => {
  // The regression this file exists for: the theme used to be ~310 nested
  // `z.object({…}).default({})` calls, and zod 4's `.default()` returns the
  // default unparsed, so every section came back `{}` and every field rendered
  // with browser-default styling.
  it('fills in every default instead of returning empty sections', () => {
    const theme = FormThemeSchema.parse({})

    expect(Object.keys(theme)).toEqual([...SECTIONS])
    for (const section of SECTIONS) {
      const keys = Object.keys(theme[section])
      expect(keys.length, `${section} has no defaults`).toBeGreaterThan(0)
      for (const key of keys) {
        expect(typeof (theme[section] as Record<string, unknown>)[key], `${section}.${key}`).toBe('string')
      }
    }
  })

  it('spot-checks the leaves that reached the renderers as undefined', () => {
    const theme = FormThemeSchema.parse({})

    expect(theme.global.input).toBe('')
    expect(theme.textField.input).toBe('')
    expect(theme.urlField.helpText).toBe('')
  })

  it('accepts no argument at all', () => {
    expect(Object.keys(FormThemeSchema.parse())).toEqual([...SECTIONS])
  })
})

describe('resolveFormTheme', () => {
  it('merges a partial input without losing sibling defaults', () => {
    const theme = resolveFormTheme({ textField: { input: 'border p-2' } })

    expect(theme.textField.input).toBe('border p-2')
    expect(theme.textField.error).toBe('')
    expect(theme.textField.helpText).toBe('')
    expect(theme.global.input).toBe('')
    expect(Object.keys(theme)).toEqual([...SECTIONS])
  })

  it('strips unknown sections and unknown keys, as the schema did', () => {
    const theme = resolveFormTheme({
      textField: { input: 'kept', notAKey: 'dropped' },
      notASection: { input: 'dropped' },
    } as unknown as Parameters<typeof resolveFormTheme>[0])

    expect(theme.textField.input).toBe('kept')
    expect(theme).not.toHaveProperty('notASection')
    expect(theme.textField).not.toHaveProperty('notAKey')
  })

  it('keeps the default when a class name is absent or nullish', () => {
    const theme = resolveFormTheme({ textField: { input: undefined, error: null } })

    expect(theme.textField.input).toBe('')
    expect(theme.textField.error).toBe('')
  })

  it('carries element slots through by reference, including null', () => {
    const checked = createElement('svg', { 'data-icon': 'checked' })
    const theme = resolveFormTheme({
      checkbox: { readonlyCheckedIcon: checked, readonlyUncheckedIcon: null },
    })

    // `toBe`, not `toEqual`: a clone would break identity-based memoization and
    // is exactly what a generic deep merge would do here.
    expect(theme.checkbox.readonlyCheckedIcon).toBe(checked)
    expect(theme.checkbox.readonlyUncheckedIcon).toBeNull()
  })

  it('leaves element slots absent when the input does not set them', () => {
    const theme = resolveFormTheme({ checkbox: { input: 'x' } })

    expect(theme.checkbox).not.toHaveProperty('readonlyCheckedIcon')
  })

  it('throws naming the path when a class name is the wrong type', () => {
    expect(() => resolveFormTheme({ textField: { input: 42 } } as unknown as FormTheme)).toThrow(
      /"textField\.input" must be a string, received number/,
    )
  })

  it('throws naming the section when a section is not an object', () => {
    expect(() => resolveFormTheme({ textField: 'nope' } as unknown as FormTheme)).toThrow(
      /"textField" must be an object, received string/,
    )
  })

  it('treats a missing input as the defaults', () => {
    expect(resolveFormTheme()).toEqual(createDefaultFormTheme())
    expect(resolveFormTheme(null)).toEqual(createDefaultFormTheme())
  })
})

describe('FormThemeSchema.safeParse', () => {
  it('reports success with the resolved theme', () => {
    const result = FormThemeSchema.safeParse({ global: { input: 'g' } })

    expect(result.success).toBe(true)
    expect(result.success && result.data.global.input).toBe('g')
  })

  it('reports failure instead of throwing', () => {
    const result = FormThemeSchema.safeParse({ global: { input: 1 } })

    expect(result.success).toBe(false)
    expect(result.success === false && (result.error as Error).message).toMatch(/"global\.input"/)
  })
})

describe('createDefaultFormTheme', () => {
  it('returns independent objects so callers can mutate their copy', () => {
    const first = createDefaultFormTheme()
    const second = createDefaultFormTheme()

    expect(first).not.toBe(second)
    expect(first.global).not.toBe(second.global)

    first.global.input = 'mutated'
    expect(second.global.input).toBe('')
    expect(defaultFormTheme.global.input).toBe('')
  })

  it('matches the shared defaultFormTheme by value', () => {
    expect(createDefaultFormTheme()).toEqual(defaultFormTheme)
  })
})
