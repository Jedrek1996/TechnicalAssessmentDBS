import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Account } from '../../../../api/types'
import { AccountList } from './AccountList'

const accounts: Account[] = [
  { id: 'a1', name: 'Everyday Checking', type: 'checking', maskedNumber: '•••• 4821', balance: 100, currency: 'SGD' },
  { id: 'a2', name: 'Savings Plus', type: 'savings', maskedNumber: '•••• 9930', balance: 200, currency: 'SGD' },
  { id: 'a3', name: 'Rewards Card', type: 'credit', maskedNumber: '•••• 7712', balance: -50, currency: 'SGD' },
]

describe('AccountList', () => {
  it('shows a card for every account', () => {
    render(<AccountList accounts={accounts} />)

    expect(screen.getAllByRole('article')).toHaveLength(3)
  })

  it('collapses to a summary of how many accounts there are and their names', async () => {
    const user = userEvent.setup()
    render(<AccountList accounts={accounts} />)

    await user.click(screen.getByRole('button', { name: 'Collapse accounts' }))

    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    expect(screen.getByText('3 accounts')).toBeVisible()
    expect(screen.getByText('Everyday Checking, Savings Plus, Rewards Card')).toBeVisible()
  })
})
