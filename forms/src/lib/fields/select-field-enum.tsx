'use client'

import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { SelectField } from './select-field'

export function SelectFieldEnum({ form, field, hasError, formReadOnly = false, formReadOnlyStyle = 'value' }: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.EnumSelect }>> & { formReadOnly?: boolean, formReadOnlyStyle?: 'value' | 'disabled' }>) {
  // Transform enum to select options.
  // Numeric TS enums include reverse mappings (value -> name) in Object.entries,
  // so skip entries whose key is a numeric string to keep only the real members.
  const selectOptions = Object.entries(field.options.enum || {})
    .filter(([key]) => Number.isNaN(Number(key)))
    .map(([label, value]) => ({
      label,
      value: String(value)
    }))
  
  // Create a Select field with the transformed options
  const selectField: Extract<FormField, { type: FormFieldType.Select }> = {
    ...field,
    type: FormFieldType.Select,
    options: {
      ...field.options,
      options: selectOptions
    }
  }
  
  return (
    <SelectField 
      form={form} 
      field={selectField} 
      hasError={hasError} 
      formReadOnly={formReadOnly}
      formReadOnlyStyle={formReadOnlyStyle}
    />
  )
} 