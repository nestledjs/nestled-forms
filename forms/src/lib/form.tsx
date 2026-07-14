'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { useForm, UseFormProps, FieldValues } from 'react-hook-form'
import {
  FormField,
  FormFieldType,
  InputFieldOptions,
  FormContext,
  ThemeContext,
  FormConfigContext,
  createFormResolver,
  resolveSubmitTransform,
} from '@nestledjs/forms-core'
import type { FormTheme, FormConfig, FormStrings } from '@nestledjs/forms-core'
import { resolveFormStrings } from '@nestledjs/forms-core'
import clsx from 'clsx'
import { RenderFormField } from './render-form-field'
import { createFinalTheme } from './utils/resolve-theme'
import { ZodTypeAny } from 'zod'

export interface FormProps<T extends FieldValues = Record<string, unknown>> extends UseFormProps<T> {
  id: string
  fields?: (FormField | null)[]
  children?: React.ReactNode
  submit: (values: T) => void | Promise<unknown>
  className?: string
  /**
   * If true, the entire form is in read-only mode.
   */
  readOnly?: boolean
  /**
   * Determines how the fields should appear when in read-only mode.
   * 'value': Renders the data as plain text. (Default)
   * 'disabled': Renders the UI component in a disabled state.
   */
  readOnlyStyle?: 'value' | 'disabled'
  theme?: Partial<FormTheme>
  /**
   * Controls the visibility of field labels globally across the form.
   * - 'default': Shows labels for all fields except Checkbox (default behavior).
   * - 'all': Shows labels for all fields, including Checkbox.
   * - 'none': Hides all labels.
   */
  labelDisplay?: 'all' | 'default' | 'none'

  /**
   * Override any of the library's user-facing strings (loading, "No results
   * found", the default required error, aria-labels, ...) for localization.
   * Merged over the English defaults.
   */
  strings?: Partial<FormStrings>

  /**
   * Optional Zod schema for form-level validation.
   * When provided, this schema will validate the entire form's data structure.
   * Can be used alongside field-level schemas for comprehensive validation.
   *
   * @example
   * ```tsx
   * import { z } from 'zod'
   *
   * const schema = z.object({
   *   username: z.string().min(3),
   *   email: z.string().email(),
   *   age: z.number().min(18)
   * })
   *
   * <Form
   *   id="user-form"
   *   schema={schema}
   *   fields={[...]}
   *   submit={handleSubmit}
   * />
   * ```
   */
  schema?: ZodTypeAny

  /**
   * Current validation group to validate.
   * When specified, only fields belonging to this group will be validated.
   * Useful for multi-step forms where you want to validate only the current step.
   *
   * @example
   * ```tsx
   * // Validate only step 1 fields
   * <Form
   *   id="multi-step-form"
   *   validationGroup="step-1"
   *   fields={[...]}
   *   submit={handleSubmit}
   * />
   * ```
   */
  validationGroup?: string

  /**
   * All possible validation groups in this form.
   * Used for validation group management and step-by-step validation.
   *
   * @example
   * ```tsx
   * <Form
   *   id="multi-step-form"
   *   validationGroups={['personal-info', 'contact-info', 'preferences']}
   *   validationGroup={currentStep}
   *   fields={[...]}
   *   submit={handleSubmit}
   * />
   * ```
   */
  validationGroups?: string[]
}

// Module-level defaults keep identity stable across renders: an inline `{}`
// default parameter would recompute the theme and re-render every
// ThemeContext consumer on each Form render
const EMPTY_THEME = {}
const DEFAULT_FINAL_THEME = createFinalTheme(EMPTY_THEME)

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, i) => deepEqual(item, (b as unknown[])[i]))
  }
  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)
  if (aKeys.length !== bKeys.length) return false
  return aKeys.every(key => deepEqual(aObj[key], bObj[key]))
}

/**
 * Main form component that provides both declarative and imperative form usage patterns.
 * 
 * Supports declarative usage via the `fields` prop and imperative usage via children.
 * Provides form context for field components and handles form submission.
 * 
 * @template T - The type of the form values object
 * @param id - Unique identifier for the form element
 * @param fields - Array of field definitions for declarative usage (optional)
 * @param children - React children for imperative usage (optional)
 * @param submit - Function called when form is submitted with validated values
 * @param defaultValues - Initial values for form fields
 * @param className - CSS classes to apply to the form element
 * @param readOnly - Whether the entire form should be in read-only mode
 * @param readOnlyStyle - How read-only fields should be displayed ('value' | 'disabled')
 * @param theme - Partial theme object to customize form appearance
 * @param labelDisplay - Global label visibility setting ('all' | 'default' | 'none')
 * @returns A form element with context providers for field components
 * 
 * @example
 * ```tsx
 * // Declarative usage
 * <Form
 *   id="user-form"
 *   fields={[
 *     FormFieldClass.text('username', { label: 'Username', required: true }),
 *     FormFieldClass.email('email', { label: 'Email', required: true }),
 *   ]}
 *   submit={(values) => console.log(values)}
 * />
 * 
 * // Imperative usage
 * <Form id="custom-form" submit={(values) => handleSubmit(values)}>
 *   <RenderFormField field={FormFieldClass.text('name', { label: 'Name' })} />
 *   <button type="submit">Submit</button>
 * </Form>
 * 
 * // Mixed usage
 * <Form
 *   id="mixed-form"
 *   fields={[FormFieldClass.text('username', { label: 'Username' })]}
 *   submit={(values) => handleSubmit(values)}
 * >
 *   <RenderFormField field={FormFieldClass.password('password', { label: 'Password' })} />
 *   <button type="submit">Submit</button>
 * </Form>
 * ```
 */
