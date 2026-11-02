import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { moneyText } from '../../../../test/money'
import { BalanceHero } from './BalanceHero'

describe('BalanceHero', () => {
  it('shows the total and how many deposit accounts it covers', () => {
    render(<BalanceHero total={17120.55} depositCount={2} onNewTransfer={vi.fn()} />)

    expect(screen.getByText(moneyText(17120.55))).toBeVisible()
    expect(screen.getByText('Across 2 deposit accounts')).toBeVisible()
  })

  it('uses the singular for one account', () => {
    render(<BalanceHero total={100} depositCount={1} onNewTransfer={vi.fn()} />)

    expect(screen.getByText('Across 1 deposit account')).toBeVisible()
  })

  it('has a New transfer button that calls onNewTransfer', async () => {
    const onNewTransfer = vi.fn()
    render(<BalanceHero total={100} depositCount={1} onNewTransfer={onNewTransfer} />)

    await userEvent.click(screen.getByRole('button', { name: 'New transfer' }))

    expect(onNewTransfer).toHaveBeenCalledOnce()
  })
})
