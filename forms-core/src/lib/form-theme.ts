// The form theme: its defaults, its type, and the `FormThemeSchema` wrapper.
//
// This module deliberately does not import zod. It used to build the theme out of
// ~310 nested `z.object({…}).default({})` calls, which only ever worked on zod 3:
// zod 4's `.default()` short-circuits, returning the given default *unparsed*, so
// the inner `z.string().default('')` leaves never ran and `parse({})` came back as
// 25 empty sections instead of a complete theme. (zod 4's replacement, `.prefault()`,
// does not exist in zod 3, so no single spelling worked on both majors.) Exporting a
// `ZodObject` also baked zod-3-only generics into the emitted `.d.ts`, which is what
// locked the whole package to one zod major.
//
// The defaults are now a plain TypeScript literal and the merge is a small
// key-driven resolver. `FormThemeSchema.parse` / `.safeParse` keep working exactly
// as before for theme shapes; see CHANGELOG for what a real zod schema offered that
// this does not (`.extend()`, `.shape`, handing it to a resolver).
//
// `dist/forms-core/lib/form-theme.d.ts` must not mention zod at all — that is the
// publish-gate check that this stays zod-major-agnostic — so keep zod out of the
// JSDoc on exported symbols too.

/**
 * Every theme section and its string members, all defaulting to `''`.
 *
 * Section order and key names are the public theme contract — `themeReference`,
 * `generateThemeTemplate` and every consumer theme are written against them.
 */