export function Form<T extends FieldValues = Record<string, unknown>>({
  id,
  fields,
  children,
  submit,
  defaultValues,
  className,
  readOnly = false,
  readOnlyStyle = 'value',
  theme: userTheme = EMPTY_THEME,
  labelDisplay = 'default',
  strings,
  schema,
  validationGroup,
  validationGroups,
}: Readonly<FormProps<T>>) {
  const formStrings = useMemo(() => resolveFormStrings(strings), [strings])
  // Create resolver for validation if needed
  const resolver = useMemo(() => {
    // Check if any field needs validation that requires a resolver (excluding buttons).
    // required/requiredWhen must go through the resolver too: react-hook-form
    // ignores register rules once any resolver exists.
    const needsResolver = schema || fields?.some(f => {
      if (f?.type === FormFieldType.Button) return false // Never validate buttons
      const opts = f?.options as InputFieldOptions
      return opts?.schema || opts?.validateWithForm || opts?.validate || opts?.required || opts?.requiredWhen
    })

    if (needsResolver) {
      return createFormResolver<T>(
        schema,
        fields?.filter((f): f is FormField => f !== null)
          .filter(f => f.type !== FormFieldType.Button) // Never validate button fields
          .map(f => ({
            key: f.key,
            options: f.options as InputFieldOptions
          })),
        validationGroup,
        formStrings.requiredError
      )
    }
    return undefined
  }, [schema, fields, validationGroup, validationGroups, formStrings.requiredError])

  const form = useForm<T>({
    defaultValues,
    resolver,
    mode: 'onBlur', // Try onBlur to see if validation triggers
    reValidateMode: 'onChange' // Re-validate on every change
  })

  const prevDefaultValuesRef = useRef(defaultValues)
  useEffect(() => {
    if (defaultValues && typeof defaultValues !== 'function') {
      if (!deepEqual(defaultValues, prevDefaultValuesRef.current)) {
        prevDefaultValuesRef.current = defaultValues
        form.reset(defaultValues)
      }
    }
  }, [defaultValues, form])

  const finalTheme = useMemo(
    () => (userTheme === EMPTY_THEME ? DEFAULT_FINAL_THEME : createFinalTheme(userTheme)),
    [userTheme],
  )
  // Create the value for our new context
  const formConfig = useMemo<FormConfig>(
    () => ({ labelDisplay, strings: formStrings }),
    [labelDisplay, formStrings],
  )

  // Create a wrapper function that applies field transformations before submission
  const handleSubmitWithTransform = useMemo(() => {
    return (values: T) => {
      // First, filter out button fields from the values
      const filteredValues: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
        // Check if this key belongs to a button field
        const isButtonField = fields?.some(f =>
          f?.key === key && f.type === FormFieldType.Button
        )
        if (!isButtonField) {
          filteredValues[key] = value
        }
      }

      if (!fields) {
        // No fields to transform, call submit directly with filtered values
        return submit(filteredValues as T)
      }

      // Apply submitTransform functions: explicit per-field transforms win,
      // otherwise the per-type default (e.g. option objects -> ID strings)
      const transformedValues: Record<string, unknown> = { ...filteredValues }

      fields
        .filter((field): field is FormField => field !== null)
        .filter(field => field.type !== FormFieldType.Button) // Skip button fields
        .forEach((field) => {
          const transform = resolveSubmitTransform(field)
          if (transform && field.key in transformedValues) {
            transformedValues[field.key] = transform(transformedValues[field.key])
          }
        })

      return submit(transformedValues as T)
    }
  }, [fields, submit])

  return (
    <FormConfigContext.Provider value={formConfig}>
      <ThemeContext.Provider value={finalTheme}>
        <FormContext.Provider value={form as unknown as import('react-hook-form').UseFormReturn<import('react-hook-form').FieldValues>}>
          <form id={id} noValidate className={clsx('space-y-6', className)} onSubmit={form.handleSubmit(handleSubmitWithTransform)}>
            {/* Render fields from the declarative array */}
            {fields
              ?.filter((field): field is FormField => field !== null)
              .map((field) => (
                <RenderFormField
                  key={field.key}
                  field={field}
                  formReadOnly={readOnly}
                  formReadOnlyStyle={readOnlyStyle}
                />
              ))}

            {/* Render any manually placed fields */}
            {children}

            {/* The default submit button has been removed. Users must add their own <Button type="submit">. */}
          </form>
        </FormContext.Provider>
      </ThemeContext.Provider>
    </FormConfigContext.Provider>
  )
}
