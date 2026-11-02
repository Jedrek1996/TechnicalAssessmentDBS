import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import indexHtml from '../../index.html?raw'
import {
  DEFAULT_MODE,
  DEFAULT_SEGMENT,
  SEGMENT_KEY,
  THEME_KEY,
} from '../constants/theme'

// The pre-paint script is plain JS inside index.html. Run the real thing.
const script = /<script>([\s\S]*?)<\/script>/.exec(indexHtml)?.[1]

function runInitScript({
  stored = {},
  systemDark = false,
  storageThrows = false,
}: {
  stored?: Record<string, string>
  systemDark?: boolean
  storageThrows?: boolean
} = {}) {
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => {
      if (storageThrows) throw new Error('blocked')
      return stored[key] ?? null
    },
  })
  vi.stubGlobal('matchMedia', () => ({ matches: systemDark }))
  new Function(script ?? '')()

  const { theme, segment } = document.documentElement.dataset
  return { theme, segment }
}

describe('pre-paint theme script (index.html)', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme
    delete document.documentElement.dataset.segment
  })
  afterEach(() => vi.unstubAllGlobals())

  it('is found in index.html', () => {
    expect(script).toBeTruthy()
  })

  it('uses the same keys and defaults as storage.ts', () => {
    expect(script).toContain(`'${THEME_KEY}'`)
    expect(script).toContain(`'${SEGMENT_KEY}'`)
    expect(script).toContain(`'${DEFAULT_SEGMENT}'`)
    expect(script).toContain(`'${DEFAULT_MODE}'`)
  })

  it('first visit follows the system setting', () => {
    expect(runInitScript({ systemDark: true })).toEqual({
      theme: 'dark',
      segment: 'retail',
    })
    expect(runInitScript({ systemDark: false }).theme).toBe('light')
  })

  it('a stored choice wins over the system setting', () => {
    const stored = { [THEME_KEY]: 'light', [SEGMENT_KEY]: 'premium' }
    expect(runInitScript({ stored, systemDark: true })).toEqual({
      theme: 'light',
      segment: 'premium',
    })
  })

  it('ignores stored values it does not recognise', () => {
    const stored = { [THEME_KEY]: 'purple', [SEGMENT_KEY]: 'gold' }
    expect(runInitScript({ stored, systemDark: true })).toEqual({
      theme: 'dark',
      segment: 'retail',
    })
  })

  it('still works when storage is blocked', () => {
    expect(runInitScript({ storageThrows: true, systemDark: true })).toEqual({
      theme: 'dark',
      segment: 'retail',
    })
  })
})
