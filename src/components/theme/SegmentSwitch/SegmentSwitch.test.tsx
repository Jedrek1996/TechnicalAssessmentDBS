import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { SEGMENT_KEY } from '../../../constants/theme'
import { SegmentSwitch } from './SegmentSwitch'

const html = document.documentElement

describe('SegmentSwitch', () => {
  beforeEach(() => {
    localStorage.clear()
    html.dataset.theme = 'light'
    html.dataset.segment = 'retail'
  })

  it('switches segment without touching the theme, and remembers it', async () => {
    const user = userEvent.setup()
    render(<SegmentSwitch />)
    const retail = screen.getByRole('button', { name: 'Retail' })
    const premium = screen.getByRole('button', { name: 'Premium' })
    expect(retail).toHaveAttribute('aria-pressed', 'true')
    expect(premium).toHaveAttribute('aria-pressed', 'false')

    await user.click(premium)
    expect(html.dataset.segment).toBe('premium')
    expect(html.dataset.theme).toBe('light')
    expect(premium).toHaveAttribute('aria-pressed', 'true')
    expect(retail).toHaveAttribute('aria-pressed', 'false')
    expect(localStorage.getItem(SEGMENT_KEY)).toBe('premium')
  })

  it('picks up the segment the pre-paint script already set', () => {
    html.dataset.segment = 'premium'
    render(<SegmentSwitch />)
    expect(screen.getByRole('button', { name: 'Premium' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})
