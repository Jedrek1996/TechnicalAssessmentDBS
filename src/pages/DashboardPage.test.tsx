import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderWithClient } from '../test/render'
import { server } from '../test/setup'
import { DashboardPage } from './DashboardPage'

const SLOW_API = { timeout: 3000 } // the mock API answers after about 500 ms

describe('DashboardPage', () => {
  it('shows a loading placeholder, then the dashboard', async () => {
    renderWithClient(<DashboardPage />)

    expect(screen.getByRole('status', { name: 'Loading your dashboard' })).toBeVisible()
    expect(
      await screen.findByRole('heading', { name: 'Good evening, Ava' }, SLOW_API),
    ).toBeVisible()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows an error when loading fails, and Retry loads the dashboard', async () => {
    server.use(
      http.get('*/api/accounts', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
          { status: 500 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderWithClient(<DashboardPage />)

    expect(
      await screen.findByText("We couldn't load your dashboard.", {}, SLOW_API),
    ).toBeVisible()

    // The API is back: drop the failing override and press Retry.
    server.resetHandlers()
    await user.click(screen.getByRole('button', { name: 'Retry' }))

    expect(
      await screen.findByRole('heading', { name: 'Good evening, Ava' }, SLOW_API),
    ).toBeVisible()
    expect(
      screen.queryByText("We couldn't load your dashboard."),
    ).not.toBeInTheDocument()
  })
})
