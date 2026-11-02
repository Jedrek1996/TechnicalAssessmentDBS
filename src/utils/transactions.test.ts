import { describe, expect, it } from 'vitest'
import type { Transaction } from '../api/types'
import { formatMoney } from '../lib/format'
import { filterTransactions, formatSignedAmount } from './transactions'

const transaction = (overrides: Partial<Transaction>): Transaction => ({
  id: 'txn_1',
  accountId: 'acc_checking',
  date: '2026-10-19T18:42:00+08:00',
  description: 'FairPrice Finest',
  category: 'groceries',
  direction: 'out',
  amount: 86.4,
  status: 'posted',
  ...overrides,
})

const all = [
  transaction({ id: '1', description: 'FairPrice Finest', category: 'groceries' }),
  transaction({ id: '2', description: 'Grab', category: 'transport' }),
  transaction({ id: '3', description: 'Kopitiam Corner', category: 'dining' }),
]

describe('filterTransactions', () => {
  it('matches the description, ignoring case', () => {
    expect(filterTransactions(all, 'GRAB').map((t) => t.id)).toEqual(['2'])
  })

  it('matches the category too', () => {
    expect(filterTransactions(all, 'dining').map((t) => t.id)).toEqual(['3'])
  })

  it('ignores spaces around the search', () => {
    expect(filterTransactions(all, '  grab  ').map((t) => t.id)).toEqual(['2'])
  })

  it('returns everything for an empty search', () => {
    expect(filterTransactions(all, '')).toEqual(all)
    expect(filterTransactions(all, '   ')).toEqual(all)
  })

  it('returns nothing when nothing matches', () => {
    expect(filterTransactions(all, 'zzz')).toEqual([])
  })

  it('does not match across the end of the description and the start of the category', () => {
    // "FairPrice Finest groceries" would contain "t gro" if the two were joined.
    expect(filterTransactions(all, 't gro')).toEqual([])
  })
})

describe('formatSignedAmount', () => {
  it('puts a plus on money in', () => {
    expect(formatSignedAmount(transaction({ direction: 'in', amount: 45 }))).toBe(
      `+${formatMoney(45)}`,
    )
  })

  it('makes money out negative', () => {
    expect(formatSignedAmount(transaction({ direction: 'out', amount: 86.4 }))).toBe(
      formatMoney(-86.4),
    )
  })
})
