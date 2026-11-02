import {
  DEFAULT_MODE,
  DEFAULT_SEGMENT,
  SEGMENT_KEY,
  THEME_KEY,
} from '../constants/theme'
import type { Segment, ThemeMode } from '../constants/theme'
import { persist } from '../utils/storage'
import { isSegment, isThemeMode } from '../utils/theme'

/**
 * The source of truth is the `data-theme` / `data-segment` attributes on
 * <html>: the CSS tokens read them directly, so restyling needs no React
 * re-render. This module is the only place that writes them. It also lets React
 * subscribe (via useSyncExternalStore) so controls like `aria-pressed` stay in
 * sync.
 */
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
