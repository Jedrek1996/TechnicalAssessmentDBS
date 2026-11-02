import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Stepper } from './Stepper'

describe('Stepper', () => {
  it('lists Recipient, Amount and Review and marks the current step', () => {
    render(<Stepper step="amount" />)

    const items = within(screen.getByRole('list', { name: 'Transfer progress' })).getAllByRole('listitem')

    expect(items.map((item) => item.textContent)).toEqual(['1Recipient', '2Amount', '3Review'])
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[0]).not.toHaveAttribute('aria-current')
  })
})
