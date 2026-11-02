import type { Segment, ThemeMode } from '../constants/theme'

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

export function isSegment(value: unknown): value is Segment {
  return value === 'retail' || value === 'premium'
}
