'use client'

import { FormField, FormFieldProps, FormFieldType, useFormTheme, useLoadOptions } from '@nestledjs/forms-core'
import { SearchSelectBase } from './search-select-base'
import { SelectedItems, multiSelectDisplayValue } from './search-select-helpers'
import { useWatch } from 'react-hook-form'

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

  const value = useWatch({ control: form.control, name: field.key }) ?? []

  // loadOptions mode: the hook manages options/loading/search; the input's own
  // debounce (SearchSelectBase) already paces calls, so debounceMs is 0
  const asyncSearch = useLoadOptions(field.options.loadOptions, field.options.options || [])
  const usingLoadOptions = !!field.options.loadOptions

  return (
    <SearchSelectBase
      form={form}
      field={field}
      hasError={hasError}
      formReadOnly={formReadOnly}
      formReadOnlyStyle={formReadOnlyStyle}
      options={usingLoadOptions ? asyncSearch.options : field.options.options || []}
      loading={usingLoadOptions ? asyncSearch.loading : field.options.loading}
      onSearchChange={usingLoadOptions ? asyncSearch.handleSearchChange : field.options.onSearchChange}
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