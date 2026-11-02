# Meridian Banking — Jedrek Koh

- Deployed: _not deployed yet_
- Run locally: `npm install && npm run dev` (http://localhost:5173)

A small banking app for one customer (Ava Chen): a dashboard and a three-step transfer. The brief is in [`brief/candidate-brief.md`](brief/candidate-brief.md). This README is updated as the work progresses.

## Status

| Area | Requirements | Status |
| --- | --- | --- |
| Themes | TH1 light/dark, TH2 Retail/Premium, TH3 accessible | Done |
| Header | D2 (logo, greeting, switch, toggle, avatar) | Done |
| Dashboard | D1 loading, D7 error + Retry | Done |
| Dashboard | D3 total available, D4 accounts | Done |
| Dashboard | D5 recent transactions, D6 search | Done |
| Dashboard | D8 mobile layout, fixed `New transfer` button, daily-limit card | Done (the button does nothing until the transfer dialog is built) |
| Transfer | T1-T8, validation | Not started |
| Engineering | E1 types, E5 `check` + `build` pass | Passing so far |
| Tests | E4: the 3 required behaviour tests | 1 of 3 (dashboard error then Retry) |
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
  api/          typed fetch helper and API types (starter), query keys and options
  components/   grouped by category, one folder per component
    common/       Button, Skeleton, InlineError, EmptyState, SearchInput, SectionHeader, SectionHeading,
                  CollapsibleSection, ExpandToggle, SummaryCard
    dashboard/    Dashboard.tsx (lays out the sections), plus one folder per part of the page
      summary/      Greeting, BalanceHero
      limit/        DailyLimit
      accounts/     AccountList, AccountCard, AccountIcon
      transactions/ TransactionList, TransactionRow
      skeleton/     DashboardSkeleton
    layout/       Header, ContentLayout
    theme/        ThemeToggle, SegmentSwitch
  constants/    theme storage keys and defaults
  hooks/        useTheme, useCustomer, useDashboardData
  lib/          formatMoney / formatShortDate (from the starter)
  pages/        DashboardPage
  store/        themeStore (tiny external store over the <html> attributes)
  styles/
    index.css     global base styles (imports the brief's design tokens)
    components/   one CSS module per component, same categories as components/
    theme/        typed token palette, MUI theme
  utils/        money (total available, remaining limit), transactions (filter, signed amounts), customer initials, storage and type guards
  mocks/, test/ mock API and test setup (from the starter, not edited)
public/
  favicon/      browser tab and iPhone home-screen icons (white M on the Retail blue)
```

Not edited from the starter: `mock-api/` and `src/mocks/`. The only change to `src/test/setup.ts` is adding RTL `cleanup()`, because Vitest has no globals here and renders were leaking between tests.

## Decisions and trade-offs

**Theme lives on `<html>`, not in React state.** `data-theme` and `data-segment` are set on the root element and the design tokens do the rest, so toggling restyles everything with no re-render. A small inline script in `index.html` applies the stored choice before first paint, so a reload never flashes the wrong theme. A stored choice wins; on a first visit the system setting decides the theme and the segment defaults to Retail. The choice is only saved when the user changes it, so a first-time visitor keeps following their system setting.
_Trade-off:_ the script repeats the storage keys because it can't import them. A test runs the real script from `index.html` and fails if the keys or defaults drift from `constants/theme.ts`.

**MUI, used only for basic pieces.** MUI will provide the transfer dialog and form inputs (focus trap, `Esc`, focus return, labelled inputs). Layout, cards, the transaction list and the header are plain CSS using the design tokens, as the brief asks for no ready-made dashboard template.
_Trade-off:_ MUI brings its own colours, which would break "no hard-coded colours". The MUI theme is generated from a typed palette (`styles/theme/tokens.ts`) in which every value is a `var(--token)`. It needs MUI's `cssVariables: { nativeColor: true }` mode; without it MUI throws when it does colour maths on `var(--brand)`. A unit test fails if any MUI palette colour is a hard-coded literal. Four values in components we don't use are listed as known exceptions in that test.

**No global store.** Server data lives in TanStack Query (`api/queries.ts` holds the keys and options). The only client state is the theme, held in the `<html>` attributes.

**One grid, three layouts.** `Dashboard` lays its sections out on a single CSS grid. The daily-limit card sits under the total on phones, beside it on tablets, and in the right column from 1024px, so it is never pushed to the bottom of the page, and the reading order stays logical for screen readers. The loading skeleton uses the same grid and was checked against the real page at 390, 700, 1000 and 1280px.

**Accounts and Recent transactions can be collapsed.** A toggle beside each heading (`aria-expanded`, keyboard operable) swaps the content for a summary card (`3 accounts` with their names, or the transaction count and the latest one), so a collapsed section is never empty. Search stays in the header only while expanded, and its text survives a collapse.

**Three independent queries, fired together.** The dashboard loads customer, accounts and transactions in parallel, with no waterfall. `useDashboardData` folds them into one state for the page. A failed refetch that still has older data keeps showing it; the error screen only appears when there is nothing to show, and `Retry` goes back to the loading skeleton.

**Search filters the 8 loaded transactions in the browser** (description or category, ignoring case and surrounding spaces) instead of calling `?q=`. It is instant and needs no request or loading state. The trade-off is that it can't find older transactions than the 8 shown; the brief allows either approach.

**Animated balance card.** The gradient on the total-available card flows slowly and two soft glows float behind the text, all built from the design tokens (`--hero-from`, `--hero-to`, `--on-hero`) so it follows Retail/Premium and light/dark. It stops for users who ask for reduced motion. To check it never hurts readability I froze the animation at 18 moments, hid the text, and measured the pixels behind each line in all four theme combinations on desktop and mobile (144 frames): the worst case is 5.13:1 against the 4.5:1 AA requirement.

**Money is summed in whole cents.** `0.1 + 0.2` is not `0.3` in floating point. The total available excludes the credit card by account type and is derived on render, never stored.

## Loading, empty and error states

| State | What the user sees | How to see it |
| --- | --- | --- |
| Loading | A skeleton whose blocks match the real ones' position and size (measured in Chrome at 390, 700, 1000 and 1280px), so nothing moves when data arrives | Reload the page (the mock API answers after about 500 ms) |
| Error | `We couldn't load your dashboard.` with a `Retry` button | Covered by a test. A way to trigger it in the deployed app is not built yet (see below) |
| No search matches | `No transactions match your search.` with `Clear search` (restores the list, focus returns to the search box) | Type something that matches nothing, e.g. `zzz` |
| No transactions at all | `No transactions yet.` | Covered by a test; not reachable in the demo data |
| Transfer states | _To come with the transfer work_ | |

## Tests

`npm test` currently runs 125 tests:

- **Contrast (64):** parses the real `design-tokens.css` and checks WCAG AA (4.5:1) for 16 text/background pairs the UI uses (including the Pending chip), in all four theme + segment combinations.
- **Pre-paint script (6):** runs the actual inline script from `index.html`: first visit follows the system, a stored choice wins, bad values are ignored, blocked storage doesn't break it, and keys match the app code.
- **ThemeToggle, SegmentSwitch, Header (7):** behaviour through the accessible UI: clicking updates `<html>`, `aria-pressed`, and storage, and the controls start from what the pre-paint script set.
- **MUI theme (1):** no hard-coded colours in the palette.
- **Money and customer helpers (6):** the total excludes the credit card, sums don't drift, remaining limit.
- **Dashboard (6):** a loading placeholder then the dashboard; the total (credit card excluded) and all three accounts; the 8 newest transactions, newest first; **a failed request shows the error and `Retry` loads the dashboard (required test 3)**; the app greets the customer and shows their initials; the `Dashboard` container lays out every section from the data it is given.
- **BalanceHero, AccountCard and DailyLimit (7):** the total and caption (singular and plural), the `New transfer` button, account details, `Amount due` on the credit card, and the remaining daily limit with its progress bar. Money is asserted with `formatMoney`, normalised for the non-breaking space `Intl` inserts.
- **Transactions (18):** the filter (description, category, case, surrounding spaces, no match across the description/category boundary), signed amounts, the Pending chip, and the list's behaviour: search, result count, the clear button, and the no-matches message whose `Clear search` restores the list and returns focus to the search box.
- **Collapsible sections and account icons (7):** expanding and collapsing (also by keyboard), the summary shown while collapsed (accounts and transactions), search text kept across a collapse, and a different icon per account type.
- **InlineError (1)** and **formatters (2, from the starter).**

Still to come: the other two required tests (an amount over the balance sends no request; a successful transfer updates the dashboard).

## AI use

Tool: Claude Code, for planning, writing code and tests, and checking the result in a real browser.

Places I changed or corrected what it produced:

1. **MUI theme.** The first version pointed MUI colours at CSS variables and crashed in the Button (`Unsupported var(--brand) color`). Switching on MUI's CSS-variables mode fixed the crash, but it still left hard-coded defaults and console warnings. Checking in Chrome and listing the palette found those leaks, which led to the `nativeColor` option and the palette test.
2. **Browser checks found two bugs the tests missed.** The Retail/Premium buttons were 36px tall (the brief needs 44px), and a missing favicon logged a 404 in the console. Both were fixed.
3. **Folder structure.** It first proposed feature folders. I rejected that and asked for the layer-based layout I use on other projects, which is what the code uses now.
4. **Sideways scrolling on small phones.** The page had a hidden minimum width of 370px, because a grid column sized itself to the widest `nowrap` transaction row, and the fixed `New transfer` button went off-screen with it. The AI had only measured at 390px and 1280px. I spotted it in Chrome's device mode; the fix was `grid-template-columns: minmax(0, 1fr)`, and the page is now measured at every width from 280px to 520px.

## Not done / known issues

- Everything marked "Not started" in the status table.
- `New transfer` is in place (in the balance card on desktop, fixed to the bottom on mobile) but opens nothing until the transfer dialog is built.
- There is no debug menu yet to trigger the dashboard error state in the deployed app (optional in the brief).
- `<meta name="theme-color">` in `index.html` is a fixed light colour, so mobile browser chrome doesn't follow dark mode.
- The favicon is the Retail blue and does not follow the Retail/Premium switch.
