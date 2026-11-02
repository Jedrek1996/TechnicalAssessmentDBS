// Every design token as a typed `var(--token)` string, never hex, so anything
// built from it follows data-theme / data-segment. Plain CSS can use var(--…) directly.
const v = <T extends string>(name: T) => `var(--${name})` as const

export const palette = {
  surface: {
    page: v('bg'),
    card: v('surface'),
    raised: v('surface-raised'),
    muted: v('surface-muted'),
  },
  border: {
    default: v('border'),
    strong: v('border-strong'),
  },
  text: {
    default: v('text'),
    muted: v('text-muted'),
    subtle: v('text-subtle'),
  },
  brand: {
    default: v('brand'),
    hover: v('brand-hover'),
    active: v('brand-active'),
    soft: v('brand-soft'),
    on: v('on-brand'),
    focusRing: v('focus-ring'),
  },
  hero: {
    from: v('hero-from'),
    to: v('hero-to'),
    on: v('on-hero'),
  },
  status: {
    positive: v('positive'),
    positiveSoft: v('positive-soft'),
    negative: v('negative'),
    negativeSoft: v('negative-soft'),
    warning: v('warning'),
    warningSoft: v('warning-soft'),
  },
  effect: {
    overlay: v('overlay'),
    skeleton: v('skeleton'),
    skeletonHighlight: v('skeleton-highlight'),
    shadowSm: v('shadow-sm'),
    shadowMd: v('shadow-md'),
    shadowLg: v('shadow-lg'),
  },
} as const

export const scale = {
  font: { sans: v('font-sans'), mono: v('font-mono') },
  radius: {
    sm: v('radius-sm'),
    md: v('radius-md'),
    lg: v('radius-lg'),
    xl: v('radius-xl'),
    full: v('radius-full'),
  },
  zIndex: {
    header: v('z-header'),
    overlay: v('z-overlay'),
    dialog: v('z-dialog'),
    toast: v('z-toast'),
  },
  tapTarget: v('tap-target'),
} as const
