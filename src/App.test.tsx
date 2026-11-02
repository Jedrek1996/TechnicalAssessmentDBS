import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { renderWithClient } from './test/render'

describe('App', () => {
  it('greets the signed-in customer and shows their initials', async () => {
    renderWithClient(<App />)

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Good evening, Ava' },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Signed in as AC' })).toBeVisible()
  })
})
