# Meridian Banking — Jedrek Koh

- Deployed: _not deployed yet_
- Run locally: `npm install && npm run dev` (http://localhost:5173)

A small banking app for one customer (Ava Chen): a dashboard and a three-step transfer. The brief is in [`brief/candidate-brief.md`](brief/candidate-brief.md). This README is updated as the work progresses.

## Status

| Area | Requirements | Status |
| --- | --- | --- |
| Themes | TH1 light/dark, TH2 Retail/Premium, TH3 accessible | Done |
| Header | D2 (logo, nav, switch, toggle, avatar) | Partly: greeting still to come |
| Dashboard | D1, D3-D8 | Not started |
| Transfer | T1-T8, validation | Not started |
| Engineering | E1 types, E5 `check` + `build` pass | Passing so far |
| Tests | E4: the 3 required behaviour tests | Not started (other tests exist, see below) |
| Deployment | E6 | Not started |

## Commands

```bash
npm run dev         # start the app
npm run check       # lint + typecheck + tests
npm run build       # production build into dist/
```

## Project structure

Organised by layer, one folder per kind of file. Tests sit next to the code they test.

```
src/
  api/          typed fetch helper and API types (from the starter)
  components/   grouped by category, one folder per component
    layout/       Header
    theme/        ThemeToggle, SegmentSwitch
  constants/    theme storage keys and defaults
  hooks/        useTheme
  lib/          formatMoney / formatShortDate (from the starter)
  store/        themeStore (tiny external store over the <html> attributes)
  styles/
    index.css     global base styles (imports the brief's design tokens)
    components/   one CSS module per component, same categories as components/
    theme/        typed token palette, MUI theme
  utils/        storage and type-guard helpers
  mocks/, test/ mock API and test setup (from the starter, not edited)
```

Not edited from the starter: `mock-api/` and `src/mocks/`. The only change to `src/test/setup.ts` is adding RTL `cleanup()`, because Vitest has no globals here and renders were leaking between tests.

## Decisions and trade-offs

**Theme lives on `<html>`, not in React state.** `data-theme` and `data-segment` are set on the root element and the design tokens do the rest, so toggling restyles everything with no re-render. A small inline script in `index.html` applies the stored choice before first paint, so a reload never flashes the wrong theme. A stored choice wins; on a first visit the system setting decides the theme and the segment defaults to Retail. The choice is only saved when the user changes it, so a first-time visitor keeps following their system setting.
_Trade-off:_ the script repeats the storage keys because it can't import them. A test runs the real script from `index.html` and fails if the keys or defaults drift from `constants/theme.ts`.

**MUI, used only for basic pieces.** MUI will provide the transfer dialog and form inputs (focus trap, `Esc`, focus return, labelled inputs). Layout, cards, the transaction list and the header are plain CSS using the design tokens, as the brief asks for no ready-made dashboard template.
_Trade-off:_ MUI brings its own colours, which would break "no hard-coded colours". The MUI theme is generated from a typed palette (`styles/theme/tokens.ts`) in which every value is a `var(--token)`. It needs MUI's `cssVariables: { nativeColor: true }` mode; without it MUI throws when it does colour maths on `var(--brand)`. A unit test fails if any MUI palette colour is a hard-coded literal. Four values in components we don't use are listed as known exceptions in that test.

**No global store.** Server data will live in TanStack Query. The only client state is the theme, held in the `<html>` attributes.

## Loading, empty and error states

_To be filled in with the dashboard and transfer work._

## Tests

`npm test` currently runs 77 tests:

- **Contrast (60):** parses the real `design-tokens.css` and checks WCAG AA (4.5:1) for 15 text/background pairs the UI uses, in all four theme + segment combinations.
- **Pre-paint script (6):** runs the actual inline script from `index.html`: first visit follows the system, a stored choice wins, bad values are ignored, blocked storage doesn't break it, and keys match the app code.
- **ThemeToggle, SegmentSwitch, Header (7):** behaviour through the accessible UI: clicking updates `<html>`, `aria-pressed`, and storage, and the controls start from what the pre-paint script set.
- **MUI theme (1):** no hard-coded colours in the palette.
- **Starter (3):** formatters and the mock API connection.

The three tests the brief requires (over-balance sends no request, a transfer updates the dashboard, dashboard error then Retry) come with the dashboard and transfer work.

## AI use

Tool: Claude Code, for planning, writing code and tests, and checking the result in a real browser.

Places I changed or corrected what it produced:

1. **MUI theme.** The first version pointed MUI colours at CSS variables and crashed in the Button (`Unsupported var(--brand) color`). Switching on MUI's CSS-variables mode fixed the crash, but it still left hard-coded defaults and console warnings. Checking in Chrome and listing the palette found those leaks, which led to the `nativeColor` option and the palette test.
2. **Browser checks found two bugs the tests missed.** The Retail/Premium buttons were 36px tall (the brief needs 44px), and a missing favicon logged a 404 in the console. Both were fixed.
3. **Folder structure.** It first proposed feature folders. I rejected that and asked for the layer-based layout I use on other projects, which is what the code uses now.

## Not done / known issues

- Everything marked "Not started" in the status table.
- The avatar initials (`AC`) are hard-coded in `App.tsx` until the dashboard loads the customer.
- `<meta name="theme-color">` in `index.html` is a fixed light colour, so mobile browser chrome doesn't follow dark mode.
