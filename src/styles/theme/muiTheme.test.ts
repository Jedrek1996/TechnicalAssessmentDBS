import { describe, expect, it } from 'vitest'
import { muiTheme } from './muiTheme'

// A hex/rgb()/hsl() literal in the palette is a MUI default that ignores the
// theme. Values derived from our variables (`color-mix(…, var(--…))`) are fine.
// Unused components whose defaults we couldn't override. Using one means giving
// it token colours and removing it from this list.
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
