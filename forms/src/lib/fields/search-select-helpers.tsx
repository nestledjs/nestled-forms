'use client'

import { SearchSelectOption } from '@nestledjs/forms-core'

// Selected items component for multi-select
export function SelectedItems({
  value,
  onChange,
  theme,
}: Readonly<{
  value: SearchSelectOption[]
  onChange: (items: SearchSelectOption[]) => void
  theme: any
}>) {
  // Defensive check for undefined or null values
  const items = value ?? []

  return (
    <>
      {items.map((item: SearchSelectOption) => (
        <span key={item.value} className={theme.selectedItem}>
          <span className={theme.selectedItemLabel}>{item.label}</span>
          <button
            type="button"
            className={theme.selectedItemRemoveButton}
            onClick={() => onChange(items.filter((v: SearchSelectOption) => v.value !== item.value))}
            aria-label={`Remove ${item.label}`}
          >
            <svg
              className={theme.selectedItemRemoveIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
    </>
  )
}

// Display value functions
export function singleSelectDisplayValue(value: SearchSelectOption | null): string {
  return value?.label ?? ''
}

export function multiSelectDisplayValue(value: SearchSelectOption[]): string {
  // For multi-select, always return empty string so input stays clear for next search
  // Selected items are displayed as tokens above the input
  return ''
}

// Option mapping functions (implementation lives in forms-core, shared with forms-native)
export { defaultOptionsMap } from '@nestledjs/forms-core'

// Custom placeholder logic
export function getPlaceholder(
  field: any,
  selectedCount = 0,
  isMulti = false
): string {
  if (isMulti && selectedCount > 0) {
    return ''
  }
  return field.options.placeholder || field.options.label
} 