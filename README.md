# 🏦 Meridian Banking — Jedrek Koh

- 🚀 Deployed: https://meridianbankassignmentjed.netlify.app/
- 💻 Run locally: `npm install && npm run dev` (http://localhost:5173). Node 22 (see `.nvmrc`).

A small banking app for one customer, Ava Chen: a dashboard of her accounts and recent transactions, and a three-step transfer. The brief is in [`brief/candidate-brief.md`](brief/candidate-brief.md).

📐 Want to know how the app is designed? See [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md): requirements, architecture, data, API and optimisations, with the trade-off for each choice.

**⏱️ Try it in two minutes**

1. Reload to see the loading skeleton, then toggle light/dark and Retail/Premium (they survive a reload).
2. Search the transactions (`groceries`, `zzz`), and collapse Accounts and Recent transactions.
3. Press **New transfer**: pick a payee, enter an amount (try `9999`), review, confirm. The dashboard updates behind the dialog.
4. Put `#fail` in the note and confirm to see the send-failure state.
5. Resize to a phone (the page works from 320px): the `New transfer` button is fixed to the bottom.

## ✅ Requirements coverage

Everything required in the brief is built and deployed. The full matrix (each requirement ID, where it lives, and how it was checked) is in [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md).

| Area | Requirements | Status |
| --- | --- | --- |
| Dashboard | D1-D8: parallel loading and skeleton, header, total, accounts, transactions, search, error + Retry, mobile layout | ✅ Done |
| Transfer | T1-T8: dialog, three steps, send, refresh, failure, accessibility | ✅ Done |
| Validation | §3.3: every rule defined once, real figures in the messages | ✅ Done |
| Themes | TH1-TH3: light/dark, Retail/Premium, accessible | ✅ Done |
| Engineering | E1 types, E2 server data, E3 forms, E5 `check` + `build` | ✅ Done |
| Tests | E4: the three required behaviour tests (plus 185 more) | ✅ Done |
| Deployment | E6: public URL (Netlify), static files with the mock API in the browser | ✅ Done |
| Optional | Daily-limit progress bar | ✅ Done. The others (discard prompt, debug menu, balance-hide, third segment, `#transfer` link, end-to-end test, CI) are not built |

## ⌨️ Commands

```bash
npm run dev         # start the app
npm run check       # lint + typecheck + tests
npm run build       # production build into dist/
```

## 🗂️ Project structure

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
  providers/    AppProviders (TanStack Query)
  store/        themeStore (tiny external store over the <html> attributes)
  styles/
    index.css     global base styles (imports the brief's design tokens)
    components/   one CSS module per component, same categories as components/
    theme/        typed token palette, MUI theme
  utils/        money, transactions (filter, signed amounts), transferSchema (every validation rule),
                dates, customer initials, storage and type guards
  mocks/, test/ mock API and test setup (from the starter, not edited)
public/
  favicon/      browser tab and iPhone home-screen icons, one set each for Retail and Premium (the tab icon follows the switch)
```

Not edited from the starter: `mock-api/` and `src/mocks/`. The only change to `src/test/setup.ts` is adding RTL `cleanup()`, because Vitest has no globals here and renders were leaking between tests.

## 🧭 Decisions and trade-offs

### Data and state

- **Server data lives in TanStack Query, and nothing else is global.** `api/queries.ts` holds the keys and options. The only client state is the theme, held in the `<html>` attributes.
- **Three queries, fired together.** Customer, accounts and transactions load in parallel (no waterfall) and `useDashboardData` folds them into one state. Older data stays on screen if a refetch fails; the error screen only shows when there is nothing to show, and `Retry` returns to the skeleton.
- **Search filters the 8 loaded transactions in the browser** (description or category, ignoring case and spaces) instead of calling `?q=`: instant, no request. _Trade-off:_ it cannot find older transactions. The brief allows either.
- **Money is summed in whole cents** (`0.1 + 0.2` is not `0.3`). The total excludes the credit card by account type and is derived on render, never stored.
- **After a transfer, refetch instead of patching the cache.** Customer, accounts and transactions are invalidated (not awaited), so the success screen shows at once. _Trade-off:_ about half a second of old numbers behind the dialog.

### The transfer flow

- **One form, each rule written once.** A single React Hook Form instance keeps everything when you press `Back`. Every rule lives in `utils/transferSchema.ts`; each step validates only its own fields, and the amount rule uses the real balance and remaining limit so messages show actual figures (the balance message wins if both are exceeded). Fields are checked on blur and on `Continue` (focus goes to the first invalid one).
- **`Continue` looks disabled until the step is valid, but stays focusable.** It uses `aria-disabled="true"`, not `disabled`: the brief wants `Continue` to show errors and focus the first invalid field, and a truly disabled button can't be focused or announced, so keyboard and screen-reader users would never learn what is missing.
- **Saved payees and "Send to someone new" are one native radio group**, so arrow keys, Tab and screen readers work without custom code. The chosen payee shows a checkmark and stays visible under `Selected` if a search no longer matches it. Bank and from-account are native `<select>`s.
- **Sending can't happen twice.** The button is disabled and reads `Sending…`, and the handler also refuses a second call, since a fast double click could otherwise move the money twice. A failure stays on the review step with an alert and the data intact.
- **Focus returns to the opener explicitly**, because Safari doesn't focus a clicked button, so MUI would have nothing to restore. The dialog ignores backdrop clicks so a stray click can't throw away what was typed.

### Theming and design tokens

- **Theme lives on `<html>`, not in React state.** `data-theme` and `data-segment` drive the tokens, so toggling needs no re-render. An inline script in `index.html` applies the stored choice before first paint (no flash); on a first visit the system setting decides. _Trade-off:_ the script repeats the storage keys, so a test fails if they drift from `constants/theme.ts`.
- **MUI only for the dialog and text fields.** Layout, cards, list and header are plain CSS on the tokens (the brief rules out a ready-made template). _Trade-off:_ MUI brings its own colours, so its theme is built from a typed palette of `var(--token)` values (needs `cssVariables: { nativeColor: true }`), and a test fails on any hard-coded colour.

### Layout and loading

- **One grid, three layouts.** The daily limit sits under the total on phones, beside it on tablets and in the right column from 1024px. The skeleton uses the same grid and was checked against the real page at 390, 700, 1000 and 1280px, so nothing moves when data arrives.
- **Accounts and Recent transactions collapse.** A toggle beside each heading swaps the content for a summary card (never empty), with a height animation; search text survives a collapse.

### ⚡ Performance

- **The transfer dialog is a lazy chunk**, with MUI's theme and styling engine inside it. It is prefetched once the dashboard is up and mounts on first use. First load: **285 kB (89 kB gzipped)** instead of about 628 kB.
- **No `useMemo`, `useCallback` or `React.memo`, on purpose.** I measured first: rebuilding the schema takes under 0.1 ms, typing in search re-renders only the list (under 1 ms a letter), and the form costs about 3 ms a keystroke in jsdom, well under a 16 ms frame.

### ✨ Visual polish

Not required by the brief, so every addition follows the same rules: no new colours (shades are `color-mix` of the tokens, so they follow Retail/Premium and light/dark), no layout shift, and reduced motion respected. It includes transaction and account icons, a date line, a `% used` bar on the daily limit, an animated gradient on the balance card, a frosted sticky header, fade-in sections and a sliding Retail/Premium pill. Text contrast over the new backgrounds was measured in all four theme combinations (worst case 5.13:1 against the 4.5:1 minimum). The fade-in is opacity only, because a transform would break the fixed `New transfer` button.

## 🔄 Loading, empty and error states

| State | What the user sees | How to see it |
| --- | --- | --- |
| Loading | A skeleton whose blocks match the real ones' position and size, so nothing moves when data arrives | Reload the page (the mock API answers after about 500 ms) |
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

## 🧪 Tests

`npm test` runs 188 tests.

- **Contrast (64):** parses the real `design-tokens.css` and checks WCAG AA (4.5:1) for 16 text/background pairs the UI uses, in all four theme + segment combinations.
- **Pre-paint script (6):** runs the actual inline script from `index.html`: first visit follows the system, a stored choice wins, bad values are ignored, blocked storage doesn't break it, and keys match the app code.
- **ThemeToggle, SegmentSwitch, Header (7):** behaviour through the accessible UI: clicking updates `<html>`, `aria-pressed` and storage, and the controls start from what the pre-paint script set.
- **MUI theme (1):** no hard-coded colours in the palette.
- **Money and customer helpers (6):** the total excludes the credit card, sums don't drift, remaining limit.
- **Dashboard (6):** a loading placeholder then the dashboard; the total and all three accounts; the 8 newest transactions; **a failed request shows the error and `Retry` loads the dashboard (required test 3)**; the greeting and initials; the container lays out every section.
- **BalanceHero, AccountCard and DailyLimit (7):** the total and caption, the `New transfer` button, account details, `Amount due`, and the remaining limit with its progress bar. Money is asserted with `formatMoney`, normalised for the non-breaking space `Intl` inserts.
- **Transactions (18):** the filter (description, category, case, spaces, no match across the description/category boundary), signed amounts, the Pending chip, search, the result count, the clear button, and the no-matches message.
- **Collapsible sections and account icons (7):** expanding and collapsing (also by keyboard), the summary shown while collapsed, search text kept across a collapse, a different icon per account type.
- **Dates, greeting and transaction icons (7):** the long date in Singapore time, the greeting, a different icon per category with a fallback, icons hidden from screen readers.
- **Transfer form rules (22):** every rule with its boundary values, and that a missing value (`null` from an unchecked radio group, or `undefined`) gets our wording, never the validation library's.
- **Sending and stepper (5):** the request is a saved payee or a new recipient, never both; API field names map onto form fields; the stepper marks the current step.
- **Transfer dialog (29):** run through the real dashboard and mock API: opening, focus, `Esc`, focus returning to the button, payee search (including the chosen payee staying in view), keyboard use, each step's messages, focus on the first invalid field, `Back` keeping data, the review, a failed send, sending only once, and the `Continue` button's state at each step.
- **InlineError (1) and formatters (2, from the starter).**

All three required tests are covered: **an amount over the balance shows the error and sends no request** (asserts zero POSTs), **a successful transfer shows the success screen and the dashboard updates** (new balance, transaction and remaining limit), and **a failed dashboard request shows the error and `Retry` loads it**.

## 🤖 AI use

Tool: Claude Code, for planning, writing code and tests, and checking the result in a real browser.

Places I changed or corrected what it produced:

1. **MUI theme.** The first version pointed MUI colours at CSS variables and crashed in the Button (`Unsupported var(--brand) color`). Switching on MUI's CSS-variables mode fixed the crash but left hard-coded defaults and console warnings; listing the palette in Chrome found those leaks, which led to the `nativeColor` option and the palette test.
2. **Browser checks found two bugs the tests missed.** The Retail/Premium buttons were 36px tall (the brief needs 44px), and a missing favicon logged a 404 in the console.
3. **Folder structure.** It first proposed feature folders. I rejected that and asked for the layer-based layout I use on other projects, which is what the code uses now.
4. **Sideways scrolling on small phones.** The page had a hidden minimum width of 370px, because a grid column sized itself to the widest `nowrap` transaction row, and the fixed `New transfer` button went off-screen with it. The AI had only measured at 390px and 1280px. I spotted it in Chrome's device mode; the fix was `grid-template-columns: minmax(0, 1fr)`, and the page is now measured at every width from 280px to 520px.
5. **Bugs in the AI's first transfer flow.** On a failed `Continue`, focus jumped to Account number, not Recipient name, because the form focuses the first invalid field in registration order and the component registered them out of visual order. The dialog's footer ignored my CSS because MUI's styles were injected after mine (fixed with `StyledEngineProvider injectFirst`). Focus wouldn't return to the opener in Safari, so it is set explicitly. And `Continue` after tabbing past the payees showed the library's raw `Invalid input: expected string, received null`, because a radio group with nothing checked reports `null`, not an empty string; I spotted it in the browser and the rules now give our own message.
6. **A flaky test the AI introduced.** After the dialog was lazy-loaded, one transfer test failed intermittently when the machine was busy: the first open had to load a large chunk and the test only waited the default second. I reproduced it by running two suites at once, then fixed it by preloading the dialog before the tests and waiting longer for the first open.
7. **Unneeded optimisation.** I asked whether to add `useMemo`, `useCallback` and `React.memo`. Instead of adding them, we measured, found nothing slow, and only changed the one thing that mattered (moving the MUI theme into the lazy chunk, which cut the first load by 95 kB).

## 🚧 Not done / known issues

- There is no debug menu to trigger the dashboard error state in the deployed app (optional in the brief); the error state is covered by a test.
- Closing the dialog while a transfer is sending doesn't cancel it: the request completes and the dashboard still refreshes.
- The other optional extras are not built: `Discard this transfer?`, a `#transfer` link, an end-to-end test, CI, a balance-hide toggle, a third segment.
- `<meta name="theme-color">` in `index.html` is a fixed light colour, so mobile browser chrome doesn't follow dark mode.

## 📚 More documentation

- [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md): every requirement ID with where it lives and how it was checked.
- [`SYSTEM_DESIGN.md`](SYSTEM_DESIGN.md): the design walked through requirements, architecture, data, API and optimisations, with the trade-off for each choice.
- [`brief/`](brief/) and [`wireframes/`](wireframes/): the original brief, API contract, design tokens and wireframe. [`DEPLOYMENT.md`](DEPLOYMENT.md): hosting settings.
