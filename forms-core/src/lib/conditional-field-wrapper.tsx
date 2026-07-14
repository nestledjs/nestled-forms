'use client'

import { ReactElement, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { FormField } from './form-types'
import { useFormContext } from './form-context'
import { ConditionalState, evaluateConditionalState } from './conditional-state'

/**
 * FieldConditionalWrapper: subscribes to all form values (useWatch) and hands
 * the evaluated ConditionalState to a render prop. Children component stays
 * platform-specific; the subscription + evaluation live here once.
 *
 * useWatch creates an explicit subscription to the form's control, so it reliably
 * triggers re-renders for any value change — including values set via setValue on
 * unregistered custom fields — in all environments (dev, prod, SSR).
 */
export function FieldConditionalWrapper({
  field,
  children,
}: Readonly<{
  field: FormField
  children: (state: ConditionalState) => ReactElement | null
}>) {
  const form = useFormContext()
  const formValues = useWatch({ control: form.control })

  const conditionalState = useMemo<ConditionalState>(
    () => evaluateConditionalState(field, formValues),
    [formValues, field],
  )

  return children(conditionalState)
}
