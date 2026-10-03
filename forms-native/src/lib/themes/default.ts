import { StyleSheet } from 'react-native'

/**
 * Default native theme using StyleSheet.create.
 * Provides a clean, Material-ish look out of the box.
 * Each field component can override these via *Style props,
 * or bypass them entirely with the `unstyled` prop for NativeWind users.
 */
export const defaultNativeTheme = {
  // ── Global ──
  global: StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
    },
    inputFocused: {
      borderColor: '#7dd3fc',
      borderWidth: 2,
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnly: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    readOnlyText: {
      fontSize: 16,
      color: '#374151',
    },
    errorText: {
      color: '#dc2626',
      fontSize: 13,
      marginTop: 4,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
    fieldWrapper: {
      marginBottom: 16,
    },
  }),

  // ── Label ──
  label: StyleSheet.create({
    base: {
      fontSize: 14,
      fontWeight: '500',
      color: '#374151',
      marginBottom: 4,
    },
    requiredIndicator: {
      color: '#dc2626',
      fontSize: 14,
    },
  }),

  // ── Text Field ──
  textField: StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnly: {
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    readOnlyText: {
      fontSize: 16,
      color: '#374151',
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── TextArea Field ──
  textAreaField: StyleSheet.create({
    textarea: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
      textAlignVertical: 'top',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── Email Field ──
  emailField: StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
  }),

  // ── Password Field ──
  passwordField: StyleSheet.create({
    container: {
      position: 'relative',
    },
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      paddingRight: 48,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    toggleButton: {
      position: 'absolute',
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
    },
    toggleText: {
      fontSize: 14,
      color: '#6b7280',
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── URL Field ──
  urlField: StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── Number Field ──
  numberField: StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── Money Field ──
  moneyField: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    currencySymbol: {
      fontSize: 16,
      color: '#6b7280',
      paddingHorizontal: 8,
    },
    currencySymbolHidden: {
      opacity: 0,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
  }),

  // ── Phone Field ──
  phoneField: StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: '#111827',
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── Checkbox ──
  checkbox: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    label: {
      fontSize: 16,
      color: '#374151',
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
    errorMessage: {
      color: '#dc2626',
      fontSize: 13,
      marginTop: 4,
    },
    disabled: {
      opacity: 0.5,
    },
    readOnly: {
      fontSize: 16,
      color: '#374151',
    },
  }),

  // ── Custom Checkbox ──
  customCheckbox: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    checkboxContainer: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: {
      fontSize: 16,
      color: '#374151',
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
    disabled: {
      opacity: 0.5,
    },
    readOnly: {
      fontSize: 16,
      color: '#374151',
    },
    checked: {
      // Styling applied when checked — override in theme
    },
    error: {
      // Styling applied on error — override in theme
    },
  }),

  // ── Switch Field ──
  switchField: StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 16,
      color: '#374151',
      flex: 1,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
    disabled: {
      opacity: 0.5,
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
    },
    error: {
      // Applied on error
    },
  }),

  // ── Checkbox Group ──
  checkboxGroup: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
    containerColumn: {
      flexDirection: 'column',
      gap: 8,
    },
    containerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    label: {
      fontSize: 16,
      color: '#374151',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
    },
    readOnlySelected: {
      fontSize: 16,
      color: '#374151',
    },
    readOnlyUnselected: {
      fontSize: 16,
      color: '#9ca3af',
    },
    disabled: {
      opacity: 0.5,
    },
  }),

  // ── Button ──
  button: StyleSheet.create({
    base: {
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: {
      backgroundColor: '#0284c7',
    },
    secondary: {
      backgroundColor: '#ffffff',
      borderWidth: 1,
      borderColor: '#d1d5db',
    },
    danger: {
      backgroundColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
    },
    loading: {
      opacity: 0.7,
    },
    fullWidth: {
      width: '100%',
    },
    text: {
      fontSize: 16,
      fontWeight: '600',
    },
    primaryText: {
      color: '#ffffff',
    },
    secondaryText: {
      color: '#374151',
    },
    dangerText: {
      color: '#ffffff',
    },
    disabledText: {
      color: '#9ca3af',
    },
  }),

  // ── Date Picker ──
  datePicker: StyleSheet.create({
    trigger: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: '#ffffff',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    triggerText: {
      fontSize: 16,
      color: '#111827',
    },
    placeholderText: {
      fontSize: 16,
      color: '#9ca3af',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── DateTime Picker (reuses datePicker styles) ──
  dateTimePicker: StyleSheet.create({
    trigger: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: '#ffffff',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    triggerText: {
      fontSize: 16,
      color: '#111827',
    },
    placeholderText: {
      fontSize: 16,
      color: '#9ca3af',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── Time Picker ──
  timePicker: StyleSheet.create({
    trigger: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: '#ffffff',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    triggerText: {
      fontSize: 16,
      color: '#111827',
    },
    placeholderText: {
      fontSize: 16,
      color: '#9ca3af',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── Select Field ──
  selectField: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
    container: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
    placeholder: {
      fontSize: 16,
      color: '#9ca3af',
    },
    selectedText: {
      fontSize: 16,
      color: '#111827',
    },
    itemText: {
      fontSize: 16,
      color: '#111827',
    },
    selectedItem: {
      backgroundColor: '#eff6ff',
    },
  }),

  // ── Multi Select ──
  multiSelect: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
    container: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
    selectedItem: {
      backgroundColor: '#eff6ff',
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginRight: 4,
      marginBottom: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectedItemText: {
      fontSize: 14,
      color: '#1e40af',
    },
    removeButton: {
      marginLeft: 4,
      padding: 2,
    },
    removeButtonText: {
      fontSize: 12,
      color: '#6b7280',
    },
    placeholder: {
      fontSize: 16,
      color: '#9ca3af',
    },
  }),

  // ── Radio Field ──
  radioField: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
    containerColumn: {
      flexDirection: 'column',
      gap: 8,
    },
    containerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    optionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    radio: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#d1d5db',
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioSelected: {
      borderColor: '#0284c7',
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#0284c7',
    },
    label: {
      fontSize: 16,
      color: '#374151',
    },
    disabled: {
      opacity: 0.5,
    },
    readOnlySelected: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    readOnlyUnselected: {
      fontSize: 16,
      color: '#9ca3af',
    },
    subOptionInput: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: '#111827',
      backgroundColor: '#ffffff',
      marginTop: 4,
      marginLeft: 30,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── Search Select ──
  searchSelect: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
    container: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      backgroundColor: '#ffffff',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
    placeholder: {
      fontSize: 16,
      color: '#9ca3af',
    },
    inputSearch: {
      fontSize: 16,
      color: '#111827',
    },
  }),

  // ── Custom Field ──
  customField: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
    readOnlyValue: {
      fontSize: 16,
      color: '#374151',
      minHeight: 40,
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    errorText: {
      color: '#dc2626',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── Markdown Editor ──
  markdownEditor: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
    editor: {
      borderWidth: 1,
      borderColor: '#d1d5db',
      borderRadius: 8,
      backgroundColor: '#ffffff',
      overflow: 'hidden',
    },
    toolbar: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    toolbarButton: {
      padding: 8,
      borderRadius: 4,
    },
    toolbarButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#6b7280',
    },
    textInput: {
      padding: 12,
      fontSize: 16,
      color: '#111827',
      textAlignVertical: 'top',
    },
    preview: {
      padding: 12,
    },
    toggleContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
    },
    toggleButtonActive: {
      borderBottomWidth: 2,
      borderBottomColor: '#0284c7',
    },
    toggleButtonText: {
      fontSize: 14,
      color: '#6b7280',
    },
    toggleButtonTextActive: {
      color: '#0284c7',
      fontWeight: '600',
    },
    error: {
      borderColor: '#dc2626',
    },
    disabled: {
      opacity: 0.5,
      backgroundColor: '#f3f4f6',
    },
    readOnlyValue: {
      padding: 12,
    },
    helpText: {
      color: '#6b7280',
      fontSize: 13,
      marginTop: 4,
    },
  }),

  // ── Content Field ──
  contentField: StyleSheet.create({
    wrapper: {
      flexDirection: 'column',
    },
  }),
} as const

export type NativeTheme = typeof defaultNativeTheme
