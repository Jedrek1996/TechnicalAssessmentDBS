# System design (RADAO), Meridian Banking

**R**equirements, **A**rchitecture, **D**ata model, **A**PI, **O**ptimizations.
Part 0 holds everything that applies to the whole app (rendering, state, API, folders). Parts 1-4 only cover what is specific to each task and link back instead of repeating.
Every choice says **picked / gave up / why**.

| Part | Task | Covers | Status |
| --- | --- | --- | --- |
| 0 | Shared foundation | Rendering, state, UI library, folders, data, API, performance, security | n/a |
| 1 | Dashboard | D1-D8 | in progress (D1, D2, D7 done) |
| 2 | Transfer flow | T1-T8, validation | to do |
| 3 | Themes | TH1-TH3 | **built** |
| 4 | Engineering and tests | E1-E6 | in progress |

---

# Part 0. Shared foundation

## R. Requirements

**Answers to the usual clarifying questions (all come from the brief)**

| Question | Answer |
| --- | --- |
| Devices | Both. Breakpoints 640 and 1024 px. Works down to 360 px. |
| Login | None. One fixed customer (Ava). |
| SEO | Not needed, so **CSR**. A static deploy with the API in a service worker rules out SSR anyway. |
| Data | Fetched on load, refetched after a transfer. No real-time, no multi-user editing. |
| Size | 3 accounts, 4 payees, 15 transactions (8 shown). Tiny: no pagination or virtualization. |
| Languages | English, SGD only. |

**Steel thread:** load the dashboard, open the dialog, pick a payee, enter an amount, confirm, see the new balance.

**Non-functional targets**

| Concern | Target |
| --- | --- |
| Performance | LCP about 2 s, interactions about 300 ms. The mock API adds 500 ms, so skeletons cover it. |
| Accessibility | Fully keyboard-operable, WCAG AA contrast, visible focus. |
| Reliability | Every failure has a message and a retry. Never show success after a failure. |

**Out of scope:** login, Cards/Payments/Insights pages, charts, notifications, editing payees, transaction detail, other currencies, translations.

## A. Architecture

```
[ Network ]    fetch("/api/...") -> MSW service worker answers (browser, tests, deployed site)
     v
[ API layer ]  src/api: apiFetch + typed query/mutation hooks (components never call fetch)
     v
[ State ]      server cache (TanStack Query) | form (React Hook Form) | local UI (useState) | <html> attributes (theme)
     v
[ App shell ]  providers, Header, layout grid
     v
[ Pages ]      DashboardPage -> components (dashboard, transfer, common)
```

**Where state lives**

| State | Lives in | Why |
| --- | --- | --- |
| Customer, accounts, transactions, payees | TanStack Query | Required (E2). Caching, retry, refetch come free. |
| Search text | `useState` in `TransactionList` | One page, no router. Gave up a shareable `?q=` URL (easy upgrade). |
| Dialog open, current step | `useState` in `TransferDialog` | Pure UI state. |
| Form values across steps | One React Hook Form instance | `Back` keeps data for free. |
| Theme, segment | `<html data-*>` + `localStorage` | Tokens read the attributes, so no re-render is needed to restyle. |
| Global store (Redux/Zustand) | **Not used** | Nothing is shared that isn't server data. |

**UI library: MUI, scoped.** Picked MUI for the transfer dialog and form inputs only (focus trap, `Esc`, focus return, labelled inputs). Layout, cards, header and transaction rows are plain CSS modules on the design tokens. Gave up: a smaller bundle and zero dependency. Why: the brief allows a library for basic pieces but not a dashboard template, and MUI is the one I know. The theme is generated from `styles/theme/tokens.ts`, so every MUI colour is a `var(--token)`; this needs `cssVariables: { nativeColor: true }` (see Part 3).

**Folder layout** (layer-based, same as the Stride project; tests sit next to the code)

