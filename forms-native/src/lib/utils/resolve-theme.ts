import { defaultNativeTheme, NativeTheme } from '../themes/default'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

function mergeStyles(
  defaultStyle: Record<string, unknown>,
  userStyle: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (userStyle) {
    return { ...defaultStyle, ...userStyle }
  }
  return defaultStyle
}

function mergeSection(
  defaultSection: Record<string, unknown>,
  userSection: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!userSection) {
    return defaultSection
  }

  const merged: Record<string, unknown> = {}

  // Merge styles from defaults with user overrides
  for (const styleKey of Object.keys(defaultSection)) {
    const defaultStyle = defaultSection[styleKey] as Record<string, unknown>
    const userStyle = userSection[styleKey] as Record<string, unknown> | undefined
    merged[styleKey] = mergeStyles(defaultStyle, userStyle)
  }

  // Include any additional keys from user that aren't in defaults
  for (const styleKey of Object.keys(userSection)) {
    if (!(styleKey in merged)) {
      merged[styleKey] = userSection[styleKey]
    }
  }

  return merged
}

/**
 * Creates the final native theme by merging user overrides on top of defaults.
 * Unlike the web version which uses CSS class strings, the native version
 * merges StyleSheet objects.
 */
export function createFinalNativeTheme(
  userTheme: DeepPartial<NativeTheme> = {}
): NativeTheme {
  if (!userTheme || Object.keys(userTheme).length === 0) {
    return defaultNativeTheme
  }

  const result: Record<string, unknown> = {}

  for (const sectionKey of Object.keys(defaultNativeTheme) as (keyof NativeTheme)[]) {
    const defaultSection = defaultNativeTheme[sectionKey] as Record<string, unknown>
    const userSection = (userTheme as Record<string, unknown>)[sectionKey] as Record<string, unknown> | undefined
    result[sectionKey] = mergeSection(defaultSection, userSection)
  }

  return result as NativeTheme
}
