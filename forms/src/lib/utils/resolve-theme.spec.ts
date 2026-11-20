import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { createDefaultFormTheme, type FormTheme } from '@nestledjs/forms-core'
import { createFinalTheme } from './resolve-theme'
import { tailwindTheme } from '../themes/tailwind'

const SECTIONS = Object.keys(createDefaultFormTheme()) as (keyof FormTheme)[]

describe('createFinalTheme', () => {
  it('produces a complete theme — every section, every class name a string', () => {
    const theme = createFinalTheme({})

    expect(Object.keys(theme)).toEqual(SECTIONS)
    for (const section of SECTIONS) {
      const values = theme[section] as Record<string, unknown>
      for (const [key, value] of Object.entries(values)) {
        if (key.toLowerCase().endsWith('icon')) continue
        expect(typeof value, `${section}.${key}`).toBe('string')
      }
    }
  })

  it('leaves a non-inheritable section exactly as the tailwind base has it', () => {
    // `label` takes nothing from `global`, so it must come through untouched.
    expect(createFinalTheme({}).label).toEqual(tailwindTheme.label)
  })

  it('keeps real tailwind classes, not empty strings', () => {
    const theme = createFinalTheme({})

    expect(theme.label.base).toBe('block text-sm font-medium text-gray-700 mb-1')
    expect(theme.textField.input).toContain('block w-full px-3 py-2')
    expect(theme.button.primary).toContain('bg-sky-600')
  })

  it('lets a user override win over the tailwind base', () => {
    const theme = createFinalTheme({ textField: { helpText: 'my-help-class' } })

    expect(theme.textField.helpText).toBe('my-help-class')
    // Siblings keep the base.
    expect(theme.textField.input).toContain('block w-full px-3 py-2')
  })

  it('composes global into an inheritable section with clsx, global first', () => {
    const theme = createFinalTheme({})

    expect(theme.textField.input).toBe(`${tailwindTheme.global.input} ${tailwindTheme.textField.input}`)
  })

  it('does not apply global to a non-inheritable section', () => {
    const theme = createFinalTheme({})

    expect(theme.multiSelect.input).not.toContain(tailwindTheme.global.input)
    expect(theme.label.base).not.toContain(tailwindTheme.global.input)
  })

  it('uses the global value when an inheritable section leaves a key empty', () => {
    const theme = createFinalTheme({ textField: { disabled: '' } })

    expect(theme.textField.disabled).toBe(tailwindTheme.global.disabled)
  })

  it('carries the base theme element slots through by reference', () => {
    const theme = createFinalTheme({})

    // These are JSX elements in tailwind.tsx, and they must arrive as the very
    // same elements: a clone is what the old lodash deep merge produced, and it
    // dropped React's dev-only element fields on the way.
    expect(theme.checkbox.readonlyCheckedIcon).toBe(tailwindTheme.checkbox.readonlyCheckedIcon)
    expect(theme.customCheckbox.checkedIcon).toBe(tailwindTheme.customCheckbox.checkedIcon)
    expect(theme.radioField.readOnlyIcon).toBe(tailwindTheme.radioField.readOnlyIcon)
    // tailwind.tsx deliberately sets this one to null; it must stay null.
    expect(theme.customCheckbox.uncheckedIcon).toBeNull()
  })

  it('replaces an element slot rather than merging into the default icon', () => {
    const icon = createElement('svg', { 'data-icon': 'mine' }, createElement('circle'))
    const theme = createFinalTheme({ checkbox: { readonlyCheckedIcon: icon } })

    // A deep merge here produced a hybrid: the user's element type carrying the
    // default icon's props and leftover children.
    expect(theme.checkbox.readonlyCheckedIcon).toBe(icon)
  })

  it('lets a user clear an element slot with null', () => {
    const theme = createFinalTheme({ checkbox: { readonlyCheckedIcon: null } })

    expect(theme.checkbox.readonlyCheckedIcon).toBeNull()
  })

  it('does not mutate the tailwind base across calls', () => {
    const before = tailwindTheme.textField.input

    createFinalTheme({ textField: { input: 'one' } })
    createFinalTheme({ textField: { input: 'two' } })

    expect(tailwindTheme.textField.input).toBe(before)
  })
})
