import { useState } from 'react'
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native'
import { Controller } from 'react-hook-form'
import { FormField, FormFieldProps, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

let MarkdownDisplay: any = null
try {
  MarkdownDisplay = require('react-native-markdown-display').default
} catch {
  // react-native-markdown-display not installed
}

/**
 * Simple markdown toolbar actions that insert syntax at the cursor position.
 */
const toolbarActions = [
  { label: 'B', syntax: '**', wrap: true, title: 'Bold' },
  { label: 'I', syntax: '*', wrap: true, title: 'Italic' },
  { label: 'H', syntax: '# ', wrap: false, title: 'Heading' },
  { label: '—', syntax: '\n---\n', wrap: false, title: 'Horizontal rule' },
  { label: '•', syntax: '- ', wrap: false, title: 'List item' },
  { label: '🔗', syntax: '[text](url)', wrap: false, title: 'Link' },
]

export function MarkdownEditor({
  form,
  field,
  hasError,
  formReadOnly = false,
  formReadOnlyStyle = 'value',
}: FormFieldProps<Extract<FormField, { type: FormFieldType.MarkdownEditor }>> & {
  formReadOnly?: boolean
  formReadOnlyStyle?: 'value' | 'disabled'
}) {
  const theme = useNativeTheme().markdownEditor
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const isReadOnly = field.options.readOnly ?? formReadOnly
  const readOnlyStyle = field.options.readOnlyStyle ?? formReadOnlyStyle

  if (isReadOnly) {
    const value = form.getValues(field.key) ?? ''

    if (readOnlyStyle === 'disabled') {
      return (
        <>
          <View style={[theme.editor, theme.disabled]}>
            <View style={theme.toolbar}>
              <Text style={{ fontSize: 13, color: '#9ca3af' }}>Markdown Editor (Disabled)</Text>
            </View>
            <View style={[theme.preview, { opacity: 0.5, minHeight: 200 }]}>
              <Text style={{ fontFamily: 'monospace', fontSize: 14 }}>{value || '—'}</Text>
            </View>
          </View>
          {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
        </>
      )
    }

    // Read-only value: render markdown
    return (
      <>
        <View style={theme.readOnlyValue}>
          {MarkdownDisplay ? (
            <MarkdownDisplay>{value || '—'}</MarkdownDisplay>
          ) : (
            <Text style={{ fontSize: 16, color: '#374151' }}>{value || '—'}</Text>
          )}
        </View>
        {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
      </>
    )
  }

  return (
    <Controller
      control={form.control}
      name={field.key}
      defaultValue={field.options.defaultValue ?? ''}
      rules={{
        required: field.options.required,
        maxLength: field.options.maxLength
          ? { value: field.options.maxLength, message: `Content must be less than ${field.options.maxLength} characters` }
          : undefined,
      }}
      render={({ field: { onChange, value } }) => (
        <View style={theme.wrapper}>
          <View style={[theme.editor, hasError && theme.error, field.options.disabled && theme.disabled]}>
            {/* Edit / Preview toggle */}
            <View style={theme.toggleContainer}>
              <Pressable
                onPress={() => setMode('edit')}
                style={[theme.toggleButton, mode === 'edit' && theme.toggleButtonActive]}
              >
                <Text style={[theme.toggleButtonText, mode === 'edit' && theme.toggleButtonTextActive]}>
                  Edit
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('preview')}
                style={[theme.toggleButton, mode === 'preview' && theme.toggleButtonActive]}
              >
                <Text style={[theme.toggleButtonText, mode === 'preview' && theme.toggleButtonTextActive]}>
                  Preview
                </Text>
              </Pressable>
            </View>

            {/* Toolbar (edit mode only) */}
            {mode === 'edit' && (
              <View style={theme.toolbar}>
                {toolbarActions.map((action) => (
                  <Pressable
                    key={action.label}
                    onPress={() => {
                      if (action.wrap) {
                        onChange(`${value || ''}${action.syntax}text${action.syntax}`)
                      } else {
                        onChange(`${value || ''}${action.syntax}`)
                      }
                    }}
                    style={theme.toolbarButton}
                    accessibilityLabel={action.title}
                  >
                    <Text style={theme.toolbarButtonText}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Content area */}
            {mode === 'edit' ? (
              <TextInput
                multiline
                value={value ?? ''}
                onChangeText={(text) => {
                  if (field.options.maxLength && text.length > field.options.maxLength) return
                  onChange(text)
                }}
                placeholder={field.options.placeholder}
                placeholderTextColor="#9ca3af"
                editable={!field.options.disabled}
                style={[theme.textInput, { minHeight: field.options.height ?? 200 }]}
                accessibilityLabel={field.options.label}
              />
            ) : (
              <ScrollView style={[theme.preview, { minHeight: field.options.height ?? 200 }]}>
                {MarkdownDisplay ? (
                  <MarkdownDisplay>{value || ''}</MarkdownDisplay>
                ) : (
                  <Text style={{ fontSize: 16, color: '#374151' }}>{value || 'Nothing to preview'}</Text>
                )}
              </ScrollView>
            )}

            {/* Character count */}
            {field.options.maxLength && (
              <Text style={{ fontSize: 13, color: '#6b7280', textAlign: 'right', padding: 8 }}>
                {(value ?? '').length}/{field.options.maxLength}
              </Text>
            )}
          </View>
          {field.options.helpText && <Text style={theme.helpText}>{field.options.helpText}</Text>}
        </View>
      )}
    />
  )
}
