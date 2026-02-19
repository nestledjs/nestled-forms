import React, { useEffect, useMemo } from 'react'
import { View, ViewStyle } from 'react-native'
import { useForm, UseFormProps, FieldValues } from 'react-hook-form'
import {
  FormField,
  FormFieldType,
  InputFieldOptions,
  FormContext,
  ThemeContext,
  FormConfigContext,
  FormThemeSchema,
  createFormResolver,
} from '@nestledjs/forms-core'
import type { FormTheme, FormConfig } from '@nestledjs/forms-core'
import { ZodTypeAny } from 'zod'
import { NativeThemeContext } from './native-theme-context'
import { NativeTheme } from './themes/default'
import { createFinalNativeTheme } from './utils/resolve-theme'
import { RenderFormField } from './render-form-field'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export interface NativeFormProps<T extends FieldValues = Record<string, unknown>> extends UseFormProps<T> {
  id: string
  fields?: (FormField | null)[]
  children?: React.ReactNode
  submit: (values: T) => void | Promise<unknown>
  style?: ViewStyle
  className?: string
  readOnly?: boolean
  readOnlyStyle?: 'value' | 'disabled'
  nativeTheme?: DeepPartial<NativeTheme>
  labelDisplay?: 'all' | 'default' | 'none'
  schema?: ZodTypeAny
  validationGroup?: string
  validationGroups?: string[]
}

/**
 * React Native Form component. Wraps fields in a View (no <form> element in RN).
 * Provides FormContext, ThemeContext, FormConfigContext, and NativeThemeContext.
 * Submission is handled via form.handleSubmit() — consumers typically wire a
 * ButtonField with type="submit" that calls form.handleSubmit().
 */
export function NativeForm<T extends FieldValues = Record<string, unknown>>({
  id,
  fields,
  children,
  submit,
  defaultValues,
  style,
  className,
  readOnly = false,
  readOnlyStyle: formReadOnlyStyle = 'value',
  nativeTheme: userNativeTheme = {},
  labelDisplay = 'default',
  schema,
  validationGroup,
  validationGroups,
}: Readonly<NativeFormProps<T>>) {
  const resolver = useMemo(() => {
    const needsResolver = schema || fields?.some(f => {
      if (f?.type === FormFieldType.Button) return false
      const opts = f?.options as InputFieldOptions
      return opts?.schema || opts?.validateWithForm || opts?.validate
    })

    if (needsResolver) {
      return createFormResolver<T>(
        schema,
        fields?.filter((f): f is FormField => f !== null)
          .filter(f => f.type !== FormFieldType.Button)
          .map(f => ({
            key: f.key,
            options: f.options as InputFieldOptions
          })),
        validationGroup
      )
    }
    return undefined
  }, [schema, fields, validationGroup, validationGroups])

  const form = useForm<T>({
    defaultValues,
    resolver,
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })

  useEffect(() => {
    if (defaultValues && typeof defaultValues !== 'function') {
      form.reset(defaultValues)
    }
  }, [defaultValues, form])

  // For forms-core ThemeContext, provide the default parsed theme (CSS-based, unused in native)
  const coreTheme = useMemo(() => FormThemeSchema.parse({}), [])
  const finalNativeTheme = useMemo(() => createFinalNativeTheme(userNativeTheme), [userNativeTheme])
  const formConfig = useMemo<FormConfig>(() => ({ labelDisplay }), [labelDisplay])

  const handleSubmitWithTransform = useMemo(() => {
    return (values: T) => {
      const filteredValues: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(values as Record<string, unknown>)) {
        const isButtonField = fields?.some(f =>
          f && f.key === key && f.type === FormFieldType.Button
        )
        if (!isButtonField) {
          filteredValues[key] = value
        }
      }

      if (!fields) {
        return submit(filteredValues as T)
      }

      const transformedValues: Record<string, unknown> = { ...filteredValues }
      fields
        .filter((field): field is FormField => field !== null)
        .filter(field => field.type !== FormFieldType.Button)
        .forEach((field) => {
          if (field.options.submitTransform && field.key in transformedValues) {
            transformedValues[field.key] = field.options.submitTransform(transformedValues[field.key])
          }
        })

      return submit(transformedValues as T)
    }
  }, [fields, submit])

  return (
    <FormConfigContext.Provider value={formConfig}>
      <ThemeContext.Provider value={coreTheme}>
        <NativeThemeContext.Provider value={finalNativeTheme}>
          <FormContext.Provider value={form as any}>
            <View
              nativeID={id}
              style={[{ gap: 16 }, style]}
              {...(className ? { className } : {})}
            >
              {fields
                ?.filter((field): field is FormField => field !== null)
                .map((field) => (
                  <RenderFormField
                    key={field.key}
                    field={field}
                    formReadOnly={readOnly}
                    formReadOnlyStyle={formReadOnlyStyle}
                  />
                ))}
              {children}
            </View>
          </FormContext.Provider>
        </NativeThemeContext.Provider>
      </ThemeContext.Provider>
    </FormConfigContext.Provider>
  )
}