const THEME_DEFAULTS = {
  global: {
    input: '',
    error: '',
    disabled: '',
    readOnly: '',
  },
  label: {
    base: '',
    requiredIndicator: '',
  },
  textField: {
    input: '',
    error: '',
    disabled: '',
    readOnly: '',
    helpText: '',
  },
  checkbox: {
    wrapper: '',
    row: '',
    rowFullWidth: '',
    input: '',
    focus: '',
    checked: '',
    indeterminate: '',
    error: '',
    disabled: '',
    readOnly: '',
    label: '',
    fullWidthLabel: '',
    helpText: '',
    errorText: '',
  },
  customCheckbox: {
    wrapper: '',
    row: '',
    rowFullWidth: '',
    checkboxContainer: '',
    hiddenInput: '',
    customCheckbox: '',
    focus: '',
    checked: '',
    error: '',
    disabled: '',
    readOnly: '',
    label: '',
    fullWidthLabel: '',
    helpText: '',
    errorText: '',
  },
  customField: {
    wrapper: '',
    readOnlyInput: '',
    readOnlyValue: '',
    errorContainer: '',
    errorText: '',
  },
  datePicker: {
    wrapper: '',
    input: '',
    focus: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
  },
  dateTimePicker: {
    wrapper: '',
    input: '',
    focus: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
  },
  button: {
    base: '',
    primary: '',
    secondary: '',
    danger: '',
    disabled: '',
    loading: '',
    fullWidth: '',
  },
  emailField: {
    wrapper: '',
    input: '',
    focus: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
  },
  moneyField: {
    wrapper: '',
    container: '',
    currencySymbol: '',
    currencySymbolHidden: '',
    input: '',
    inputWithSymbol: '',
    focus: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
  },
  multiSelect: {
    wrapper: '',
    container: '',
    inputContainer: '',
    selectedItem: '',
    selectedItemLabel: '',
    selectedItemRemoveButton: '',
    selectedItemRemoveIcon: '',
    input: '',
    button: '',
    buttonIcon: '',
    dropdown: '',
    option: '',
    optionActive: '',
    optionSelected: '',
    optionLabel: '',
    optionCheckIcon: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
  },
  numberField: {
    input: '',
    focus: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
  },
  passwordField: {
    input: '',
    focus: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
  },
  phoneField: {
    wrapper: '',
    input: '',
    focus: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
    errorMessage: '',
  },
  radioField: {
    wrapper: '',
    container: '',
    containerRow: '',
    containerColumn: '',
    optionContainer: '',
    optionContainerFullWidth: '',
    optionContainerFancy: '',
    radioContainer: '',
    input: '',
    inputFullWidth: '',
    inputChecked: '',
    inputFocus: '',
    inputDisabled: '',
    label: '',
    labelFullWidth: '',
    labelRow: '',
    labelColumn: '',
    subOptionInput: '',
    subOptionError: '',
    readOnlyContainer: '',
    readOnlySelected: '',
    readOnlyUnselected: '',
  },
  checkboxGroup: {
    wrapper: '',
    container: '',
    containerRow: '',
    containerColumn: '',
    optionContainer: '',
    optionContainerFullWidth: '',
    optionContainerFancy: '',
    checkboxContainer: '',
    input: '',
    inputFullWidth: '',
    inputChecked: '',
    inputFocus: '',
    inputDisabled: '',
    error: '',
    disabled: '',
    label: '',
    labelFullWidth: '',
    labelRow: '',
    labelColumn: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
    readOnlyContainer: '',
    readOnlySelected: '',
    readOnlyUnselected: '',
    helpText: '',
  },
  searchSelectField: {
    wrapper: '',
    container: '',
    inputContainer: '',
    input: '',
    inputWithClear: '',
    button: '',
    buttonIcon: '',
    clearButton: '',
    clearIcon: '',
    dropdown: '',
    option: '',
    optionActive: '',
    optionSelected: '',
    optionLabel: '',
    optionCheckIcon: '',
    loadingText: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
    fallback: '',
  },
  searchSelectMultiField: {
    wrapper: '',
    container: '',
    inputContainer: '',
    selectedItem: '',
    selectedItemLabel: '',
    selectedItemRemoveButton: '',
    selectedItemRemoveIcon: '',
    input: '',
    button: '',
    buttonIcon: '',
    dropdown: '',
    option: '',
    optionActive: '',
    optionSelected: '',
    optionLabel: '',
    optionCheckIcon: '',
    loadingText: '',
    noResultsText: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
    fallback: '',
  },
  selectField: {
    wrapper: '',
    container: '',
    input: '',
    clearButton: '',
    clearIcon: '',
    arrow: '',
    arrowIcon: '',
    option: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyInput: '',
    readOnlyValue: '',
    helpText: '',
    fallback: '',
  },
  switchField: {
    wrapper: '',
    container: '',
    label: '',
    switchTrack: '',
    switchTrackOn: '',
    switchTrackOff: '',
    switchThumb: '',
    switchThumbOn: '',
    switchThumbOff: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyValue: '',
    helpText: '',
  },
  textAreaField: {
    wrapper: '',
    textarea: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyValue: '',
    helpText: '',
  },
  markdownEditor: {
    wrapper: '',
    editor: '',
    toolbar: '',
    preview: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyValue: '',
    helpText: '',
  },
  timePickerField: {
    wrapper: '',
    input: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyValue: '',
    helpText: '',
  },
  urlField: {
    wrapper: '',
    input: '',
    error: '',
    disabled: '',
    readOnly: '',
    readOnlyValue: '',
    helpText: '',
  },
  // Add more fields as needed
} as const satisfies Record<string, Record<string, string>>

/**
 * Theme members that hold a rendered element (or `null`) rather than a class
 * string. These have no default — they are optional, and whatever a theme puts
 * there is carried through by reference.
 */
const ICON_SLOTS = {
  checkbox: ['readonlyCheckedIcon', 'readonlyUncheckedIcon'],
  customCheckbox: ['checkedIcon', 'uncheckedIcon', 'readonlyCheckedIcon', 'readonlyUncheckedIcon'],
  radioField: ['readOnlyIcon', 'readOnlyUnselectedIcon'],
} as const

type ThemeDefaults = typeof THEME_DEFAULTS
type IconSlots = typeof ICON_SLOTS

/** A section's class-name members: every key of the defaults, as a mutable `string`. */
type StringMembers<S extends keyof ThemeDefaults> = {
  -readonly [K in keyof ThemeDefaults[S]]: string
}

/** A section's optional element members, if it has any. */
type IconMembers<S extends keyof ThemeDefaults> = S extends keyof IconSlots
  ? { [K in IconSlots[S][number]]?: any }
  : Record<never, never>

/**
 * The complete, resolved form theme: every section present, every class-name
 * member a `string`, element slots optional.
 */
export type FormTheme = {
  -readonly [S in keyof ThemeDefaults]: StringMembers<S> & IconMembers<S>
}

