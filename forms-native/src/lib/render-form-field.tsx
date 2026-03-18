import React, { useMemo, useEffect, useRef } from 'react'
import { View, Text, ViewStyle } from 'react-native'
import { useWatch } from 'react-hook-form'
import { FormField, FormFieldType, useFormContext, useFormConfig, DEFAULT_REQUIRED_ERROR_MESSAGE } from '@nestledjs/forms-core'
import { useNativeTheme } from './native-theme-context'

import { TextField } from './fields/text-field'
import { TextAreaField } from './fields/textarea-field'
import { EmailField } from './fields/email-field'
import { PasswordField } from './fields/password-field'
import { UrlField } from './fields/url-field'
import { PhoneField } from './fields/phone-field'
import { NumberField } from './fields/number-field'
import { MoneyField } from './fields/money-field'
import { CheckboxField } from './fields/checkbox-field'
import { SwitchField } from './fields/switch-field'
import { ButtonField } from './fields/button-field'
import { DatePickerField } from './fields/datepicker-field'
import { DateTimePickerField } from './fields/datetimepicker-field'
import { TimePickerField } from './fields/timepicker-field'
import { SelectField } from './fields/select-field'
import { SelectFieldEnum } from './fields/select-field-enum'
import { SelectFieldMulti } from './fields/select-field-multi'
import { RadioField } from './fields/radio-field'
import { CheckboxGroupField } from './fields/checkbox-group'
import { SelectFieldSearch } from './fields/select-field-search'
import { SelectFieldSearchApollo } from './fields/select-field-search-apollo'
import { SelectFieldMultiSearch } from './fields/select-field-multi-search'
import { SelectFieldMultiSearchApollo } from './fields/select-field-multi-search-apollo'
import { CustomField } from './fields/custom-field'
import { CustomCheckboxField } from './fields/custom-checkbox-field'
import { MarkdownEditor } from './fields/markdown-editor'
import { ContentField } from './fields/content-field'
import { FormLabel } from './fields/label'

function renderComponent(
  form: ReturnType<typeof useFormContext>,
  field: FormField,
  formReadOnly: boolean,
  formReadOnlyStyle: 'value' | 'disabled',
) {
  const hasError = !!form.formState.errors[field.key]

  switch (field.type) {
    case FormFieldType.Text:
      return <TextField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.TextArea:
      return <TextAreaField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.MarkdownEditor:
      return <MarkdownEditor form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Email:
      return <EmailField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Password:
      return <PasswordField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Url:
      return <UrlField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Phone:
      return <PhoneField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Number:
      return <NumberField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Currency:
      return <MoneyField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Select:
      return <SelectField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.EnumSelect:
      return <SelectFieldEnum form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.MultiSelect:
      return <SelectFieldMulti form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Checkbox:
      return (
        <CheckboxField
          form={form}
          field={field}
          hasError={hasError}
          errorMessage={hasError ? (form.formState.errors[field.key]?.message as string) ?? DEFAULT_REQUIRED_ERROR_MESSAGE : undefined}
          formReadOnly={formReadOnly}
          formReadOnlyStyle={formReadOnlyStyle}
        />
      )
    case FormFieldType.Switch:
      return <SwitchField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Button:
      return <ButtonField field={field} form={form} hasError={hasError} />
    case FormFieldType.DatePicker:
      return <DatePickerField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.DateTimePicker:
      return <DateTimePickerField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.TimePicker:
      return <TimePickerField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Radio:
      return <RadioField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.CheckboxGroup:
      return <CheckboxGroupField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.SearchSelect:
      return <SelectFieldSearch form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.SearchSelectApollo:
      return <SelectFieldSearchApollo form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.SearchSelectMulti:
      return <SelectFieldMultiSearch form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.SearchSelectMultiApollo:
      return <SelectFieldMultiSearchApollo form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.Content:
      return <ContentField field={field} />
    case FormFieldType.Custom:
      return <CustomField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    case FormFieldType.CustomCheckbox:
      return <CustomCheckboxField form={form} field={field} hasError={hasError} formReadOnly={formReadOnly} formReadOnlyStyle={formReadOnlyStyle} />
    default:
      return null
  }
}

