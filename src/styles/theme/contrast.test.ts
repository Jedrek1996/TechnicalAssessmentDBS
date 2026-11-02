import { describe, expect, it } from 'vitest'
import tokensCss from '../../../brief/design-tokens.css?raw'

/**
 * TH3: text contrast meets WCAG AA in all four theme + segment combinations.
 * Reads the real design-tokens.css, applies its cascade
 * (base < segment < dark < dark+segment) and checks the pairs the UI uses.
 */
type Tokens = Record<string, string>

function parseBlocks(css: string): Map<string, Tokens> {
  const blocks = new Map<string, Tokens>()
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [, selector, body] of clean.matchAll(/(:root[^{]*)\{([^}]*)\}/g)) {
    const tokens: Tokens = {}
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      tokens[name] = value.trim()
    }
    blocks.set(selector.trim(), tokens)
  }
  return blocks
}

const blocks = parseBlocks(tokensCss)
const get = (selector: string) => blocks.get(selector) ?? {}

function resolve(theme: 'light' | 'dark', segment: 'retail' | 'premium') {
  return {
    ...get(':root'),
    ...(segment === 'premium' ? get(':root[data-segment="premium"]') : {}),
    ...(theme === 'dark' ? get(':root[data-theme="dark"]') : {}),
    ...(theme === 'dark' && segment === 'premium'
      ? get(':root[data-theme="dark"][data-segment="premium"]')
      : {}),
  }
}

function luminance(hex: string): number {
  const channels = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex)
  if (!channels) throw new Error(`Expected a 6-digit hex colour, got "${hex}"`)
  const [r, g, b] = channels.slice(1).map((part) => {
    const c = parseInt(part, 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [foreground token, background token, where the UI uses it]
const PAIRS: [string, string, string][] = [
  ['--text', '--bg', 'body text on page'],
  ['--text', '--surface', 'text on cards'],
  ['--text', '--surface-raised', 'text in the dialog'],
  ['--text-muted', '--surface', 'secondary text on cards'],
  ['--text-muted', '--surface-muted', 'segment switch (inactive)'],
  ['--text-subtle', '--surface', 'tertiary text on cards'],
  ['--on-brand', '--brand', 'primary button, active segment'],
  ['--brand', '--surface', 'text buttons, links'],
  ['--brand', '--surface-raised', 'text buttons in the dialog'],
  ['--brand', '--brand-soft', 'active nav item, avatar'],
  ['--on-hero', '--hero-from', 'balance hero (gradient start)'],
  ['--on-hero', '--hero-to', 'balance hero (gradient end)'],
  ['--positive', '--surface', 'money in'],
  ['--negative', '--surface', 'errors'],
  ['--negative', '--surface-raised', 'errors in the dialog'],
]

const AA_NORMAL_TEXT = 4.5

describe.each([
  ['light', 'retail'],
  ['light', 'premium'],
  ['dark', 'retail'],
  ['dark', 'premium'],
] as const)('contrast: %s + %s', (theme, segment) => {
  const tokens = resolve(theme, segment)

  it.each(PAIRS)('%s on %s (%s)', (fg, bg) => {
    expect(tokens[fg], `${fg} is defined`).toBeDefined()
    expect(tokens[bg], `${bg} is defined`).toBeDefined()
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    )
  })
})
