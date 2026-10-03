'use client'

import { FormField, FormFieldProps, FormFieldType, useSearchSelect } from '@nestledjs/forms-core'
import { SearchSelectBase } from './search-select-base'
import { singleSelectDisplayValue } from './search-select-helpers'
import { useWatch } from 'react-hook-form'
import { useMemo } from 'react'

/**
 * Submit transformation for single Apollo search - converts option object to ID string.
 * Implementation lives in forms-core and is applied automatically by the Form submit path.
 */
export { singleSelectSubmitTransform } from '@nestledjs/forms-core'

export function SelectFieldSearchApollo<
  TDataItem extends { id: string; name?: string; firstName?: string; lastName?: string }
>({ form, field, hasError, formReadOnly = false, formReadOnlyStyle = 'value' }: FormFieldProps<Extract<FormField, { type: FormFieldType.SearchSelectApollo }>> & { formReadOnly?: boolean, formReadOnlyStyle?: 'value' | 'disabled' }) {
  const { options, loading: apolloLoading, handleSearchChange } = useSearchSelect<TDataItem>(field.options)

  // Use useWatch to get reactive form value updates
  const watchedValue = useWatch({
    control: form.control,
    name: field.key,
  })

  // Process the current form value to get the selected option
  const selectedOption = useMemo(() => {
    if (!watchedValue) {
      return null
    }
    
    // If it's already a proper option object, use it directly
    if (watchedValue && typeof watchedValue === 'object' && 'value' in watchedValue && 'label' in watchedValue) {
      return watchedValue
    }
    
    // If it's a string (ID), try to find the matching option from Apollo data
    if (typeof watchedValue === 'string') {
      const foundInApollo = options.find((option) => option.value === watchedValue)
      if (foundInApollo) {
        return foundInApollo
      }
      
      // If not found in Apollo data yet, create temporary option with ID as label
      return {
        value: watchedValue,
        label: watchedValue,
      }
    }
    
    // Handle unexpected format - convert to temporary option
    const id = String(watchedValue)
    return {
      value: id,
      label: id,
    }
  }, [watchedValue, options])

  return (
    <SearchSelectBase
      form={form}
      field={field}
      hasError={hasError}
      formReadOnly={formReadOnly}
      formReadOnlyStyle={formReadOnlyStyle}
      options={options}
      loading={apolloLoading}
      onSearchChange={handleSearchChange}
      searchDebounceMs={500}
      value={selectedOption}
      onChange={(option) => {
        // Store the full option object (like multi-search) instead of just the ID
        // Submit transformation will convert back to ID for API submission
        form.setValue(field.key, option || null, { shouldDirty: true, shouldTouch: true })
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