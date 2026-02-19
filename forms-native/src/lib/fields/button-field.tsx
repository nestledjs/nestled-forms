import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { Button } from './button'

export function ButtonField({
  field,
  form,
  hasError,
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Button }>>>) {
  const handlePress = async () => {
    if (field.options.disabled) return

    if (field.options.type === 'submit') {
      // In React Native, form submission is manual
      form.handleSubmit((values) => {
        // The Form component's submit handler will be called via context
      })()
    }

    if (field.options.onClick) {
      await field.options.onClick()
    }
  }

  return (
    <Button
      variant={field.options.variant}
      loading={field.options.loading}
      disabled={field.options.disabled}
      fullWidth={field.options.fullWidth}
      onPress={handlePress}
      accessibilityLabel={field.options.text ?? field.options.label ?? 'Button'}
    >
      {field.options.text ?? field.options.label ?? 'Button'}
    </Button>
  )
}
