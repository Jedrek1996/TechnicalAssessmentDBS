import {
  DEFAULT_MODE,
  DEFAULT_SEGMENT,
  SEGMENT_KEY,
  THEME_KEY,
} from '../constants/theme'
import type { Segment, ThemeMode } from '../constants/theme'
import { persist } from '../utils/storage'
import { isSegment, isThemeMode } from '../utils/theme'

// The data-theme / data-segment attributes on <html> are the source of truth (the
// CSS tokens read them directly). Only this module writes them; React subscribes
// through useSyncExternalStore so `aria-pressed` stays in sync.
const listeners = new Set<() => void>()
const root = () => document.documentElement

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emit(): void {
  listeners.forEach((listener) => listener())
}

export function getMode(): ThemeMode {
  const value = root().dataset.theme
  return isThemeMode(value) ? value : DEFAULT_MODE
}

export function getSegment(): Segment {
  const value = root().dataset.segment
  return isSegment(value) ? value : DEFAULT_SEGMENT
}

export function setMode(mode: ThemeMode): void {
  root().dataset.theme = mode
  persist(THEME_KEY, mode)
  emit()
}

export function setSegment(segment: Segment): void {
  root().dataset.segment = segment
  persist(SEGMENT_KEY, segment)
  emit()
}
