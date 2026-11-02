import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Transaction } from '../../../../api/types'
import { TransactionList } from './TransactionList'

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

const transactions = [
  transaction({ id: '1', description: 'FairPrice Finest', category: 'groceries' }),
  transaction({ id: '2', description: 'Grab', category: 'transport', status: 'pending' }),
  transaction({ id: '3', description: 'Kopitiam Corner', category: 'dining' }),
]

const rows = () => screen.getAllByRole('listitem')
const searchBox = () => screen.getByRole('searchbox', { name: 'Search transactions' })

describe('TransactionList', () => {
  it('lists every transaction under a Recent transactions heading', () => {
    render(<TransactionList transactions={transactions} />)

    expect(
      screen.getByRole('heading', { name: 'Recent transactions' }),
    ).toBeVisible()
    expect(rows()).toHaveLength(3)
  })

  it('filters by description, ignoring case, and says how many match', async () => {
    const user = userEvent.setup()
    render(<TransactionList transactions={transactions} />)

    await user.type(searchBox(), 'GRAB')

    expect(rows()).toHaveLength(1)
    expect(within(rows()[0]).getByText('Grab')).toBeVisible()
    expect(screen.getByText('1 result')).toBeVisible()
  })

  it('filters by category', async () => {
    const user = userEvent.setup()
    render(<TransactionList transactions={transactions} />)

    await user.type(searchBox(), 'dining')

    expect(rows()).toHaveLength(1)
    expect(within(rows()[0]).getByText('Kopitiam Corner')).toBeVisible()
  })

  it('clears the search with the clear button', async () => {
    const user = userEvent.setup()
    render(<TransactionList transactions={transactions} />)

    await user.type(searchBox(), 'grab')
    await user.click(screen.getByRole('button', { name: 'Clear text' }))

    expect(searchBox()).toHaveValue('')
    expect(rows()).toHaveLength(3)
    expect(screen.queryByRole('button', { name: 'Clear text' })).not.toBeInTheDocument()
  })

  it('shows a message when nothing matches, and Clear search brings everything back', async () => {
    const user = userEvent.setup()
    render(<TransactionList transactions={transactions} />)

    await user.type(searchBox(), 'zzz')

    expect(screen.getByText('No transactions match your search.')).toBeVisible()
    expect(screen.getByText('0 results')).toBeVisible()
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(rows()).toHaveLength(3)
    expect(searchBox()).toHaveValue('')
    expect(searchBox()).toHaveFocus()
  })

  it('collapses to a summary with the latest transaction, and keeps the search when expanded again', async () => {
    const user = userEvent.setup()
    render(<TransactionList transactions={transactions} />)
    await user.type(searchBox(), 'grab')

    await user.click(screen.getByRole('button', { name: 'Collapse recent transactions' }))

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument()
    expect(screen.getByText('3 transactions')).toBeVisible()
    expect(screen.getByText(/Latest: FairPrice Finest/)).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Expand recent transactions' }))

    expect(searchBox()).toHaveValue('grab')
    expect(rows()).toHaveLength(1)
  })

  it('says so when there are no transactions at all', () => {
    render(<TransactionList transactions={[]} />)

    expect(screen.getByText('No transactions yet.')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument()
  })
})
