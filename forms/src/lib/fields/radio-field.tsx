'use client'

import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import clsx from 'clsx'
import { FormFieldProps, FormField, FormFieldType, RadioOption, RadioFormFieldOptions, useFormTheme } from '@nestledjs/forms-core'

export function RadioField(
  props: Readonly<FormFieldProps<Extract<FormField, { type: FormFieldType.Radio }>> & {
    formReadOnly?: boolean
    formReadOnlyStyle?: 'value' | 'disabled'
  }>,
) {
  const theme = useFormTheme()
  const [subOptionKey, setSubOptionKey] = useState<string>()
  const [subOptionValue, setSubOptionValue] = useState<string>('')
  const options: RadioFormFieldOptions = props.field?.options

  useEffect(() => {
    // Only set default values if field doesn't have a value yet and default is specified
    const currentValue = props.form.getValues(props.field.key)
    if (options?.defaultValue !== undefined && (currentValue === undefined || currentValue === '')) {
      const defaultOption = options?.radioOptions?.find((o: RadioOption) => o.value === options?.defaultValue)
      if (defaultOption?.value) {
        props.form.setValue(props.field.key, defaultOption.value)
      }
      if (options?.defaultSubValue !== undefined && defaultOption?.checkedSubOption) {
        setSubOptionKey(defaultOption?.checkedSubOption?.key)
        setSubOptionValue(options?.defaultSubValue)
        props.form.setValue(defaultOption?.checkedSubOption?.key, options?.defaultSubValue)
      }
    }
  }, [
    options?.defaultValue,
    options?.defaultSubValue,
    props.field.key,
  ])

  const isReadOnly = options.readOnly ?? props.formReadOnly
  const readOnlyStyle = options.readOnlyStyle ?? props.formReadOnlyStyle
  const value = props.form.getValues(props.field.key)
  const selectedOption = options.radioOptions?.find((o) => o.value === value)

  function getInputClassName(option: RadioOption, isChecked: boolean) {
    return clsx(
      theme.radioField.input,
      options?.fullWidthLabel && theme.radioField.inputFullWidth,
      isChecked && theme.radioField.inputChecked,
      (options?.hidden || option?.hidden) && 'opacity-0',
      options.radioDirection === 'row' ? undefined : 'ml-4',
      options?.disabled && theme.radioField.inputDisabled
    )
  }

  function renderDisabledRadioOptions() {
    const containerClass = clsx(
      theme.radioField.container,
      options.radioDirection === 'row' ? theme.radioField.containerRow : theme.radioField.containerColumn
    )

    return (
      <div className={containerClass}>
        {options?.radioOptions?.map((option: RadioOption) => (
          <div key={option.key + '_container'} className={clsx(theme.radioField.radioContainer)}>
            <input
              type="radio"
              id={option.key}
              name={props.field.key}
              checked={option.value === value}
              disabled={true}
              required={options.required}
              className={clsx(
                theme.radioField.input,
                theme.radioField.inputDisabled,
                option.value === value && theme.radioField.inputChecked
              )}
              readOnly
            />
            <label htmlFor={option.key} className={clsx(theme.radioField.label)}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
    )
  }

  function renderReadOnlyValue() {
    if (selectedOption) {
      return (
        <div className={clsx(theme.radioField.readOnlySelected)}>
          {theme.radioField.readOnlyIcon}
          <span className="pl-2">{selectedOption.label}</span>
        </div>
      )
    }

    return (
      <div className={clsx(theme.radioField.readOnlyUnselected)}>
        {theme.radioField.readOnlyUnselectedIcon}
      </div>
    )
  }

  function renderReadOnly() {
    const content = readOnlyStyle === 'disabled'
      ? renderDisabledRadioOptions()
      : renderReadOnlyValue()

    return (
      <>
        <div className="text-xs text-gray-500">{(options as any).helpText}</div>
        {content}
      </>
    )
  }

  function handleRadioChange(option: RadioOption, onChange: (value: any) => void) {
    onChange(option.value)
    if (option?.checkedSubOption?.key) {
      setSubOptionKey(option.checkedSubOption.key)
      setSubOptionValue('')
      if (props.form.setValue) {
        props.form.setValue(option.checkedSubOption.key, '')
      }
    } else if (subOptionKey) {
      setSubOptionKey(undefined)
      setSubOptionValue('')
      if (props.form.setValue) {
        props.form.setValue(subOptionKey, '')
      }
    }
  }

  function renderEditable() {
    return (
      <>
        <div className="text-xs text-gray-500">{(options as any).helpText}</div>
        <Controller
          name={props.field.key}
          control={props.form.control}
          defaultValue={options?.defaultValue}
          render={({ field: { value, onChange } }) => (
            <div className={clsx(
              theme.radioField.container,
              options.radioDirection === 'row' ? theme.radioField.containerRow : theme.radioField.containerColumn
            )}>
              {options?.radioOptions?.map((option: RadioOption) => (
                <div
                  key={option.key + '_container'}
                  className={clsx(
                    theme.radioField.optionContainer,
                    options?.fullWidthLabel && theme.radioField.optionContainerFullWidth,
                    option.checkedSubOption && 'grow',
                    options.radioDirection === 'row' ? 'flex-row items-center' : 'flex-col justify-center'
                  )}
                >
                  <div
                    className={clsx(
                      'flex grow',
                      options.radioDirection === 'row' ? 'flex-row items-center' : 'flex-col justify-center'
                    )}
                  >
                    <div className={clsx(
                      theme.radioField.radioContainer,
                      options.fancyStyle && theme.radioField.optionContainerFancy
                    )}>
                      {options?.fullWidthLabel ? (
                        <label htmlFor={option.key} className={clsx(theme.radioField.labelFullWidth)}>
                          {option.label}
                        </label>
                      ) : null}
                      <input
                        onChange={() => handleRadioChange(option, onChange)}
                        type="radio"
                        className={getInputClassName(option, option?.value === value)}
                        id={option.key}
                        name={props.field.key}
                        value={String(option.value ?? '')}
                        checked={option?.value === value}
                        disabled={options?.disabled}
                        required={options.required}
                      />
                      {!options?.fullWidthLabel ? (
                        <label
                          htmlFor={option.key}
                          className={clsx(
                            theme.radioField.label,
                            options.radioDirection === 'row' ? theme.radioField.labelRow : theme.radioField.labelColumn
                          )}
                        >
                          {option.label}
                        </label>
                      ) : null}
                    </div>
                    {option?.value === value && option?.checkedSubOption ? (
                      <input
                        {...(option?.checkedSubOption?.key ? props.form.register(option.checkedSubOption.key) : {})}
                        name={option?.checkedSubOption?.key ?? ''}
                        placeholder={option?.checkedSubOption?.label ?? ''}
                        disabled={options?.disabled}
                        onChange={(e) => {
                          setSubOptionKey(option?.checkedSubOption?.key ?? '')
                          setSubOptionValue(e?.target?.value)
                          if (props.form.setValue) {
                            props.form.setValue(option?.checkedSubOption?.key ?? '', e?.target?.value)
                          }
                        }}
                        value={subOptionValue}
                        className={clsx(
                          theme.radioField.subOptionInput,
                          props.hasError && theme.radioField.subOptionError
                        )}
                      />
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        />
      </>
    )
  }

  if (isReadOnly) {
    return renderReadOnly()
  }
  return renderEditable()
}
