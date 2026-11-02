# Meridian Banking take-home: what they want

A plain-English summary of `README.md` and `brief/`. The brief is the source of truth.

## Run it

```bash
nvm use              # .nvmrc pins the Node version (README says 22; package.json needs >=20)
npm install
npm run dev          # http://localhost:5173, shows "Mock API: connected"
npm test             # vitest run once (npm run test:watch to watch)
npm run lint
npm run typecheck
npm run check        # lint + typecheck + tests (must pass before submitting)
npm run build        # tsc + vite build into dist/ (must pass before submitting)
npm run mock         # optional Node mock server on :4010, for curl only
```

Starter status (verified): install OK, `npm run check` passes (3 starter tests), dev server serves on :5173.

There is no backend. MSW (Mock Service Worker) answers `/api/*` in the browser, in tests and on the deployed site. Responses take about 500 ms, and data resets on page refresh.
**Do not edit `mock-api/` or `src/mocks/`.** To test an edge case, override a response inside the test with `server.use(...)`.

## The task

Build a one-page signed-in banking app for **Ava Chen**. There is no login and no routing.

1. **Dashboard**: total balance, 3 accounts, recent transactions with search.
2. **New transfer dialog**: Recipient, then Amount, then Review, then Send. The dashboard then shows the new balance.
3. **Light/dark mode** and a **Retail (blue) / Premium (crimson)** switch.

Time budget: about 8-12 hours, and you have 2 weeks to submit.

## Requirements checklist

### Dashboard
| ID | Requirement |
| --- | --- |
| D1 | Fetch customer, accounts and transactions (`limit=8`) **in parallel**. Skeletons while loading, with no layout jump. |
| D2 | Header: logo, `Good evening, Ava`, Retail/Premium switch, theme toggle, `AC` avatar. Cards/Payments/Insights nav items are shown **disabled**. |
| D3 | Total available `SGD 17,120.55` = checking + savings (credit excluded). Caption `Across 2 deposit accounts`. **Compute it. Don't store it.** |
| D4 | 3 account cards (name, masked number, balance). Credit shows `-SGD 420.30` and an `Amount due` label. |
| D5 | 8 newest transactions, newest first: description, category, date (`18 Oct`), amount, `Pending` chip. In: `+SGD 45.00` in the positive colour. Out: `-SGD 86.40` in normal text colour. |
| D6 | Search by description **or** category, case-insensitive. Show a result count and a clear button. No matches: `No transactions match your search.` plus a `Clear search` button. Filter client-side or with `?q=`, and say which you chose and why in the README. |
| D7 | Load failure: `We couldn't load your dashboard.` plus `Retry`. Trigger it with `?scenario=error`. |
| D8 | Mobile (390 px): one column, 16 px margins, no horizontal page scroll, fixed bottom `New transfer` button, tap targets of at least 44 px. |

### Transfer
| ID | Requirement |
| --- | --- |
| T1 | Centred dialog on desktop (1024 px and up), full-screen sheet on mobile. Focus moves in. `Esc` and `✕` close it. Focus returns to the opener. Stepper shows `Recipient → Amount → Review`. |
| T2 | `Who are you sending to?` Payee list from the API with search, or `Send to someone new` (name, 8-digit account number, bank). |
| T3 | `How much?` From-account (checking/savings only), amount, quick chips 50/100/250/500, optional note (max 50, with counter). Show the available balance and remaining daily limit. |
| T4 | `Check the details`: from, to (name, masked number, bank), amount, fee `SGD 0.00`, total, note. `Back` keeps all entered data. |
| T5 | `Confirm transfer` sends `POST /api/transfers`. Button reads `Sending…` and is disabled while in flight. Success shows `Transfer sent`, the amount, the recipient, the API reference and `Back to dashboard`. |
| T6 | After success, the dashboard shows the new balance, new transaction and new remaining limit without a reload. |
| T7 | On failure, stay on Review with data intact. Show the error in a `role="alert"`. Allow retry. Never show success after a failure. |
| T8 | Every input has a label. Field errors use `aria-describedby`. The send error uses `role="alert"`. The success message uses `aria-live`. The payee list is keyboard-operable. |

### Validation (define each rule once, e.g. one Zod schema)
| Field | Rule |
| --- | --- |
| Recipient name | 2-50 chars |
| Account number | exactly 8 digits: `Enter a valid 8-digit account number.` |
| Bank | required |
| Amount | required, at least 1.00, at most 2 decimals |
| Amount | at most the balance: `Amount can't be more than your available balance (SGD 4,280.55).` |
| Amount | at most the remaining daily limit: `This transfer exceeds your remaining daily limit (SGD 5,000.00).` |
| Note | max 50 chars |

Use the real balance and limit in the messages. Validate on blur and on `Continue`. On `Continue`, **focus the first invalid field**. If the API rejects anyway, show its `fields.*` message under the field and its `message` in an alert.

