import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { CollapsibleSection } from './CollapsibleSection'

const renderSection = () =>
  render(
    <CollapsibleSection
      title="Accounts"
      summary={<p>3 accounts</p>}
      action={<input aria-label="Search" />}
    >
      <p>Full content</p>
    </CollapsibleSection>,
  )

describe('CollapsibleSection', () => {
  it('starts expanded, showing the content and the header action', () => {
    renderSection()

    expect(screen.getByRole('button', { name: 'Collapse accounts' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByText('Full content')).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeVisible()
    expect(screen.queryByText('3 accounts')).not.toBeInTheDocument()
  })

  it('collapses to the summary and expands back', async () => {
    const user = userEvent.setup()
    renderSection()

    await user.click(screen.getByRole('button', { name: 'Collapse accounts' }))

    expect(screen.getByRole('button', { name: 'Expand accounts' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByText('3 accounts')).toBeVisible()
    expect(screen.queryByText('Full content')).not.toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Search' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expand accounts' }))

    expect(screen.getByText('Full content')).toBeVisible()
    expect(screen.queryByText('3 accounts')).not.toBeInTheDocument()
  })

  it('works from the keyboard', async () => {
    const user = userEvent.setup()
    renderSection()

    await user.tab()
    expect(screen.getByRole('button', { name: 'Collapse accounts' })).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByText('3 accounts')).toBeVisible()
  })
})
