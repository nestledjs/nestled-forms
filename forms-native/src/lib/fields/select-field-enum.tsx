import React from 'react'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { SelectField } from './select-field'

export function SelectFieldEnum({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.EnumSelect }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}>) {
  const selectOptions = Object.entries(field.options.enum || {}).map(([label, value]) => ({
    label,
    value: String(value),
  }))

  const selectField: Extract<FormField, { type: FormFieldType.Select }> = {
    ...field,
    type: FormFieldType.Select,
    options: {
      ...field.options,
      options: selectOptions,
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
