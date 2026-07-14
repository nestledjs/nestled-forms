import dayjs from 'dayjs'

export function getDateFromDateTime(yourDate: string) {
  if (!yourDate) return null
  return yourDate.split('T')[0]
}

export function formatDateFromDateTime(yourDate: string, shortDate?: boolean) {
  if (!yourDate) return null
  return dayjs(getDateFromDateTime(yourDate)).format(shortDate ? 'MM/DD/YYYY' : 'MMMM DD, YYYY')
}

export function getDateTimeFromValue(yourDateTime: string) {
  if (!yourDateTime) return null
  // Ensure the datetime string is in the correct format for datetime-local input
  return yourDateTime.slice(0, 16) // YYYY-MM-DDTHH:MM
}

export function formatDateTimeFromValue(yourDateTime: string, shortFormat?: boolean) {
  if (!yourDateTime) return null
  return dayjs(yourDateTime).format(shortFormat ? 'MM/DD/YYYY h:mm A' : 'MMMM DD, YYYY h:mm A')
}

/**
 * Parses a date value ('YYYY-MM-DD', or any string with a leading date part)
 * as LOCAL midnight. `new Date('YYYY-MM-DD')` parses as UTC midnight, which
 * displays as the previous day west of UTC — never use it for calendar dates.
 */
export function parseLocalDate(value: string): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('T')[0].split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/**
 * Parses a datetime value in local terms: 'YYYY-MM-DDTHH:mm' is already local
 * per the Date spec; values carrying an offset ('Z', '+02:00') are converted
 * to the local timezone.
 */
export function parseLocalDateTime(value: string): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/** Formats a Date as 'YYYY-MM-DD' using LOCAL components (never toISOString). */
export function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Formats a Date as 'YYYY-MM-DDTHH:mm' using LOCAL components (never toISOString). */
export function formatLocalDateTime(date: Date): string {
  return `${formatLocalDate(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}