```
src/
  api/          client.ts, types.ts (given), queries.ts (keys + query options), transfers.ts (mutation, to come)
  components/   grouped by category, then one folder per component (<Name>.tsx, .test.tsx, index.ts)
    layout/       Header, ContentLayout                    (built)
    theme/        ThemeToggle, SegmentSwitch               (built)
    dashboard/    Greeting, DashboardSkeleton (built); BalanceHero, AccountCard, TransactionList, SearchInput, DailyLimit (to come)
    transfer/     TransferDialog, Stepper, steps, SuccessPanel
    common/       Button, Skeleton, InlineError (built); EmptyState (to come)
  constants/    theme.ts (built)
  hooks/        useTheme, useCustomer, useDashboardData (built)
  lib/          format.ts (given)
  pages/        DashboardPage (built)
  providers/    QueryClient + MUI ThemeProvider
  store/        themeStore (built)
  styles/       index.css, components/ (one CSS module per component, same categories), theme/ (tokens, MUI theme)
  utils/        storage, theme guards, money, customer (built); later schema helpers
  test/, mocks/ (given, not edited except `cleanup()` in test/setup.ts)
```
Picked **layers** over feature folders: familiar and easy to explain. Gave up having one feature's files together. No `routing/` (one page).

## D. Data model

API types in `src/api/types.ts` are given and are the single source (`Customer`, `Account`, `Transaction`, `Payee`, `Transfer`, `ApiErrorBody`...). UI-only types live next to their use (`ThemeMode` in `constants/theme.ts`, `TransferStep` with the dialog).

- **Shape: nested, not normalized.** Small read-only lists, each entity appears once. TanStack Query's cache is the store.
- **Persistence:** data is in-memory (a refresh resets it, as the brief expects). `localStorage` only for `theme` and `segment`.
- **Query keys** in one place (`api/queries.ts`):
```ts
const keys = {
  customer: ['customer'] as const,
  accounts: ['accounts'] as const,
  transactions: (limit: number) => ['transactions', { limit }] as const,
  payees: ['payees'] as const,
}
```

## A. API

| Endpoint | Used by | Response |
| --- | --- | --- |
| `GET /api/customer` | Dashboard, transfer (limit) | `{ customer }` |
| `GET /api/accounts` | Dashboard, transfer (from-account) | `{ accounts }` |
| `GET /api/transactions?limit=8` | Dashboard | `{ transactions, total }` |
| `GET /api/payees` | Transfer step 1 | `{ payees }` |
| `POST /api/transfers` | Transfer confirm | 201 `{ transfer, account, dailyLimit }` |

Errors are `{ error: { code, message, fields?, meta? } }`, thrown as `ApiError` by `apiFetch`.

| Status / code | UI response |
| --- | --- |
| 400 `VALIDATION_ERROR` | Inline field errors (`fields`) plus alert |
| 422 `INSUFFICIENT_FUNDS` / `DAILY_LIMIT_EXCEEDED` | Inline amount error plus alert |
| 500 `INTERNAL_ERROR` | Dashboard: error panel with Retry. Transfer: alert on the review step. |

Demo hooks (`?scenario=error|empty`, `?delay=`, note `#fail`) are for demonstrating states and tests only.

## O. Optimizations (apply to every part)

- **Performance:** skeletons, not spinners. Queries fire in parallel. `staleTime: 30s` (set in `main.tsx`) so the dialog's reads hit the cache.
- **Security (2 picked):** user text (note, name) is rendered as plain React text, never `dangerouslySetInnerHTML`. The API re-validates every rule, so the client is never the only check.
- **Not needed here, and why:** debounce (filtering 8 rows is instant), `AbortController` (TanStack Query cancels), lazy loading (no images or routes), virtualization (8 rows), pagination (`limit=8`), real-time (balances change only when Ava transfers).

---

# Part 1. Dashboard (D1-D8)

## R. Requirements
1. See total available, accounts and recent transactions.
2. Search transactions.
3. Recover from a load failure with `Retry`.
4. Start a transfer.

States: loading (skeleton), loaded, request error, no search matches, and a simple empty state for `?scenario=empty`. No layout shift on load (D1). Tap targets of at least 44 px and no horizontal scroll at 390 px (D8).

## A. Architecture

```
<DashboardPage>
 |- three queries in parallel: customer, accounts, transactions(8)
 |- pending -> <DashboardSkeleton/>              (same grid and heights as the loaded view)
 |- error   -> <InlineError message="We couldn't load your dashboard." onRetry/>
 '- loaded:
     <BalanceHero total depositCount onNewTransfer/>
     <AccountCard account/> x3                    (credit: "Amount due")
     <TransactionList transactions>
        |- <SearchInput value count onChange onClear/>
        |- <TransactionRow/> xN                   (+/- sign, Pending chip)
        '- <EmptyState "No transactions match your search." onClear/>
     <DailyLimit limit used/>                     (right rail)
```

