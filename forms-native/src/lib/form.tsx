import React, { useEffect, useMemo, useRef } from 'react'
import { View, ViewStyle } from 'react-native'
import { useForm, UseFormProps, FieldValues } from 'react-hook-form'
import {
  FormField,
  FormContext,
  ThemeContext,
  FormConfigContext,
  FormThemeSchema,
  buildFieldsResolver,
  createSubmitHandler,
  resolveFormStrings,
  deepEqual,
  type FormStrings,
  type FormConfig,
} from '@nestledjs/forms-core'
import { NativeFormSubmitContext } from './native-form-submit-context'
import { ZodTypeAny } from 'zod'
import { NativeThemeContext } from './native-theme-context'
import { NativeTheme } from './themes/default'
import { createFinalNativeTheme } from './utils/resolve-theme'
import { RenderFormField } from './render-form-field'

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Module-level defaults keep identity stable across renders: an inline `{}`
// default parameter would recompute the theme and re-render every
// NativeThemeContext consumer on each NativeForm render
const EMPTY_NATIVE_THEME = {}
const DEFAULT_FINAL_NATIVE_THEME = createFinalNativeTheme(EMPTY_NATIVE_THEME)

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
  /** Override any user-facing strings (localization). Merged over English defaults. */
  strings?: Partial<FormStrings>
  schema?: ZodTypeAny
  validationGroup?: string
  validationGroups?: string[]
}

/**
 * React Native Form component. Wraps fields in a View (no <form> element in RN).
 * Provides FormContext, ThemeContext, FormConfigContext, NativeThemeContext, and
 * NativeFormSubmitContext. A ButtonField with type="submit" (or any component
 * calling useNativeFormSubmit()) triggers validation, applies each field's
 * submitTransform, and invokes the `submit` prop.
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
  nativeTheme: userNativeTheme = EMPTY_NATIVE_THEME,
  labelDisplay = 'default',
  strings,
  schema,
  validationGroup,
  validationGroups,
}: Readonly<NativeFormProps<T>>) {
  const formStrings = useMemo(() => resolveFormStrings(strings), [strings])
  const resolver = useMemo(
    () => buildFieldsResolver<T>({ schema, fields, validationGroup, defaultRequiredMessage: formStrings.requiredError }),
    [schema, fields, validationGroup, validationGroups, formStrings.requiredError],
  )

  const form = useForm<T>({
    defaultValues,
    resolver,
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })

  const prevDefaultValuesRef = useRef(defaultValues)
  useEffect(() => {
    if (defaultValues && typeof defaultValues !== 'function') {
      // Only reset on a structural change — identity-only changes from inline
      // defaultValues objects must not wipe what the user has typed
      if (!deepEqual(defaultValues, prevDefaultValuesRef.current)) {
        prevDefaultValuesRef.current = defaultValues
        form.reset(defaultValues)
      }
    }
  }, [defaultValues, form])

  // Shared pipeline: strips button keys and applies submit transforms
  // (explicit per-field transforms win, otherwise the per-type default)
  const handleSubmitWithTransform = useMemo(() => createSubmitHandler<T>(fields, submit), [fields, submit])

  const submitForm = useMemo(
    () => form.handleSubmit(handleSubmitWithTransform as Parameters<typeof form.handleSubmit>[0]),
    [form, handleSubmitWithTransform],
  )

  // For forms-core ThemeContext, provide the default parsed theme (CSS-based, unused in native)
  const coreTheme = useMemo(() => FormThemeSchema.parse({}), [])
  const finalNativeTheme = useMemo(
    () => (userNativeTheme === EMPTY_NATIVE_THEME ? DEFAULT_FINAL_NATIVE_THEME : createFinalNativeTheme(userNativeTheme)),
    [userNativeTheme],
  )
  const formConfig = useMemo<FormConfig>(
    () => ({ labelDisplay, strings: formStrings }),
    [labelDisplay, formStrings],
  )

  return (
    <FormConfigContext.Provider value={formConfig}>
      <ThemeContext.Provider value={coreTheme}>
        <NativeThemeContext.Provider value={finalNativeTheme}>
          <FormContext.Provider value={form as any}>
            <NativeFormSubmitContext.Provider value={submitForm}>
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
            </NativeFormSubmitContext.Provider>
          </FormContext.Provider>
        </NativeThemeContext.Provider>
      </ThemeContext.Provider>
    </FormConfigContext.Provider>
  )
}
