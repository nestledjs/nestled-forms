import { View } from 'react-native'
import { FormField, FormFieldType } from '@nestledjs/forms-core'
import { useNativeTheme } from '../native-theme-context'

export function ContentField({
  field,
}: {
  field: Extract<FormField, { type: FormFieldType.Content }>
}) {
  const theme = useNativeTheme().contentField

  return (
    <View style={theme.wrapper}>
      {field.options.content}
    </View>
  )
}
