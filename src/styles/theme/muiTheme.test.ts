import { describe, expect, it } from 'vitest'
import { muiTheme } from './muiTheme'

// A colour literal (hex, rgb(), hsl()) anywhere in the palette means a MUI
// default leaked in and will ignore data-theme / data-segment. Values derived
// from our variables (MUI's `color-mix(…, var(--mui-palette-…))` tints for
// components we don't use) are fine.
// Components we don't use whose MUI defaults we couldn't override. If you start
// using one, give it token colours and remove it from this list.
const UNUSED = /^palette\.(FilledInput|SnackbarContent)\./

const LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(\s*\d/i

function literals(value: unknown, path: string): string[] {
  if (typeof value === 'string') {
    const leaked =
      LITERAL.test(value) && !value.includes('var(--') && !UNUSED.test(path)
    return leaked ? [`${path} = ${value}`] : []
  }
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => literals(v, `${path}.${k}`))
  }
  return []
}

describe('muiTheme', () => {
  it('has no hard-coded colours in its palette', () => {
    expect(literals(muiTheme.palette, 'palette')).toEqual([])
  })
})
