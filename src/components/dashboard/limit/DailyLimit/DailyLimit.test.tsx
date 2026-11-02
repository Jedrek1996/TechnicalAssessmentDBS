import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { moneyText } from '../../../../test/money'
import { DailyLimit } from './DailyLimit'

describe('DailyLimit', () => {
  it('shows the whole limit as remaining when nothing has been sent today', () => {
    render(<DailyLimit limit={5000} used={0} />)

    expect(screen.getByText(`${moneyText(5000)} remaining today`)).toBeVisible()
    expect(screen.getByText('Resets daily. Applies to all transfers.')).toBeVisible()
    expect(screen.getByText('0% used')).toBeVisible()
    expect(screen.getByRole('progressbar', { name: 'Daily limit used' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
  })

  it('subtracts what has been sent and shows the used share', () => {
    render(<DailyLimit limit={5000} used={1250} />)

    expect(screen.getByText(`${moneyText(3750)} remaining today`)).toBeVisible()
    expect(screen.getByText('25% used')).toBeVisible()
    const bar = screen.getByRole('progressbar', { name: 'Daily limit used' })
    expect(bar).toHaveAttribute('aria-valuenow', '1250')
    expect(bar).toHaveAttribute('aria-valuemax', '5000')
  })
})
