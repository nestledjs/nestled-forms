/**
 * Shared ARIA wiring for field inputs: flags the control invalid and points
 * aria-describedby at the help text and the error message rendered by
 * RenderFormField (`${key}-help` / `${key}-error`).
 */
export function fieldA11yProps(fieldKey: string, hasError?: boolean, helpText?: unknown) {
  const ids: string[] = []
  if (helpText) ids.push(`${fieldKey}-help`)
  if (hasError) ids.push(`${fieldKey}-error`)
  return {
    'aria-invalid': hasError || undefined,
    'aria-describedby': ids.length ? ids.join(' ') : undefined,
  }
}