| Component | Props | Callbacks |
| --- | --- | --- |
| `BalanceHero` | `total`, `depositCount` | `onNewTransfer()` |
| `AccountCard` | `account` | none |
| `TransactionList` | `transactions` | none (owns the `query` state) |
| `SearchInput` | `value`, `count` | `onChange(v)`, `onClear()` |
| `InlineError` | `message` | `onRetry()` |
| `DailyLimit` | `limit`, `used` | none |

**Three queries, not one combined call.** Picked three hooks that fire together (D1). Gave up a single round trip, but each piece caches and refetches on its own, and the API has no combined endpoint.

**Client-side search.** Picked filtering the 8 loaded rows. Instant, no request or loading state. Gave up finding older transactions (server `?q=` would). The brief says "filter the list" and the list is 8 rows.

**Retry refetches the failed queries.** The error screen only shows when a query has no data to show and is not already refetching, so a failed background refetch keeps the older data on screen, and pressing Retry returns to the skeleton rather than sitting on the error. Gave up per-section errors, because the brief wants one dashboard-level error.

**One layout for every state.** Loading, error and loaded all render through `ContentLayout` (one column, then main plus a 300 px rail from 1024 px), and the skeleton mirrors the loaded blocks. That is how D1's "layout shouldn't jump" is met; verified in Chrome that the header and main area sit in the same position before and after loading.

## D. Data model: derived, never stored
```ts
totalAvailable = accounts.filter(a => a.type !== 'credit').reduce((s, a) => s + a.balance, 0)
depositCount   = accounts.filter(a => a.type !== 'credit').length
remainingLimit = customer.dailyTransferLimit - customer.transferredToday
visible        = transactions.filter(t => `${t.description} ${t.category}`.toLowerCase().includes(query.trim().toLowerCase()))
```
Floating point: 2-decimal sums can drift (0.1 + 0.2). Round the total to cents. Display always goes through `formatMoney`.

## O. Optimizations (specific)
- Skeleton reserves exact heights (hero, 3 cards, 8 rows).
- Error state never shows partial or stale zeros.
- a11y: search has a label, result count in an `aria-live="polite"` region, the `+`/`-` sign (not only colour) shows direction.
- Mobile: account cards stack. The fixed bottom CTA respects `env(safe-area-inset-bottom)` and the page has bottom padding so it never hides content.

---

# Part 2. Transfer flow (T1-T8, §3.3)

## R. Requirements
1. Choose a recipient (saved payee or someone new).
2. Choose a from-account, an amount, an optional note.
3. Review and confirm.
4. See success, and see the dashboard update.

States: payee list / no payees / new-recipient fields / field errors; over-balance, over-limit; review idle / sending / API error; success.
Non-functional: no double-send (money really moves twice), keyboard and screen-reader support (T8), focus handling (T1).

## A. Architecture

```
<TransferDialog open onClose>                 (owns: step, useForm, mutation)
 |- <Stepper step/>
 |- 'recipient' -> <RecipientStep/>   payee radio-group + search + "Send to someone new"
 |- 'amount'    -> <AmountStep/>      from-account select, amount + chips, note counter
 |- 'review'    -> <ReviewStep/>      <ReviewSummary/> + <InlineError role="alert"/>
 '- 'success'   -> <SuccessPanel/>    aria-live
```

| Component | Props | Callbacks |
| --- | --- | --- |
| `TransferDialog` | `open` | `onClose()` |
| `RecipientStep` | `payees` (via query) | `onContinue()` |
| `AmountStep` | `accounts`, `remainingLimit` | `onBack()`, `onContinue()` |
| `ReviewStep` | `values`, `isSending`, `error?` | `onBack()`, `onConfirm()` |
| `SuccessPanel` | `transfer` | `onDone()` |

**One `useForm` for all steps, `step` in `useState`.** `Back` and `Continue` only change `step`, so data persists. Gave up a form per step (it would have to be merged and loses data). Per-step validation uses `trigger([...fields])` before advancing.

