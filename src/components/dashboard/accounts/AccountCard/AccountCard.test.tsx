import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Account } from '../../../../api/types'
import { moneyText } from '../../../../test/money'
import { AccountCard } from './AccountCard'

const checking: Account = {
  id: 'acc_checking',
  name: 'Everyday Checking',
  type: 'checking',
  maskedNumber: '•••• 4821',
  balance: 4280.55,
  currency: 'SGD',
}

const credit: Account = {
  id: 'acc_credit',
  name: 'Rewards Card',
  type: 'credit',
  maskedNumber: '•••• 7712',
  balance: -420.3,
  currency: 'SGD',
}

describe('AccountCard', () => {
  it('shows the name, masked number and balance', () => {
    render(<AccountCard account={checking} />)

    expect(screen.getByRole('heading', { name: 'Everyday Checking' })).toBeVisible()
    expect(screen.getByText('•••• 4821')).toBeVisible()
    expect(screen.getByText(moneyText(4280.55))).toBeVisible()
    expect(screen.getByText('Available balance')).toBeVisible()
    expect(screen.queryByText('Amount due')).not.toBeInTheDocument()
  })

  it('shows what is owed on the credit card', () => {
    render(<AccountCard account={credit} />)

    expect(screen.getByText(moneyText(-420.3))).toBeVisible()
    expect(screen.getByText('Amount due')).toBeVisible()
    expect(screen.queryByText('Available balance')).not.toBeInTheDocument()
  })
})
