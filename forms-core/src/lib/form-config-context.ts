'use client'

import { createContext, useContext } from 'react';

/**
 * All user-facing strings the library renders. Override any subset through the
 * Form `strings` prop to localize or rephrase; defaults are English.
 */
export interface FormStrings {
  /** Fallback error for required fields (per-field errorMessages.required wins) */
  requiredError: string
  /** Search select: shown while options are loading */
  loading: string
  /** Search select: no options match the current search */
  noResults: string
  /** Search select: the options list is empty */
  noOptions: string
  /** Select: default placeholder option */
  selectPlaceholder: string
  /** Search inputs: default placeholder */
  searchPlaceholder: string
  /** Read-only checkbox/switch: checked */
  readOnlyYes: string
  /** Read-only checkbox/switch: unchecked */
  readOnlyNo: string
  /** Read-only multi selections: nothing selected */
  noneSelected: string
  /** aria-label for the search select clear button */
  clearSelection: string
  /** aria-label for the search select dropdown toggle */
  toggleDropdown: string
  /** aria-label for a multi-select chip's remove button */
  removeItem: (label: string) => string
}

export const DEFAULT_FORM_STRINGS: FormStrings = {
  requiredError: 'This field is required',
  loading: 'Loading...',
  noResults: 'No results found',
  noOptions: 'No options available',
  selectPlaceholder: 'Select an option...',
  searchPlaceholder: 'Search...',
  readOnlyYes: 'Yes',
  readOnlyNo: 'No',
  noneSelected: 'No options selected',
  clearSelection: 'Clear selection',
  toggleDropdown: 'Toggle dropdown',
  removeItem: (label: string) => `Remove ${label}`,
}

/**
 * Resolves a partial strings override against the English defaults.
 */
export function resolveFormStrings(overrides?: Partial<FormStrings>): FormStrings {
  return overrides ? { ...DEFAULT_FORM_STRINGS, ...overrides } : DEFAULT_FORM_STRINGS
}

/**
 * Configuration interface for form-wide settings.
 *
 * @interface FormConfig
 * @property labelDisplay - Controls global label visibility: 'all' shows all labels, 'default' hides checkbox labels, 'none' hides all labels
 * @property strings - Resolved user-facing strings (see FormStrings)
 */
export interface FormConfig {
  labelDisplay: 'all' | 'default' | 'none';
  strings: FormStrings;
}

// Create the context with a default value
export const FormConfigContext = createContext<FormConfig>({
  labelDisplay: 'default', // 'default' is the sensible default
  strings: DEFAULT_FORM_STRINGS,
});

/**
 * Hook to access form configuration settings within a Form component.
 * 
 * Provides access to form-wide configuration like label display preferences.
 * Useful for custom field components that need to respect global form settings.
 * 
 * Must be used within a Form component.
 * 
 * @returns The form configuration object
 * @throws Error if used outside of a Form component
 * 
 * @example
 * ```tsx
 * function CustomFieldWithLabel() {
 *   const { labelDisplay } = useFormConfig()
 *   
 *   const shouldShowLabel = labelDisplay === 'all' || 
 *     (labelDisplay === 'default' && fieldType !== 'checkbox')
 *   
 *   return (
 *     <div>
 *       {shouldShowLabel && <label>Field Label</label>}
 *       <input type="text" />
 *     </div>
 *   )
 * }
 * 
 * // Usage within a Form
 * <Form id="my-form" labelDisplay="none" submit={handleSubmit}>
 *   <CustomFieldWithLabel />
 * </Form>
 * ```
 */
export function useFormConfig() {
  const context = useContext(FormConfigContext);
  if (!context) {
    // This should theoretically never happen if used correctly
    throw new Error('useFormConfig must be used within a <Form> component.');
  }
  return context;
} 