**MUI `Dialog`.** Gives the focus trap, `Esc` and focus return; `fullScreen` on small screens gives the mobile sheet. Gave up a dependency-free native `<dialog>`, where focus return and the sheet layout would be hand-written. Be ready to say what MUI does for you and what it doesn't (the stepper and per-step focus are still mine).

**Invalidate, not `setQueryData`, after success.** Invalidate customer, accounts and transactions. Simple and always matches the server. Gave up an instant update (about 500 ms of stale view, hidden because the success panel is showing).

**Stay in the dialog on error.** `onError` only sets error state and never changes `step`, so the review data stays intact (T7).

## D. Data model: one validation source (`schema.ts`)

```ts
// Rules defined ONCE
const nameRule    = z.string().trim().min(2, '...').max(50, '...')
const accountRule = z.string().regex(/^\d{8}$/, 'Enter a valid 8-digit account number.')
const bankRule    = z.string().trim().min(1, 'Choose a bank.')
const noteRule    = z.string().max(50, 'Note can be at most 50 characters.')

// Balance and limit are runtime context, so the amount rule is a factory
const makeAmountRule = ({ balance, remaining }: { balance: number; remaining: number }) =>
  z.number({ message: 'Enter an amount.' })
    .min(1, 'Amount must be at least SGD 1.00.')
    .refine(isTwoDecimals, 'Use at most 2 decimal places.')
    .max(balance,   `Amount can't be more than your available balance (${formatMoney(balance)}).`)
    .max(remaining, `This transfer exceeds your remaining daily limit (${formatMoney(remaining)}).`)

interface TransferFormValues {
  recipientMode: 'payee' | 'new'
  payeeId?: string
  newRecipient?: { name: string; accountNumber: string; bank: string }
  fromAccountId: string
  amount: number
  note?: string
}
```
Build the resolver per render from the selected account and customer. Use a discriminated union on `recipientMode` so only the relevant recipient fields are validated. The form resets when the dialog closes after success.

Open points: Zod 4 changed error customisation (check its docs, not v3 snippets). Decide which message wins when both balance and limit fail (Zod reports the first failing `.max`; use `superRefine` to choose).

## A. API (specific)
`POST /api/transfers` takes **either** `payeeId` **or** `recipient`. One function, `toRequest(values)`, maps `TransferFormValues` to `CreateTransferRequest` so the either/or rule lives in one place (omit an empty note). Map `ApiError.fields` onto the form (`recipient.name` becomes `newRecipient.name`), show `ApiError.message` in the alert, and for any 500 show the brief's text: `Something went wrong. Your money hasn't left your account. Try again.`

## O. Optimizations (specific)
- **No double submit:** disable `Confirm transfer` while pending (label `Sending…`) and also guard in the handler.
- **Not optimistic:** money moves, so the UI never claims success first.
- **Validation timing:** `mode: 'onBlur'`, `reValidateMode: 'onChange'`. On `Continue`, run `trigger` and focus the first invalid field.
- **a11y (T8):** labels on every input, `aria-describedby` + `aria-invalid` on errors, payee list as a `radiogroup` with arrow keys, `role="alert"` on the send error, `aria-live="polite"` on success, `aria-current="step"` in the stepper, `inputMode="decimal"` on mobile.
- **Focus:** into the dialog on open, back to the opener on close, to the step heading on step change.
- **Edge cases:** `"12.345"`, `"1e3"`, a name of only spaces, empty note, credit account never offered.
- **Optional if time:** `Discard this transfer?` on a dirty form.

---

# Part 3. Themes (TH1-TH3), built

## R. Requirements
Toggle light/dark instantly. Switch Retail/Premium (brand colour only). Both persist. No flash of the wrong theme on reload. WCAG AA in all four combinations. No hard-coded colours.

## A. Architecture

```
index.html <head>  inline script: stored choice, else system/default -> sets <html data-theme data-segment>   (before first paint)
        |
        v
store/themeStore   only writer of the attributes + localStorage; subscribers notified
        |
hooks/useTheme     useSyncExternalStore over the store
   |- components/theme/ThemeToggle    button, aria-pressed
   '- components/theme/SegmentSwitch   group of aria-pressed buttons
```

**Attributes on `<html>`, not React context.** One attribute write restyles everything through the CSS tokens, with no re-render. Gave up reading the theme as a JS value, which nothing needs.

