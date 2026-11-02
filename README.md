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
| Dashboard | D8 mobile layout, fixed `New transfer` button, daily-limit card | Done |
| Transfer | T1-T8 (dialog, 3 steps, send, refresh, failure, accessibility) and the validation rules | Done |
| Engineering | E1 types, E2 server data, E3 forms, E5 `check` + `build` pass | Done |
| Tests | E4: the 3 required behaviour tests | Done (3 of 3) |
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
  api/          typed fetch helper and API types (starter), query keys and options, the transfer mutation
  components/   grouped by category, one folder per component
    common/       Button, Skeleton, InlineError, EmptyState, SearchInput, SectionHeader, SectionHeading,
                  CollapsibleSection, ExpandToggle, SummaryCard
    dashboard/    Dashboard.tsx (lays out the sections), plus one folder per part of the page
      summary/      Greeting, BalanceHero
      limit/        DailyLimit
      accounts/     AccountList, AccountCard, AccountIcon
      transactions/ TransactionList, TransactionRow, TransactionIcon
      skeleton/     DashboardSkeleton
    layout/       Header, ContentLayout
    theme/        ThemeToggle, SegmentSwitch
    transfer/     TransferDialog + TransferFlow, then one folder per step
      stepper/      Stepper
      recipient/    RecipientStep, RecipientOption, NewRecipientFields
      amount/       AmountStep
      review/       ReviewStep, ReviewSummary
      success/      SuccessPanel
  constants/    theme storage keys and defaults, transfer constants (banks, quick amounts, copy)
  hooks/        useTheme, useCustomer, useDashboardData, useTransferField
  lib/          formatMoney / formatShortDate (from the starter)
  pages/        DashboardPage
  providers/    AppProviders (TanStack Query + the MUI theme)
  store/        themeStore (tiny external store over the <html> attributes)
  styles/
    index.css     global base styles (imports the brief's design tokens)
    components/   one CSS module per component, same categories as components/
    theme/        typed token palette, MUI theme
  utils/        money (total available, remaining limit), transactions (filter, signed amounts), transferSchema (every validation rule), dates, customer initials, storage and type guards
  mocks/, test/ mock API and test setup (from the starter, not edited)
public/
  favicon/      browser tab and iPhone home-screen icons (white M on the Retail blue)
```

Not edited from the starter: `mock-api/` and `src/mocks/`. The only change to `src/test/setup.ts` is adding RTL `cleanup()`, because Vitest has no globals here and renders were leaking between tests.

## Decisions and trade-offs

**Theme lives on `<html>`, not in React state.** `data-theme` and `data-segment` are set on the root element and the design tokens do the rest, so toggling restyles everything with no re-render. A small inline script in `index.html` applies the stored choice before first paint, so a reload never flashes the wrong theme. A stored choice wins; on a first visit the system setting decides the theme and the segment defaults to Retail. The choice is only saved when the user changes it, so a first-time visitor keeps following their system setting.
_Trade-off:_ the script repeats the storage keys because it can't import them. A test runs the real script from `index.html` and fails if the keys or defaults drift from `constants/theme.ts`.

**MUI, used only for basic pieces.** MUI provides the transfer dialog and the text fields (focus trap, `Esc`, labelled inputs with linked error text). Layout, cards, the transaction list and the header are plain CSS using the design tokens, as the brief asks for no ready-made dashboard template.
_Trade-off:_ MUI brings its own colours, which would break "no hard-coded colours". The MUI theme is generated from a typed palette (`styles/theme/tokens.ts`) in which every value is a `var(--token)`. It needs MUI's `cssVariables: { nativeColor: true }` mode; without it MUI throws when it does colour maths on `var(--brand)`. A unit test fails if any MUI palette colour is a hard-coded literal. Four values in components we don't use are listed as known exceptions in that test.

**One form for the whole transfer, and each rule written once.** The dialog holds a single React Hook Form instance, so `Back` keeps everything entered. Every validation rule lives in `utils/transferSchema.ts` and feeds both the inline errors and sending. Each step validates only its own fields; the amount rule is built from the real balance of the chosen account and the real remaining limit, so the messages show the actual figures. If both limits are exceeded, the balance message wins. Fields are checked when you leave them, again on `Continue` (focus jumps to the first invalid field), and re-check as you fix an error.

**`Continue` looks disabled until the step is valid, but stays focusable.** The recipient step needs a payee (or all three details of someone new, valid) and the amount step needs a valid amount, account and note. The button is dimmed, has `aria-disabled="true"` and a not-allowed cursor, but it is not a real `disabled` button: the brief says to check the fields and focus the first invalid one when `Continue` is pressed, which a truly disabled button can't do, and a disabled button can't be focused or announced, so keyboard and screen-reader users would never learn what is missing. Pressing it early shows the errors and moves focus to the first problem field. Validity is checked silently on every change (`useWatch` plus the same step schema), so it never shows errors the user hasn't earned yet.

**Saved payees and "Send to someone new" are one radio group.** Native radios, so arrow keys, Tab and screen readers work without custom code; choosing "someone new" reveals the three fields. The chosen option always has a checkmark (so selection doesn't rely on colour alone), and whoever is chosen stays in view even if a later search no longer matches them: pinned at the top under a `Selected` label, with `Search results` beneath, so it is clear why they are there and the selection never disappears while `Continue` is enabled. The selects (bank, from-account) are native `<select>`s: simple, accessible and the best experience on a phone.

**After a transfer, refetch rather than patch the cache.** Customer, accounts and every transactions query are invalidated, so the dashboard always matches the server. It isn't awaited, so the success screen shows immediately while the dashboard refreshes behind it. _Trade-off:_ about half a second of old numbers behind the dialog, instead of hand-patching the transaction list.

**Sending can't happen twice.** The button is disabled and reads `Sending…` while the request runs, and the handler also refuses a second call, because a disabled button alone doesn't stop a fast double click and the money would really move twice. A failure stays on the review step with an alert and everything intact; the API's field messages are put under their fields (visible after `Back`).

**Focus goes back to the button that opened the dialog explicitly.** MUI would restore it, but Safari doesn't focus a button when it is clicked, so there would be nothing to restore. The dialog ignores backdrop clicks so a stray click can't throw away what was typed.

**The dialog is loaded only when needed.** It is its own chunk (246 kB, 77 kB gzipped) fetched in the background once the dashboard is up. Without it the main file was 624 kB; now it is 377 kB. It mounts on first use and then stays mounted, so closing still plays the exit animation.

**No global store.** Server data lives in TanStack Query (`api/queries.ts` holds the keys and options). The only client state is the theme, held in the `<html>` attributes.

**One grid, three layouts.** `Dashboard` lays its sections out on a single CSS grid. The daily-limit card sits under the total on phones, beside it on tablets, and in the right column from 1024px, so it is never pushed to the bottom of the page, and the reading order stays logical for screen readers. The loading skeleton uses the same grid and was checked against the real page at 390, 700, 1000 and 1280px.

**Accounts and Recent transactions can be collapsed.** A toggle beside each heading (`aria-expanded`, keyboard operable) swaps the content for a summary card (`3 accounts` with their names, or the transaction count and the latest one), so a collapsed section is never empty. Search stays in the header only while expanded, and its text survives a collapse.

**Three independent queries, fired together.** The dashboard loads customer, accounts and transactions in parallel, with no waterfall. `useDashboardData` folds them into one state for the page. A failed refetch that still has older data keeps showing it; the error screen only appears when there is nothing to show, and `Retry` goes back to the loading skeleton.

**Search filters the 8 loaded transactions in the browser** (description or category, ignoring case and surrounding spaces) instead of calling `?q=`. It is instant and needs no request or loading state. The trade-off is that it can't find older transactions than the 8 shown; the brief allows either approach.

**Animated balance card.** The gradient on the total-available card flows slowly and two soft glows float behind the text, all built from the design tokens (`--hero-from`, `--hero-to`, `--on-hero`) so it follows Retail/Premium and light/dark. It stops for users who ask for reduced motion. To check it never hurts readability I froze the animation at 18 moments, hid the text, and measured the pixels behind each line in all four theme combinations on desktop and mobile (144 frames): the worst case is 5.13:1 against the 4.5:1 AA requirement.

**Visual polish, using only the brief's tokens.** The brief doesn't ask for it, so every addition follows the same rules as the rest: no new colours (shades are `color-mix` of the existing tokens, so they follow Retail/Premium and light/dark), nothing that shifts the layout, and nothing that fights reduced motion. Category icons on transactions (green for money in), account icons tinted by meaning (blue checking, green savings, red credit card), a date line under the greeting, a gradient progress bar with `% used` on the daily limit, a soft brand-colour wash behind the page, a header that stays in view with a frosted blur (from 640px; on a phone it is two rows, too tall to pin), sections that fade in one after another (opacity only, because a transform would make that wrapper the containing block of the fixed `New transfer` button), and hover and press feedback. Long transaction descriptions wrap to two lines inside the fixed-height row instead of being cut off. The text over the new page background was measured pixel by pixel in all four theme combinations (worst case 5.73:1 against 4.5:1).

**Money is summed in whole cents.** `0.1 + 0.2` is not `0.3` in floating point. The total available excludes the credit card by account type and is derived on render, never stored.

## Loading, empty and error states

| State | What the user sees | How to see it |
| --- | --- | --- |
| Loading | A skeleton whose blocks match the real ones' position and size (measured in Chrome at 390, 700, 1000 and 1280px), so nothing moves when data arrives | Reload the page (the mock API answers after about 500 ms) |
| Error | `We couldn't load your dashboard.` with a `Retry` button | Covered by a test. A way to trigger it in the deployed app is not built yet (see below) |
| No search matches | `No transactions match your search.` with `Clear search` (restores the list, focus returns to the search box) | Type something that matches nothing, e.g. `zzz` |
| No transactions at all | `No transactions yet.` | Covered by a test; not reachable in the demo data |
| Payees loading | Three placeholder rows | Open `New transfer` (about 500 ms) |
| Payees failed | `We couldn't load your payees.` with `Retry` | Covered by the same component and test as the dashboard error |
| No payees / no match | `No saved payees yet.` / `No payees match your search.` (the new-recipient option is always there) | Type `zzz` in Search payees |
| Validation errors | Under each field, linked with `aria-describedby`; focus goes to the first invalid field | Press `Continue` with nothing chosen, or enter `9999` as the amount |
| Sending | The button reads `Sending…` and is disabled | Confirm a transfer |
| Send failed | An alert: `Something went wrong. Your money hasn't left your account. Try again.` Stays on the review step | Put `#fail` in the note (the API's documented test hook) and confirm |
| Success | `Transfer sent`, the amount, the recipient and the reference | Confirm a transfer |

## Tests

`npm test` currently runs 188 tests:

- **Contrast (64):** parses the real `design-tokens.css` and checks WCAG AA (4.5:1) for 16 text/background pairs the UI uses (including the Pending chip), in all four theme + segment combinations.
- **Pre-paint script (6):** runs the actual inline script from `index.html`: first visit follows the system, a stored choice wins, bad values are ignored, blocked storage doesn't break it, and keys match the app code.
- **ThemeToggle, SegmentSwitch, Header (7):** behaviour through the accessible UI: clicking updates `<html>`, `aria-pressed`, and storage, and the controls start from what the pre-paint script set.
- **MUI theme (1):** no hard-coded colours in the palette.
- **Money and customer helpers (6):** the total excludes the credit card, sums don't drift, remaining limit.
- **Dashboard (6):** a loading placeholder then the dashboard; the total (credit card excluded) and all three accounts; the 8 newest transactions, newest first; **a failed request shows the error and `Retry` loads the dashboard (required test 3)**; the app greets the customer and shows their initials; the `Dashboard` container lays out every section from the data it is given.
- **BalanceHero, AccountCard and DailyLimit (7):** the total and caption (singular and plural), the `New transfer` button, account details, `Amount due` on the credit card, and the remaining daily limit with its progress bar. Money is asserted with `formatMoney`, normalised for the non-breaking space `Intl` inserts.
- **Transactions (18):** the filter (description, category, case, surrounding spaces, no match across the description/category boundary), signed amounts, the Pending chip, and the list's behaviour: search, result count, the clear button, and the no-matches message whose `Clear search` restores the list and returns focus to the search box.
- **Collapsible sections and account icons (7):** expanding and collapsing (also by keyboard), the summary shown while collapsed (accounts and transactions), search text kept across a collapse, and a different icon per account type.
- **Dates, greeting and transaction icons (7):** the long date in Singapore time (even when it is a different day elsewhere), the greeting wording and date line, a different icon per category, a fallback for an unknown one, and that the icons are hidden from screen readers.
- **InlineError (1)** and **formatters (2, from the starter).**

- **Transfer form rules (22):** every rule in `transferSchema.ts` with its boundary values: name 2-50 characters, exactly 8 digits, a bank, the amount (required, format, 2 decimals, at least 1.00, the balance, the daily limit, which message wins) and the 50-character note. Also that a missing value (`null`, which an unchecked radio group produces, or `undefined`) gets our wording, never the validation library's own.
- **Sending (4 + 1):** the request is either a saved payee or a new recipient, never both; API field names map onto form fields; the stepper marks the current step.
- **Transfer dialog (29):** run through the real dashboard and mock API: opening, focus on the heading, `Esc` and the close button, focus returning to the button, payee search (including that a chosen payee stays in view when a later search no longer matches them), keyboard operation, each step's validation messages, focus on the first invalid field, `Back` keeping data, the review details, a failed send, and sending only once, and the `Continue` button's state at each step (dimmed until the step is valid, still focusable, and pressing it early explains what is wrong).

All three required tests are covered: **an amount over the balance shows the error and sends no request** (asserts zero POSTs), **a successful transfer shows the success screen and the dashboard updates** (new balance, new transaction and new remaining limit), and **a failed dashboard request shows the error and `Retry` loads it**.

## AI use

Tool: Claude Code, for planning, writing code and tests, and checking the result in a real browser.

Places I changed or corrected what it produced:

1. **MUI theme.** The first version pointed MUI colours at CSS variables and crashed in the Button (`Unsupported var(--brand) color`). Switching on MUI's CSS-variables mode fixed the crash, but it still left hard-coded defaults and console warnings. Checking in Chrome and listing the palette found those leaks, which led to the `nativeColor` option and the palette test.
2. **Browser checks found two bugs the tests missed.** The Retail/Premium buttons were 36px tall (the brief needs 44px), and a missing favicon logged a 404 in the console. Both were fixed.
3. **Folder structure.** It first proposed feature folders. I rejected that and asked for the layer-based layout I use on other projects, which is what the code uses now.
4. **Sideways scrolling on small phones.** The page had a hidden minimum width of 370px, because a grid column sized itself to the widest `nowrap` transaction row, and the fixed `New transfer` button went off-screen with it. The AI had only measured at 390px and 1280px. I spotted it in Chrome's device mode; the fix was `grid-template-columns: minmax(0, 1fr)`, and the page is now measured at every width from 280px to 520px.
5. **Bugs the transfer tests and browser checks caught in the AI's first version.** On a failed `Continue`, focus jumped to Account number, not Recipient name, because the form focuses the first invalid field in the order fields were registered and the component registered them out of visual order. The dialog's footer buttons ignored my CSS because MUI's styles were injected after mine (fixed once, for all MUI components, with `StyledEngineProvider injectFirst`). Adding MUI doubled the main bundle, so the dialog is now lazy-loaded. And focus wouldn't return to the opener in Safari, so it is set explicitly. Finally, pressing `Continue` after tabbing past the payees without choosing showed the library's raw `Invalid input: expected string, received null`: a radio group with nothing checked reports `null`, not an empty string, and the schema only expected a string. I spotted it in the browser; the rules now give our own message for a missing value, with a test that sweeps every field the steps show.

## Not done / known issues

- Deployment (E6) is not done yet.
- Closing the dialog while a transfer is sending doesn't cancel it: the request completes and the dashboard still refreshes.
- The optional extras in the brief (`Discard this transfer?`, a `#transfer` link, an end-to-end test, CI, a debug menu) are not built.
- There is no debug menu yet to trigger the dashboard error state in the deployed app (optional in the brief).
- `<meta name="theme-color">` in `index.html` is a fixed light colour, so mobile browser chrome doesn't follow dark mode.
- The favicon is the Retail blue and does not follow the Retail/Premium switch.
