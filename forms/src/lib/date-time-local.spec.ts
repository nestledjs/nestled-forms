import { describe, expect, it } from 'vitest'
import { formatLocalDate, formatLocalDateTime, parseLocalDate, parseLocalDateTime } from '@nestledjs/forms-core'

describe('timezone-safe date helpers', () => {
  it('parseLocalDate treats YYYY-MM-DD as local midnight (never UTC)', () => {
    const d = parseLocalDate('2024-03-10')!
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(2)
    expect(d.getDate()).toBe(10)
    expect(d.getHours()).toBe(0)
  })

  it('parseLocalDate keeps the calendar date of a full ISO string', () => {
    const d = parseLocalDate('2024-03-10T23:30:00.000Z')!
    expect(d.getDate()).toBe(10)
  })

  it('formatLocalDate round-trips a picked local date regardless of timezone', () => {
    // 11 PM local on Dec 31 — toISOString would report Jan 1 east of UTC
    const picked = new Date(2024, 11, 31, 23, 0)
    expect(formatLocalDate(picked)).toBe('2024-12-31')
  })

  it('formatLocalDateTime stores local wall-clock time', () => {
    const picked = new Date(2024, 5, 15, 14, 30)
    expect(formatLocalDateTime(picked)).toBe('2024-06-15T14:30')
  })

  it('parseLocalDateTime keeps plain local strings and converts offset strings', () => {
    const local = parseLocalDateTime('2024-06-15T14:30')!
    expect(local.getHours()).toBe(14)

    const instant = parseLocalDateTime('2024-06-15T14:30:00.000Z')!
    // Whatever the zone, round-tripping through local formatting must
    // represent the same instant
    expect(instant.getTime()).toBe(Date.parse('2024-06-15T14:30:00.000Z'))
  })

  it('round-trip: parse then format is stable (no date walking)', () => {
    let value = '2024-03-10'
    for (let i = 0; i < 5; i++) {
      value = formatLocalDate(parseLocalDate(value)!)
    }
    expect(value).toBe('2024-03-10')
  })
})
