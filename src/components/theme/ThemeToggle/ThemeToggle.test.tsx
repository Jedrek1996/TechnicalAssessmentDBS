import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { THEME_KEY } from '../../../constants/theme'
import { ThemeToggle } from './ThemeToggle'

const html = document.documentElement

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    html.dataset.theme = 'light'
  })

  it('toggles dark mode, updates <html>, and remembers it', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)
    const toggle = screen.getByRole('button', { name: 'Dark mode' })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await user.click(toggle)
    expect(html.dataset.theme).toBe('dark')
    expect(toggle).toHaveAttribute('aria-pressed', 'true')
    expect(localStorage.getItem(THEME_KEY)).toBe('dark')

    await user.click(toggle)
    expect(html.dataset.theme).toBe('light')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem(THEME_KEY)).toBe('light')
  })

  it('picks up the theme the pre-paint script already set', () => {
    html.dataset.theme = 'dark'
    render(<ThemeToggle />)
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('still switches when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole('button', { name: 'Dark mode' }))
    expect(html.dataset.theme).toBe('dark')
  })
})
