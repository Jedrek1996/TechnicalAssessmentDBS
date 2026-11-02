import type { ReactNode } from 'react'
import type { TransactionDirection } from '../../../../api/types'
import styles from '../../../../styles/components/dashboard/transactions/TransactionIcon.module.css'

const ICONS: Record<string, ReactNode> = {
  groceries: (
    <>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.6 11.4a1.5 1.5 0 0 0 1.5 1.1h8.6a1.5 1.5 0 0 0 1.5-1.1L21 7H6" />
    </>
  ),
  transport: (
    <>
      <rect x="4" y="3" width="16" height="14" rx="3" />
      <path d="M4 11h16" />
      <circle cx="8" cy="20" r="1.5" />
      <circle cx="16" cy="20" r="1.5" />
    </>
  ),
  dining: (
    <>
      <path d="M5 3v7a2 2 0 0 0 2 2 2 2 0 0 0 2-2V3" />
      <path d="M7 3v18" />
      <path d="M17 21V3c-2.5 1.5-3.5 4-3.5 7 0 1.7 1 3 3.5 3" />
    </>
  ),
  subscriptions: (
    <>
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </>
  ),
  transfer: (
    <>
      <path d="m16 3 4 4-4 4" />
      <path d="M20 7H4" />
      <path d="m8 21-4-4 4-4" />
      <path d="M4 17h16" />
    </>
  ),
  income: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </>
  ),
  bills: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  shopping: (
    <>
      <path d="M6 8h12l1 13H5z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
}

// Any category we don't have a picture for still gets a neutral mark.
const FALLBACK = <circle cx="12" cy="12" r="3" />

interface TransactionIconProps {
  category: string
  direction: TransactionDirection
}

// Decorative: the row already says the category in words.
export function TransactionIcon({ category, direction }: TransactionIconProps) {
  return (
    <span className={direction === 'in' ? styles.in : styles.out} aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {ICONS[category] ?? FALLBACK}
      </svg>
    </span>
  )
}
