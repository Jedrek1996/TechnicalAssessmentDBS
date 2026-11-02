import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Transaction } from '../../../../api/types'
import { formatMoney } from '../../../../lib/format'
import { moneyText } from '../../../../test/money'
import { TransactionRow } from './TransactionRow'

const grab: Transaction = {
  id: 'txn_2002',
  accountId: 'acc_credit',
  date: '2026-10-19T12:10:00+08:00',
  description: 'Grab',
  category: 'transport',
  direction: 'out',
  amount: 14.2,
  status: 'pending',
}

const renderRow = (transaction: Transaction) =>
  render(
    <ul>
      <TransactionRow transaction={transaction} />
    </ul>,
  )

describe('TransactionRow', () => {
  it('shows the description, category, date and a negative amount for money out', () => {
    renderRow(grab)

    expect(screen.getByText('Grab')).toBeVisible()
    expect(screen.getByText('transport · 19 Oct')).toBeVisible()
    expect(screen.getByText(moneyText(-14.2))).toBeVisible()
  })

  it('puts a plus on money in', () => {
    renderRow({ ...grab, direction: 'in', amount: 45, status: 'posted' })

    expect(screen.getByText(`+${formatMoney(45)}`.replace(/\s/g, ' '))).toBeVisible()
  })

  it('shows a Pending chip only for pending transactions', () => {
    const { unmount } = renderRow(grab)
    expect(screen.getByText('Pending')).toBeVisible()
    unmount()

    renderRow({ ...grab, status: 'posted' })
    expect(screen.queryByText('Pending')).not.toBeInTheDocument()
  })
})
