import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TransactionIcon } from './TransactionIcon'

const CATEGORIES = [
  'groceries',
  'transport',
  'dining',
  'subscriptions',
  'transfer',
  'income',
  'bills',
  'shopping',
]

const drawing = (category: string) =>
  render(<TransactionIcon category={category} direction="out" />).container.querySelector('svg')?.innerHTML

describe('TransactionIcon', () => {
  it('draws a different picture for each category in the data', () => {
    expect(new Set(CATEGORIES.map(drawing)).size).toBe(CATEGORIES.length)
  })

  it('still draws something for a category it has no picture for', () => {
    const unknown = drawing('something-new')

    expect(unknown).toBeTruthy()
    expect(CATEGORIES.map(drawing)).not.toContain(unknown)
  })

  it('is decorative, hidden from screen readers', () => {
    const { container } = render(<TransactionIcon category="dining" direction="in" />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
