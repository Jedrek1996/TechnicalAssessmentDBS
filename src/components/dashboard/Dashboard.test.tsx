import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Account, Customer, Transaction } from '../../api/types'
import { moneyText } from '../../test/money'
import { Dashboard } from './Dashboard'

const customer: Customer = {
  id: 'cus_001',
  firstName: 'Ava',
  lastName: 'Chen',
  email: 'ava.chen@example.com',
  segment: 'retail',
  dailyTransferLimit: 5000,
  transferredToday: 0,
}

const accounts: Account[] = [
  { id: 'a1', name: 'Everyday Checking', type: 'checking', maskedNumber: '•••• 4821', balance: 100.5, currency: 'SGD' },
  { id: 'a2', name: 'Savings Plus', type: 'savings', maskedNumber: '•••• 9930', balance: 200, currency: 'SGD' },
  { id: 'a3', name: 'Rewards Card', type: 'credit', maskedNumber: '•••• 7712', balance: -50, currency: 'SGD' },
]

const transactions: Transaction[] = [
  {
    id: 't1',
    accountId: 'a1',
    date: '2026-10-19T18:42:00+08:00',
    description: 'FairPrice Finest',
    category: 'groceries',
    direction: 'out',
    amount: 86.4,
    status: 'posted',
  },
]

describe('Dashboard', () => {
  it('lays out the greeting, total, accounts and transactions from the data it is given', () => {
    render(
      <Dashboard
        customer={customer}
        accounts={accounts}
        transactions={transactions}
        onNewTransfer={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Good evening, Ava' })).toBeVisible()
    expect(screen.getByText(moneyText(300.5))).toBeVisible()
    expect(screen.getByRole('region', { name: 'Accounts' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Recent transactions' })).toBeVisible()
    expect(screen.getByText('FairPrice Finest')).toBeVisible()
    expect(screen.getByRole('region', { name: 'Daily limit' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'New transfer' })).toBeVisible()
  })
})
