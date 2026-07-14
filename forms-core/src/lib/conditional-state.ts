import { FormField } from './form-types'

export interface ConditionalState {
  isVisible: boolean
  isDynamicallyRequired: boolean
  isDynamicallyDisabled: boolean
}

export const STATIC_CONDITIONAL_STATE: ConditionalState = {
  isVisible: true,
  isDynamicallyRequired: false,
  isDynamicallyDisabled: false,
}

/** True when the field declares any conditional logic worth a form-value subscription. */
export function hasConditionalLogic(field: FormField): boolean {
  const { showWhen, requiredWhen, disabledWhen } = field.options
  return !!(showWhen || requiredWhen || disabledWhen)
}

/**
 * Evaluates a field's showWhen/requiredWhen/disabledWhen against current form
 * values. Errors thrown by consumer callbacks default the field to visible so
 * a bad condition never hides data-entry.
 */
export function evaluateConditionalState(field: FormField, formValues: unknown): ConditionalState {
  const { showWhen, requiredWhen, disabledWhen } = field.options

  try {
    return {
      isVisible: showWhen ? showWhen(formValues) : true,
      isDynamicallyRequired: requiredWhen ? requiredWhen(formValues) : false,
      isDynamicallyDisabled: disabledWhen ? disabledWhen(formValues) : false,
    }
  } catch (error) {
    console.warn(`Error evaluating conditional logic for field ${field.key}:`, error)
    return STATIC_CONDITIONAL_STATE
  }
}
