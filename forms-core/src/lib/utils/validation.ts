import { ZodTypeAny, ZodError } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldValues, RegisterOptions, Resolver } from 'react-hook-form'
import { BaseFieldOptions, InputFieldOptions } from '../form-types'

// Helper function to create Zod validator
function createZodValidator(schema: ZodTypeAny, errorMessages?: Record<string, string | undefined>) {
  return async (value: any) => {
    try {
      await schema.parseAsync(value)
      return true
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0]
        const errorKey = firstError.code
        return errorMessages?.[errorKey] ?? firstError.message
      }
      return 'Invalid value'
    }
  }
}

// Helper function to combine validators
function combineValidators(existing: any, newValidator: any) {
  return async (value: any, formValues: any) => {
    const existingResult = await existing(value, formValues)
    if (existingResult !== true) return existingResult
    return newValidator(value, formValues)
  }
}

// Helper function to run Zod schema validation
async function runSchemaValidation(
  schema: ZodTypeAny,
  value: any,
  errorMessages?: Record<string, string | undefined>
): Promise<{ type: string; message: string } | null> {
  try {
    await schema.parseAsync(value)
    return null
  } catch (error) {
    if (error instanceof ZodError) {
      const firstError = error.errors[0]
      return {
        type: firstError.code,
        message: errorMessages?.[firstError.code] || firstError.message
      }
    }
    return null
  }
}

// Helper function to validate a single field
async function validateField(
  field: { key: string; options: InputFieldOptions },
  value: any,
  values: any
): Promise<{ type: string; message: string } | null> {
  const { options: fieldOptions } = field

  // Skip validation if conditions not met
  if (fieldOptions.validateWhen && !fieldOptions.validateWhen(values)) {
    return null
  }

  // Check required validation
  const isRequired = fieldOptions.required || fieldOptions.requiredWhen?.(values)
  if (isRequired && !value) {
    return {
      type: 'required',
      message: fieldOptions.errorMessages?.required || 'This field is required'
    }
  }

  // Run Zod schema validation
  if (fieldOptions.schema) {
    const schemaError = await runSchemaValidation(fieldOptions.schema, value, fieldOptions.errorMessages)
    if (schemaError) return schemaError
  }

  // Run custom validate function
  if (fieldOptions.validate) {
    const result = await fieldOptions.validate(value)
    if (result !== true) {
      return {
        type: 'validate',
        message: result as string
      }
    }
  }

  // Run validateWithForm function
  if (fieldOptions.validateWithForm) {
    const result = await fieldOptions.validateWithForm(value, values)
    if (result !== true) {
      return {
        type: 'validateWithForm',
        message: result as string
      }
    }
  }

  return null
}

// Helper to add a validator to existing rules
function addValidatorToRules(
  rules: RegisterOptions,
  validator: any,
  key: string
): void {
  if (!rules.validate) {
    rules.validate = validator
    return
  }

  if (typeof rules.validate === 'object') {
    rules.validate[key] = validator
    return
  }

  // rules.validate is a function, combine with new validator
  rules.validate = combineValidators(rules.validate, validator)
}

// Helper to run validators from an object
async function runObjectValidators(
  validators: Record<string, any>,
  value: any,
  formValues: any
): Promise<true | string> {
  for (const [, validator] of Object.entries(validators)) {
    if (typeof validator === 'function') {
      const result = await validator(value, formValues)
      if (result !== true) return result
    }
  }
  return true
}

// Helper to create conditional validation wrapper
function createConditionalWrapper(
  originalValidate: any,
  field: InputFieldOptions,
  currentValidationGroup?: string
): (value: any, formValues: any) => Promise<true | string> {
  return async (value: any, formValues: any) => {
    // Skip validation if conditions not met
    const shouldSkipConditional = field.validateWhen && !field.validateWhen(formValues)
    if (shouldSkipConditional) {
      return true
    }

    // Skip validation if not in current group
    const isInDifferentGroup = currentValidationGroup &&
      field.validationGroup &&
      field.validationGroup !== currentValidationGroup
    if (isInDifferentGroup) {
      return true
    }

    // Run the original validation
    if (typeof originalValidate === 'function') {
      return originalValidate(value, formValues)
    }

    if (typeof originalValidate === 'object') {
      return runObjectValidators(originalValidate, value, formValues)
    }

    return true
  }
}

/**
 * Creates validation rules for a field that combine Zod schema validation
 * with traditional validation functions.
 *
 * @param field - The field configuration containing validation options
 * @param isRequired - Whether the field is currently required (considering dynamic conditions)
 * @returns RegisterOptions for react-hook-form register function
 */
