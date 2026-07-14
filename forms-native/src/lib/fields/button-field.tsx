import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { Button } from './button'
import { useNativeFormSubmit } from '../native-form-submit-context'

export function ButtonField({
  field,
  form,
  hasError,
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Button }>>>) {
  const submitForm = useNativeFormSubmit()

  const handlePress = async () => {
    if (field.options.disabled) return

    if (field.options.type === 'submit') {
      if (submitForm) {
        await submitForm()
      } else {
        // Rendered outside a NativeForm — validate so errors surface, but there
        // is no submit handler to deliver values to
        console.warn(
          'ButtonField (type="submit") was rendered outside a <NativeForm>; ' +
            'no submit handler is available.',
        )
        await form.handleSubmit(() => undefined)()
      }
    }

    if (field.options.onClick) {
      await field.options.onClick()
    }
  }

  return (
    <Button
      variant={field.options.variant}
      loading={field.options.loading || form.formState.isSubmitting}
      disabled={field.options.disabled || (field.options.type === 'submit' && form.formState.isSubmitting)}
      fullWidth={field.options.fullWidth}
      onPress={handlePress}
      accessibilityLabel={field.options.text ?? field.options.label ?? 'Button'}
    >
      {field.options.text ?? field.options.label ?? 'Button'}
    </Button>
  )
}