**Inline pre-paint script.** React mounts too late to avoid a flash. The script is tiny, synchronous and wrapped in try/catch. It repeats the storage keys because it can't import them, so a test runs the real script and fails if they drift.

**Only save on a user action.** A first-time visitor keeps following the system setting until they choose.

**MUI follows the tokens.** `styles/theme/tokens.ts` lists every token as a typed `var(--token)`; `muiTheme.ts` is generated from it, setting every palette slot so MUI's hard-coded defaults can't leak in. Needs `cssVariables: { nativeColor: true }`: plain `cssVariables` still logs a warning per colour, and no CSS-variables mode at all makes MUI's Button throw on `var(--brand)`.

**Segment default.** The API's `customer.segment` is not applied; the stored choice wins, else Retail. Applying the API value after load would repaint the colours. State this in the README.

## D. Data model
`ThemeMode` and the storage keys and defaults live in `constants/theme.ts`; `Segment` comes from the API types. Stored values are validated with `isThemeMode` / `isSegment` before use because `localStorage` is user-editable.

## O. Optimizations and checks (what is actually verified)
- **Contrast:** `contrast.test.ts` parses the real `design-tokens.css` and checks 15 text/background pairs at 4.5:1 in all four combinations (60 checks, all pass).
- **Pre-paint script:** `themeInit.test.ts` runs the real script: first visit follows the system, a stored choice wins, bad values are ignored, blocked storage works.
- **MUI palette:** `muiTheme.test.ts` fails on any hard-coded colour (four unused-component values are listed exceptions). Also checked in Chrome that MUI colours resolve to the token values in all four combinations.
- **Controls:** buttons have names and `aria-pressed`; 44 px tap targets; `:focus-visible` uses `--focus-ring`; reduced motion respected.
- **Known gap:** `<meta name="theme-color">` is a fixed light colour.

---

# Part 4. Engineering and tests (E1-E6)

## R. Requirements
TS strict, no `any`. TanStack Query for server data. RHF + Zod. The 3 required behaviour tests. `check` and `build` pass with no console errors. A public deploy that works with no server. Tests must be independent (the starter resets mock data before each test).

## A. Architecture: test layers
| Layer | What | Where |
| --- | --- | --- |
| Unit | Pure helpers and rules (contrast, guards, schema, money) | next to the code |
| Component / integration | React Testing Library + MSW through the real UI | `*.test.tsx` |
| E2E | Skipped unless time remains | n/a |

Picked integration through the real UI with MSW: it tests behaviour (what the user sees), which the brief asks for. Gave up some E2E realism (no real browser or service worker). A `renderWithClient` helper gives each test a fresh `QueryClient` with `retry: false`.

## D. The three required tests

| # | Test | How |
| --- | --- | --- |
| 1 | Amount over balance shows the error and sends no request | Open dialog, pick a payee, enter more than the balance, `Continue`. Assert the exact message (`formatMoney(balance)`) and **zero** `POST /api/transfers` (record requests with `server.events` or a recording handler). |
| 2 | A successful transfer shows success and the dashboard updates | Full flow. Assert `Transfer sent`, amount, reference. `Back to dashboard`, then `findByText` of the new balance. Real handlers, so a true round trip. |
| 3 | Failed dashboard shows the error and Retry loads it | `server.use(...)` a 500 on `/api/accounts`, assert `We couldn't load your dashboard.`, restore the handler, click `Retry`, assert the dashboard. |

Query by role and accessible name, use `userEvent`, compare money with `formatMoney(...)`, and never assert on internal state or class names. Cheap extra unit tests: schema accepts `"12.34"` and rejects `"12.345"`, `"0.99"`, 7-digit account numbers; `totalAvailable` excludes credit.

## O. Build, deploy, quality
- Deploy to Netlify, Vercel or Cloudflare Pages: build `npm run build`, output `dist`, confirm `dist/mockServiceWorker.js` exists. The worker starts before the first request in `main.tsx` and is not gated behind DEV.
- Verify the deployed site in a normal window: Service Workers shows activated, `/api/health` shows `(from service worker)`, a transfer completes. Hard-reload once after a redeploy.
- Console clean: watch for React key warnings, `act()` warnings, MSW "unhandled request".
- Optional: a GitHub Actions workflow running `npm ci`, `npm run check`, `npm run build`.
- Known limitation to state: data resets on refresh (in memory, expected).
