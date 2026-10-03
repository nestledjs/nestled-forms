'use client'

import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { Button, ButtonProps } from './button'

export function ButtonField({
  field,
  form,
  hasError,
}: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Button }>>>) {

  const handleClick = field?.options?.onClick || (field?.options?.type === 'submit' && field?.options?.disabled) ?
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent form submission if button is disabled
      if (field?.options?.disabled) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      
      // Call custom onClick if provided
      if (field.options.onClick) {
        await field?.options?.onClick?.()
      }
    } : undefined

  // Submit buttons disable (and show the loading state) while the form is submitting
  const isSubmit = (field.options.type ?? 'button') === 'submit'
  const isSubmitting = isSubmit && form.formState.isSubmitting

  const buttonProps: ButtonProps = {
    variant: field.options.variant,
    loading: field.options.loading || isSubmitting,
    disabled: field.options.disabled || isSubmitting,
    type: field.options.type ?? 'button',
    fullWidth: field.options.fullWidth,
    className: field.options.className,
  }

  // Only add onClick if a custom handler exists
  if (handleClick) {
    buttonProps.onClick = handleClick
  }

  return (
    <Button {...buttonProps}>
      {field.options.text ?? field.options.label ?? 'Button'}
    </Button>
  )
}
