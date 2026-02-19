import { defaultNativeTheme, NativeTheme } from '../themes/default'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
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

  const result: Record<string, any> = {}

  for (const sectionKey of Object.keys(defaultNativeTheme) as (keyof NativeTheme)[]) {
    const defaultSection = defaultNativeTheme[sectionKey]
    const userSection = (userTheme as any)[sectionKey]

    if (!userSection) {
      result[sectionKey] = defaultSection
      continue
    }

    // Merge each style key within the section
    const merged: Record<string, any> = {}
    for (const styleKey of Object.keys(defaultSection)) {
      const defaultStyle = (defaultSection as any)[styleKey]
      const userStyle = userSection[styleKey]
      if (userStyle) {
        // Flatten the merge: user styles override default style properties
        merged[styleKey] = { ...defaultStyle, ...userStyle }
      } else {
        merged[styleKey] = defaultStyle
      }
    }

    // Include any additional keys from user that aren't in defaults
    for (const styleKey of Object.keys(userSection)) {
      if (!(styleKey in merged)) {
        merged[styleKey] = userSection[styleKey]
      }
    }

    result[sectionKey] = merged
  }

  return result as NativeTheme
}
