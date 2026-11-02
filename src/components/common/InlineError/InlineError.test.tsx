import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { InlineError } from './InlineError'

describe('InlineError', () => {
  it('announces the message and calls onRetry when Retry is pressed', async () => {
    const onRetry = vi.fn()
    render(<InlineError message="Something broke." onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Something broke.')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
