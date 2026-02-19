'use client'

import clsx from 'clsx'
import { useFormTheme } from '@nestledjs/forms-core'

interface FormLabelProps {
  htmlFor: string
  label: string
  required?: boolean
}

export function FormLabel({ htmlFor, label, required }: FormLabelProps) {
  const theme = useFormTheme()

  return (
    <label id={`${htmlFor}-label`} htmlFor={htmlFor} className={clsx(theme.label.base)}>
      {label}
      {required && (
        <span className={clsx(theme.label.requiredIndicator)}>{' *'}</span>
      )}
    </label>
  )
}