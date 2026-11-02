import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AccountType } from '../../../../api/types'
import { AccountIcon } from './AccountIcon'

const types: AccountType[] = ['checking', 'savings', 'credit']

describe('AccountIcon', () => {
  it('draws a different icon for each account type', () => {
    const drawings = types.map(
      (type) => render(<AccountIcon type={type} />).container.querySelector('svg')?.innerHTML,
    )

    expect(new Set(drawings).size).toBe(3)
  })

  it('is decorative, hidden from screen readers', () => {
    const { container } = render(<AccountIcon type="savings" />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
