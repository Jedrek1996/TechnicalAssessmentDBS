import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Greeting } from './Greeting'

describe('Greeting', () => {
  it('says good evening to the customer, worded as the brief says', () => {
    render(<Greeting firstName="Ava" today={new Date('2026-10-20T10:15:00+08:00')} />)

    expect(screen.getByRole('heading', { name: 'Good evening, Ava' })).toBeVisible()
  })

  it('shows today\'s date under it', () => {
    render(<Greeting firstName="Ava" today={new Date('2026-10-20T10:15:00+08:00')} />)

    expect(screen.getByText(/Tuesday,? 20 October/)).toBeVisible()
  })
})
