'use client'

import { FormField, FormFieldProps, FormFieldType, useFormTheme } from '@nestledjs/forms-core'
import { SearchSelectBase } from './search-select-base'
import { SelectedItems, multiSelectDisplayValue } from './search-select-helpers'

export function SelectFieldMultiSearch({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.SearchSelectMulti }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme()

  const value = form.getValues(field.key) ?? []

  return (
    <SearchSelectBase
      form={form}
      field={field}
      hasError={hasError}
      formReadOnly={formReadOnly}
      formReadOnlyStyle={formReadOnlyStyle}
      options={field.options.options || []}
      loading={field.options.loading}
      onSearchChange={field.options.onSearchChange}
      searchDebounceMs={field.options.searchDebounceMs}
      value={value}
      onChange={(items) => {
        // Multi-select should use empty array instead of null
        form.setValue(field.key, items || [], { shouldDirty: true, shouldTouch: true })
        // Trigger form validation/dirty state
        if (form.trigger) {
          form.trigger(field.key)
        }
      }}
      displayValue={multiSelectDisplayValue}
      multiple={true}
      themeKey="searchSelectMultiField"
      renderSelectedItems={(value, onChange) => (
        <SelectedItems 
          value={value} 
          onChange={onChange} 
          theme={theme.searchSelectMultiField} 
        />
      )}
    />
  )
} 