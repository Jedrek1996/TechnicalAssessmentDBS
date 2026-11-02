import { createTheme } from '@mui/material/styles'
import { palette as p, scale } from './tokens'

// MUI's CSS-variables mode reads these two, but its types don't list them.
declare module '@mui/material/styles' {
  interface CommonColors {
    background: string
    onBackground: string
  }
}

/**
 * `cssVariables: { nativeColor: true }` is required: without it MUI does colour
 * maths (`alpha`) on `var(--brand)` and throws. Every palette slot is set, even
 * unused ones, so MUI's hard-coded defaults can't leak in.
 */
const ramp = (c: { main: string; light: string; dark: string; on: string }) => ({
  main: c.main,
  light: c.light,
  dark: c.dark,
  contrastText: c.on,
})

const brand = ramp({
  main: p.brand.default,
  light: p.brand.hover,
  dark: p.brand.active,
  on: p.brand.on,
})
const error = ramp({
  main: p.status.negative,
  light: p.status.negative,
  dark: p.status.negative,
  on: p.brand.on,
})
const warning = ramp({
  main: p.status.warning,
  light: p.status.warning,
  dark: p.status.warning,
  on: p.brand.on,
})
const success = ramp({
  main: p.status.positive,
  light: p.status.positive,
  dark: p.status.positive,
  on: p.brand.on,
})

export const muiTheme = createTheme({
  cssVariables: { nativeColor: true },
  palette: {
    primary: brand,
    secondary: brand,
    info: brand,
    error,
    warning,
    success,
    text: {
      primary: p.text.default,
      secondary: p.text.muted,
      disabled: p.text.subtle,
    },
    background: { default: p.surface.page, paper: p.surface.raised },
    divider: p.border.default,
    common: {
      black: p.text.default,
      white: p.surface.card,
      background: p.surface.raised,
      onBackground: p.text.default,
    },
    action: {
      active: p.text.muted,
      hover: p.surface.muted,
      selected: p.brand.soft,
      disabled: p.text.subtle,
      disabledBackground: p.surface.muted,
      focus: p.brand.soft,
    },
    grey: {
      50: p.surface.muted,
      100: p.surface.muted,
      200: p.border.default,
      300: p.border.default,
      400: p.border.strong,
      500: p.text.subtle,
      600: p.text.muted,
      700: p.text.muted,
      800: p.text.default,
      900: p.text.default,
      A100: p.surface.muted,
      A200: p.border.default,
      A400: p.border.strong,
      A700: p.text.muted,
    },
  },
  typography: {
    fontFamily: scale.font.sans,
    button: { textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiBackdrop: { styleOverrides: { root: { backgroundColor: p.effect.overlay } } },
  },
})
