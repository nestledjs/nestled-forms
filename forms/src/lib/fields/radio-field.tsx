'use client'

import { useEffect, useState } from 'react'
import { Controller } from 'react-hook-form'
import clsx from 'clsx'
import { FormFieldProps, FormField, FormFieldType, RadioOption, RadioFormFieldOptions, useFormTheme } from '@nestledjs/forms-core'

// Props for the extracted RadioOptionItem component
interface RadioOptionItemProps {
  option: RadioOption
  fieldKey: string
  value: any
  options: RadioFormFieldOptions
  theme: ReturnType<typeof useFormTheme>['radioField']
  onRadioChange: () => void
  getInputClassName: (option: RadioOption, isChecked: boolean) => string
  subOptionValue: string
  onSubOptionChange: (key: string, value: string) => void
  hasError?: boolean
  registerSubOption: (key: string) => object
}

// Extracted component to reduce nesting depth
function RadioOptionItem({
  option,
  fieldKey,
  value,
  options,
  theme,
  onRadioChange,
  getInputClassName,
  subOptionValue,
  onSubOptionChange,
  hasError,
  registerSubOption,
}: Readonly<RadioOptionItemProps>) {
  const isChecked = option?.value === value
  const directionClass = options.radioDirection === 'row' ? 'flex-row items-center' : 'flex-col justify-center'
  const showSubOption = isChecked && option?.checkedSubOption
  const subOptionKey = option?.checkedSubOption?.key ?? ''

  const handleSubOptionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSubOptionChange(subOptionKey, e.target.value)
  }

  return (
    <div
      className={clsx(
        theme.optionContainer,
        options?.fullWidthLabel && theme.optionContainerFullWidth,
        option.checkedSubOption && 'grow',
        directionClass
      )}
    >
      <div className={clsx('flex grow', directionClass)}>
        <div className={clsx(theme.radioContainer, options.fancyStyle && theme.optionContainerFancy)}>
          {options?.fullWidthLabel ? (
            <label htmlFor={option.key} className={clsx(theme.labelFullWidth)}>
              {option.label}
            </label>
          ) : null}
          <input
            onChange={onRadioChange}
            type="radio"
            className={getInputClassName(option, isChecked)}
            id={option.key}
            name={fieldKey}
            value={String(option.value ?? '')}
            checked={isChecked}
            disabled={options?.disabled}
            required={options.required}
          />
          {options?.fullWidthLabel ? null : (
            <label
              htmlFor={option.key}
              className={clsx(
                theme.label,
                options.radioDirection === 'row' ? theme.labelRow : theme.labelColumn
              )}
            >
              {option.label}
            </label>
          )}
        </div>
        {showSubOption ? (
          <input
            {...registerSubOption(subOptionKey)}
            name={subOptionKey}
            placeholder={option?.checkedSubOption?.label ?? ''}
            disabled={options?.disabled}
            onChange={handleSubOptionInputChange}
            value={subOptionValue}
            className={clsx(theme.subOptionInput, hasError && theme.subOptionError)}
          />
        ) : null}
      </div>
    </div>
  )
}

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

  function handleSubOptionChange(key: string, newValue: string) {
    setSubOptionKey(key)
    setSubOptionValue(newValue)
    if (props.form.setValue) {
      props.form.setValue(key, newValue)
    }
  }

  function registerSubOption(key: string): object {
    return key ? props.form.register(key) : {}
  }

  function renderEditable() {
    return (
      <>
        <div className="text-xs text-gray-500">{(options as any).helpText}</div>
        <Controller
          name={props.field.key}
          control={props.form.control}
          defaultValue={options?.defaultValue}
          render={({ field: { value: controllerValue, onChange } }) => (
            <div className={clsx(
              theme.radioField.container,
              options.radioDirection === 'row' ? theme.radioField.containerRow : theme.radioField.containerColumn
            )}>
              {options?.radioOptions?.map((option: RadioOption) => (
                <RadioOptionItem
                  key={option.key + '_container'}
                  option={option}
                  fieldKey={props.field.key}
                  value={controllerValue}
                  options={options}
                  theme={theme.radioField}
                  onRadioChange={() => handleRadioChange(option, onChange)}
                  getInputClassName={getInputClassName}
                  subOptionValue={subOptionValue}
                  onSubOptionChange={handleSubOptionChange}
                  hasError={props.hasError}
                  registerSubOption={registerSubOption}
                />
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