/** Section names, in declaration order. */
const SECTION_NAMES = Object.keys(THEME_DEFAULTS) as (keyof ThemeDefaults)[]

const ICON_SLOT_LOOKUP: Partial<Record<keyof ThemeDefaults, readonly string[]>> = ICON_SLOTS

/**
 * A fresh, complete theme with every class-name member `''`.
 *
 * Returns a new object (sections included) on every call, so callers can merge
 * into the result without mutating shared state.
 */
export function createDefaultFormTheme(): FormTheme {
  const theme: Record<string, Record<string, unknown>> = {}
  for (const section of SECTION_NAMES) {
    theme[section] = { ...THEME_DEFAULTS[section] }
  }
  return theme as FormTheme
}

/**
 * The shared default theme — every class-name member `''`, no element slots set.
 *
 * Treat it as read-only; use {@link createDefaultFormTheme} when you need a copy
 * you can mutate.
 */
export const defaultFormTheme: FormTheme = createDefaultFormTheme()

/** What a theme input may look like: any subset of {@link FormTheme}. */
export type FormThemeInput = {
  [S in keyof FormTheme]?: { [K in keyof FormTheme[S]]?: FormTheme[S][K] | null }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Resolves a (possibly partial) theme into a complete {@link FormTheme}.
 *
 * Behaves as `FormThemeSchema.parse()` always has: unknown sections and unknown
 * keys are dropped, absent or nullish class names fall back to the default `''`,
 * and a wrong-typed class name throws. Element slots are copied by reference, so
 * JSX elements — and an explicit `null` — survive untouched.
 *
 * @param input A partial theme, or nothing for the defaults.
 * @throws Error naming the failing path when a section or class name is wrong-typed.
 */
export function resolveFormTheme(input?: FormThemeInput | null): FormTheme {
  const resolved = createDefaultFormTheme()
  if (input === undefined || input === null) return resolved
  if (!isPlainObject(input)) {
    throw new Error(`Invalid form theme: expected an object, received ${typeof input}`)
  }

  const source = input as Record<string, unknown>
  for (const section of SECTION_NAMES) {
    if (!(section in source)) continue
    const rawSection = source[section]
    if (rawSection === undefined || rawSection === null) continue
    if (!isPlainObject(rawSection)) {
      throw new Error(`Invalid form theme: "${section}" must be an object, received ${typeof rawSection}`)
    }

    const target = resolved[section] as Record<string, unknown>

    for (const key of Object.keys(THEME_DEFAULTS[section])) {
      if (!(key in rawSection)) continue
      const value = rawSection[key]
      // Absent/nullish keeps the default, matching `.default('')`.
      if (value === undefined || value === null) continue
      if (typeof value !== 'string') {
        throw new Error(`Invalid form theme: "${section}.${key}" must be a string, received ${typeof value}`)
      }
      target[key] = value
    }

    // Element slots accept anything, including null, and are never copied deeply.
    for (const slot of ICON_SLOT_LOOKUP[section] ?? []) {
      if (slot in rawSection) target[slot] = rawSection[slot]
    }
  }

  return resolved
}

/**
 * The surface `FormThemeSchema` offers. Declared independently of any validation
 * library on purpose: a library-specific schema type carries major-version
 * generics into the emitted `.d.ts`, which is what pinned these packages to a
 * single major.
 */
export interface FormThemeSchemaLike {
  parse(input?: unknown): FormTheme
  safeParse(input?: unknown): { success: true; data: FormTheme } | { success: false; error: unknown }
}

/**
 * Backwards-compatible stand-in for the schema this used to be.
 *
 * `parse` and `safeParse` behave as they always did for theme shapes. The other
 * schema methods (`.extend()`, `.shape`, `.partial()`, handing it to a form
 * resolver) are gone — it was never a validation schema for user input. See
 * CHANGELOG for the details.
 *
 * The explicit annotation is load-bearing: it is what keeps the emitted
 * declarations library-agnostic.
 */
export const FormThemeSchema: FormThemeSchemaLike = {
  parse: (input?: unknown) => resolveFormTheme(input as FormThemeInput | null | undefined),
  safeParse: (input?: unknown) => {
    try {
      return { success: true, data: resolveFormTheme(input as FormThemeInput | null | undefined) }
    } catch (error) {
      return { success: false, error }
    }
  },
}
