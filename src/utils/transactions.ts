import type { Transaction } from '../api/types'
import { formatMoney } from '../lib/format'

export function filterTransactions(
  transactions: Transaction[],
  query: string,
): Transaction[] {
  const term = query.trim().toLowerCase()
  if (!term) return transactions

  return transactions.filter(
    ({ description, category }) =>
      description.toLowerCase().includes(term) ||
      category.toLowerCase().includes(term),
  )
}

/** Money in gets a `+`; money out is negative: `+SGD 45.00`, `-SGD 86.40`. */
export function formatSignedAmount({ direction, amount }: Transaction): string {
  return direction === 'in' ? `+${formatMoney(amount)}` : formatMoney(-amount)
}
