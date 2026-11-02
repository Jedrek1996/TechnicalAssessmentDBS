import { useSyncExternalStore } from 'react'
import {
  getMode,
  getSegment,
  setMode,
  setSegment,
  subscribe,
} from '../store/themeStore'

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, getMode)
  const segment = useSyncExternalStore(subscribe, getSegment)

  return {
    mode,
    segment,
    toggleMode: () => setMode(getMode() === 'dark' ? 'light' : 'dark'),
    setSegment,
  }
}
