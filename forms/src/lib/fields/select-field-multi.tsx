'use client'

import { FormFieldProps, FormField, FormFieldType, useFormTheme } from '@nestledjs/forms-core'
import { SearchSelectBase } from './search-select-base'
import { SelectedItems } from './search-select-helpers'
import { useWatch } from 'react-hook-form'

export function SelectFieldMulti({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.MultiSelect }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const theme = useFormTheme()

  const value = useWatch({ control: form.control, name: field.key }) ?? []

  // Convert SelectOption[] to SearchSelectOption[] by ensuring values are strings
  const searchOptions = (field.options?.options ?? []).map((option) => ({
    label: option.label,
    value: String(option.value),
  }))

  return (
    <SearchSelectBase
      form={form}
      field={field}
      hasError={hasError}
      formReadOnly={formReadOnly}
      formReadOnlyStyle={formReadOnlyStyle}
      options={searchOptions}
      // No search functionality - just client-side filtering handled by SearchSelectBase
      value={value}
      onChange={(newValue) =>
        form.setValue(field.key, newValue, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
      }
      displayValue={() => ''} // Always empty for multi-select
      multiple={true}
      themeKey="multiSelect"
      renderSelectedItems={(value, onChange) => (
        <SelectedItems value={value} onChange={onChange} theme={theme.multiSelect} />
      )}
    />
  )
}