export function createFieldValidation(
  field: InputFieldOptions,
  isRequired: boolean,
  currentValidationGroup?: string
): RegisterOptions {
  const rules: RegisterOptions = {}

  // Add required validation
  if (isRequired) {
    rules.required = field.errorMessages?.required || 'This field is required'
  }

  // Add Zod schema validation if present
  if (field.schema) {
    const zodValidate = createZodValidator(field.schema, field.errorMessages)
    addValidatorToRules(rules, zodValidate, 'schema')
  }

  // Add custom validation function if present
  if (field.validate) {
    const validator = field.validate
    addValidatorToRules(rules, (value: any) => validator(value), 'custom')
  }

  // Add cross-field validation if present
  if (field.validateWithForm) {
    addValidatorToRules(rules, field.validateWithForm, 'crossField')
  }

  // Wrap validation with conditional and group checks
  const needsConditionalWrapper = rules.validate && (field.validateWhen || field.validationGroup)
  if (needsConditionalWrapper) {
    rules.validate = createConditionalWrapper(rules.validate, field, currentValidationGroup)
  }

  return rules
}

/**
 * Creates a form-level resolver that can handle both Zod schemas and field-level validation.
 * This allows for mixed validation strategies within the same form.
 *
 * @param schema - Optional Zod schema for form-level validation
 * @param fields - Array of form fields with their validation configurations
 * @returns A resolver function for react-hook-form
 */
export function createFormResolver<TFieldValues extends FieldValues = FieldValues>(
  schema?: ZodTypeAny,
  fields?: Array<{ key: string; options: InputFieldOptions }>,
  currentValidationGroup?: string
): Resolver<TFieldValues> | undefined {
  // If we have a form-level Zod schema, use the zodResolver
  if (schema) {
    return zodResolver(schema) as Resolver<TFieldValues>
  }

  // Check if we need a custom resolver for field-level validation
  // Note: Button fields should already be filtered out before calling this function
  const fieldsNeedingValidation = fields?.filter(f =>
    f.options.schema || f.options.validateWithForm || f.options.validate
  )
  if (!fieldsNeedingValidation?.length) {
    return undefined
  }

  // Create a custom resolver that handles all field-level validation
  return async (values, context, options) => {
    const errors: Record<string, any> = {}

    for (const field of fieldsNeedingValidation) {
      const value = values[field.key as keyof TFieldValues]
      const error = await validateField(field, value, values)

      if (error) {
        errors[field.key] = error
      }
    }

    return {
      values: Object.keys(errors).length ? {} : values,
      errors
    }
  }
}

/**
 * Creates a validation function that only validates fields in a specific group.
 * Useful for multi-step forms where you want to validate only the current step.
 *
 * @param form - The react-hook-form instance
 * @param validationGroup - The group to validate
 * @param fields - Array of form fields
 * @returns Promise that resolves to true if valid, or validation errors
 */
export async function validateGroup<T extends FieldValues>(
  form: { getValues: () => T; trigger: (names?: string[]) => Promise<boolean> },
  validationGroup: string,
  fields: Array<{ key: string; options: BaseFieldOptions & { validationGroup?: string } }>
): Promise<boolean> {
  // Get field names that belong to this validation group
  const groupFields = fields
    .filter(field => field.options.validationGroup === validationGroup)
    .map(field => field.key)

  if (groupFields.length === 0) return true

  // Trigger validation only for fields in this group
  return await form.trigger(groupFields)
}

/**
 * Gets all validation groups present in the form fields.
 *
 * @param fields - Array of form fields
 * @returns Array of unique validation group names
 */
export function getValidationGroups(
  fields: Array<{ key: string; options: BaseFieldOptions & { validationGroup?: string } }>
): string[] {
  const groups = new Set<string>()

  fields.forEach(field => {
    if (field.options.validationGroup) {
      groups.add(field.options.validationGroup)
    }
  })

  return Array.from(groups).sort((a, b) => a.localeCompare(b))
}

/**
 * Gets all fields that belong to a specific validation group.
 *
 * @param fields - Array of form fields
 * @param validationGroup - The group to filter by
 * @returns Array of fields in the specified group
 */
export function getFieldsInGroup(
  fields: Array<{ key: string; options: BaseFieldOptions & { validationGroup?: string } }>,
  validationGroup: string
): Array<{ key: string; options: BaseFieldOptions & { validationGroup?: string } }> {
  return fields.filter(field => field.options.validationGroup === validationGroup)
}

/**
 * Checks if a field should be validated based on current form values and validation conditions.
 *
 * @param field - The field to check
 * @param formValues - Current form values
 * @param currentValidationGroup - Current validation group (if any)
 * @returns true if field should be validated, false otherwise
 */
export function shouldValidateField(
  field: { options: BaseFieldOptions & {
    validateWhen?: (formValues: any) => boolean
    validationGroup?: string
  }},
  formValues: any,
  currentValidationGroup?: string
): boolean {
  // Check conditional validation
  if (field.options.validateWhen && !field.options.validateWhen(formValues)) {
    return false
  }

  // Check validation group
  if (currentValidationGroup && field.options.validationGroup &&
      field.options.validationGroup !== currentValidationGroup) {
    return false
  }

  return true
}

/**
 * Utility to extract TypeScript types from Zod schemas for better type inference
 */
export type InferSchemaType<T> = T extends ZodTypeAny ? T['_output'] : never