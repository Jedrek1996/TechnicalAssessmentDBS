import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('shows the brand, the theme controls and the avatar', () => {
    render(<Header initials="AC" />)

    expect(screen.getByRole('img', { name: 'Meridian' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dark mode' })).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: 'Customer segment' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Signed in as AC' })).toHaveTextContent(
      'AC',
    )
  })

  it('marks Overview as current and shows the other pages disabled', () => {
    render(<Header initials="AC" />)

    expect(screen.getByText('Overview')).toHaveAttribute('aria-current', 'page')
    // The nav is display:none below 1024px and jsdom has no media queries, so
    // it counts as hidden here.
    for (const name of ['Cards', 'Payments', 'Insights']) {
      expect(screen.getByRole('button', { name, hidden: true })).toBeDisabled()
    }
  })
})
