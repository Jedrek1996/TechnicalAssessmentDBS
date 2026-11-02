import { expect, it } from 'vitest'
import { formatLongDate } from './date'

it('shows the weekday, day and month in Singapore time', () => {
  expect(formatLongDate(new Date('2026-10-20T10:15:00+08:00'))).toMatch(/Tuesday,? 20 October/)
})

it('uses Singapore time even when it is a different day elsewhere', () => {
  // 23:30 UTC on the 19th is already the 20th in Singapore.
  expect(formatLongDate(new Date('2026-10-19T23:30:00Z'))).toMatch(/20 October/)
})