export function RenderFormField({
  field,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
  style,
  className,
}: Readonly<{
  field: FormField
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
  style?: ViewStyle
  className?: string
}>) {
  const form = useFormContext()
  const { labelDisplay } = useFormConfig()
  const theme = useNativeTheme()

  // Watch all form values for conditional logic.
  // useWatch creates an explicit subscription to the form's control, so it reliably
  // triggers re-renders for any value change — including values set via setValue on
  // unregistered custom fields — in all environments (dev, prod, SSR).
  const formValues = useWatch({ control: form.control })

  // Evaluate conditional logic
  const conditionalState = useMemo(() => {
    const { showWhen, requiredWhen, disabledWhen } = field.options

    try {
      const isVisible = showWhen ? showWhen(formValues) : true
      const isDynamicallyRequired = requiredWhen ? requiredWhen(formValues) : false
      const isDynamicallyDisabled = disabledWhen ? disabledWhen(formValues) : false

      return { isVisible, isDynamicallyRequired, isDynamicallyDisabled }
    } catch (error) {
      console.warn(`Error evaluating conditional logic for field ${field.key}:`, error)
      return { isVisible: true, isDynamicallyRequired: false, isDynamicallyDisabled: false }
    }
  }, [formValues, field.options, field.key])

  const previousRequiredRef = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    const currentRequired = field.options.required || conditionalState.isDynamicallyRequired

    if (previousRequiredRef.current !== currentRequired) {
      previousRequiredRef.current = currentRequired
      try {
        form.register(field.key, {
          required: currentRequired ? DEFAULT_REQUIRED_ERROR_MESSAGE : false
        })
      } catch (error) {
        console.warn(`Error updating field registration for ${field.key}:`, error)
      }
    }
  }, [conditionalState.isDynamicallyRequired, field.options.required, field.key, form])

  if (!conditionalState.isVisible) {
    return null
  }

  const error = form.formState.errors[field.key]
  const errorMessage = (error?.message as string) ?? (error ? DEFAULT_REQUIRED_ERROR_MESSAGE : null)

  // Label logic
  const hasLabelProp = !!field.options.label
  let showLabel: boolean
  if (!hasLabelProp) {
    showLabel = false
  } else if (labelDisplay === 'all') {
    showLabel = true
  } else if (labelDisplay === 'none') {
    showLabel = false
  } else {
    // labelDisplay === 'default' or unset
    showLabel = field.type !== FormFieldType.Checkbox
  }

  const finalRequired = field.options.required || conditionalState.isDynamicallyRequired
  const finalDisabled = field.options.disabled || conditionalState.isDynamicallyDisabled

  const modifiedField: FormField = {
    ...field,
    options: {
      ...field.options,
      disabled: finalDisabled,
      required: finalRequired,
    }
  } as FormField

  const component = renderComponent(form, modifiedField, formReadOnly, formReadOnlyStyle)

  const labelComponent = showLabel && (
    <FormLabel fieldKey={field.key} label={field.options.label ?? ''} required={finalRequired} />
  )

  const layout = field.options.layout || 'vertical'

  const fieldContent = layout === 'horizontal' ? (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {labelComponent}
      <View style={{ flex: 1 }}>
        {component}
        {error && field.type !== FormFieldType.Checkbox && (
          <Text style={theme.global.errorText}>{errorMessage}</Text>
        )}
      </View>
    </View>
  ) : (
    <>
      {labelComponent}
      {component}
      {error && field.type !== FormFieldType.Checkbox && (
        <Text style={theme.global.errorText}>{errorMessage}</Text>
      )}
    </>
  )

  if (field.options.customWrapper) {
    return field.options.customWrapper(fieldContent)
  }

  return (
    <View
      style={[{ gap: 4 }, style]}
      {...(className ? { className } : {})}
    >
      {fieldContent}
    </View>
  )
}
