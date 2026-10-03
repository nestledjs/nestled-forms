'use client'

import { FormField, FormFieldProps, FormFieldType, useLoadOptions } from '@nestledjs/forms-core'
import { SearchSelectBase } from './search-select-base'
import { singleSelectDisplayValue } from './search-select-helpers'
import { useWatch } from 'react-hook-form'

export function SelectFieldSearch({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.SearchSelect }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const value = useWatch({ control: form.control, name: field.key })

  // loadOptions mode: the hook manages options/loading/search; the input's own
  // debounce (SearchSelectBase) already paces calls, so debounceMs is 0
  const asyncSearch = useLoadOptions(field.options.loadOptions, field.options.options)
  const usingLoadOptions = !!field.options.loadOptions
  const options = usingLoadOptions ? asyncSearch.options : field.options.options
  const selectedOption = options.find(o => o.value === value) ?? null

  return (
    <SearchSelectBase
      form={form}
      field={field}
      hasError={hasError}
      formReadOnly={formReadOnly}
      formReadOnlyStyle={formReadOnlyStyle}
      options={options}
      loading={usingLoadOptions ? asyncSearch.loading : field.options.loading}
      onSearchChange={usingLoadOptions ? asyncSearch.handleSearchChange : field.options.onSearchChange}
      searchDebounceMs={field.options.searchDebounceMs}
      value={selectedOption}
      onChange={(option) => {
        form.setValue(field.key, option?.value || null, { shouldDirty: true, shouldTouch: true })
        // Trigger form validation/dirty state
        if (form.trigger) {
          form.trigger(field.key)
        }
      }}
      displayValue={singleSelectDisplayValue}
      themeKey="searchSelectField"
    />
  )
} 