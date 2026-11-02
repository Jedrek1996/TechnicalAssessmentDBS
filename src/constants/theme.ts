import type { Segment } from '../api/types'

export type { Segment }
export type ThemeMode = 'light' | 'dark'

export const THEME_KEY = 'meridian-theme'
export const SEGMENT_KEY = 'meridian-segment'
export const DEFAULT_MODE: ThemeMode = 'light'
export const DEFAULT_SEGMENT: Segment = 'retail'