### Themes
| ID | Requirement |
| --- | --- |
| TH1 | Light/dark switches instantly. First visit follows the system setting. Persist to `localStorage`. Apply **before first paint** (an inline script in `index.html`) so there is no flash. |
| TH2 | Retail/Premium changes only the brand colour, in both modes, and is persisted. Use **only the CSS variables** from `design-tokens.css`. No hard-coded colours. |
| TH3 | Toggles have labels or `aria-pressed`. Focus is always visible. WCAG AA contrast in all 4 combinations. |

Both are set on `<html data-theme="dark" data-segment="premium">`.

### Engineering
| ID | Requirement |
| --- | --- |
| E1 | TS strict, real API types, **no `any`** (ESLint enforces). |
| E2 | TanStack Query for server data. **Don't copy API data into `useState` or a global store.** |
| E3 | React Hook Form + Zod, each rule defined once. |
| E4 | **3 tests minimum**, testing behaviour: (1) amount over balance shows the error and sends **no request**; (2) a successful transfer shows the success screen and the dashboard updates; (3) a failed dashboard request shows the error, and `Retry` loads it. |
| E5 | `npm run check` and `npm run build` pass. No console errors. |
| E6 | Deployed to Netlify, Vercel or Cloudflare Pages, working with no local server. |

**Avoid:** fetching in `useEffect` with hand-rolled loading flags, storing derived totals, hard-coded colours, and the same validation rule written in two places.

### Optional (none needed for a strong result)
Daily-limit progress bar (the wireframe's right rail has one), `Discard this transfer?` confirm, debug menu for error/empty states, balance-hide toggle, third segment, `#transfer` deep link, one E2E test, GitHub Actions CI.

### Out of scope
Login, Cards/Payments/Insights pages, charts, notifications, editing payees, transaction detail, other currencies, translations.

## Copy and formatting (use verbatim)
- Money: `formatMoney` from `src/lib/format.ts`. Add the `+` yourself for money in.
- Dates: `formatShortDate`, always in Singapore time.
- Big numbers: `font-variant-numeric: tabular-nums`.
- Tests: compare against `formatMoney(...)`. `Intl` inserts a non-breaking space after `SGD`.
- Exact strings are in `brief/candidate-brief.md` §4. Key ones:
  - Send error: `Something went wrong. Your money hasn't left your account. Try again.`
  - Success: `Transfer sent` / `The money should arrive within minutes.` / `Back to dashboard`
  - Discard (optional): `Discard this transfer?` / `Keep editing` / `Discard`

## Layout
- Desktop: max 1200 px, 24 px margins, main column plus a 300 px right rail (daily limit).
- Mobile: 16 px margins, single column. Must work down to 360 px.
- Breakpoints: 640 px and 1024 px. 8 px spacing scale. System font.
- No component library for a full dashboard. A library for basic pieces (dialog, select) is fine. Icons: `lucide-react` or inline SVG.

## API cheat sheet
| Endpoint | Notes |
| --- | --- |
| `GET /api/customer` | `segment` default, `dailyTransferLimit`, `transferredToday`. Remaining = limit - transferred. |
| `GET /api/accounts` | 3 accounts. Total available = non-credit sum. |
| `GET /api/transactions?limit=8&q=` | Newest first. `amount` is always positive. `direction` gives the sign. |
| `GET /api/payees` | 4 payees, masked numbers only. |
| `POST /api/transfers` | Send **either** `payeeId` **or** `recipient`, not both. Returns 201 with `transfer`, `account` and `dailyLimit`. |

Errors: 400 `VALIDATION_ERROR` (with `fields`), 422 `INSUFFICIENT_FUNDS` / `DAILY_LIMIT_EXCEEDED`, 500 `INTERNAL_ERROR` (a note containing `#fail` forces this).

Demo hooks (not for app logic): `?scenario=error`, `?scenario=empty`, `?delay=1500`, note `#fail`.

## How they assess
1. They open the deployed app and run the flows.
2. They read your code and README: structure, decisions, whether tests check behaviour.
3. **45-minute call**: you walk through the structure and 2-3 decisions, trace one flow (e.g. `Confirm transfer` until the balance updates), and make **1-2 small live changes without AI** (e.g. add a validation rule, show one more field).

> They are not checking whether code is AI-generated. They are checking that **you understand all of it**. A smaller app you understand beats a bigger one you can't explain.

## Submission
1. Deploy (settings in `DEPLOYMENT.md`; check `dist/mockServiceWorker.js` exists).
2. Replace `README.md` with yours, using their outline: structure, decisions/trade-offs, loading/empty/error states (and how to see them), tests, **AI use** (tools, plus 2-3 places you changed or rejected AI output), not done / known issues.
3. Reply to the invitation email with the repo URL (public) and the deployed URL.
