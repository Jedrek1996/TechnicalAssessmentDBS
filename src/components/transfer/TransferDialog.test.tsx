import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { SEND_ERROR_MESSAGE } from '../../constants/transfer'
import { DashboardPage } from '../../pages/DashboardPage'
import { renderWithClient } from '../../test/render'
import { moneyText } from '../../test/money'
import { server } from '../../test/setup'

type User = ReturnType<typeof userEvent.setup>

// The mock API answers after about 500 ms, and these flows make several requests.
const SLOW = { timeout: 5000 }

async function openDialog(user: User) {
  renderWithClient(<DashboardPage />)
  await user.click(await screen.findByRole('button', { name: 'New transfer' }, SLOW))
  return screen.findByRole('dialog', { name: 'New transfer' })
}

const choosePayee = async (user: User, name: string) =>
  user.click(await screen.findByRole('radio', { name: new RegExp(name) }, SLOW))

const cont = (user: User) => user.click(screen.getByRole('button', { name: 'Continue' }))

async function toAmountStep(user: User) {
  await openDialog(user)
  await choosePayee(user, 'Jamie Tan')
  await cont(user)
  await screen.findByRole('heading', { name: 'How much?' })
}

async function toReviewStep(user: User, amount = '120', note = '') {
  await toAmountStep(user)
  await user.type(screen.getByLabelText('Amount'), amount)
  if (note) await user.type(screen.getByLabelText('Note (optional)'), note)
  await cont(user)
  await screen.findByRole('heading', { name: 'Check the details' })
}

const posts: Request[] = []
server.events.on('request:start', ({ request }) => {
  if (request.method === 'POST') posts.push(request.clone())
})
afterEach(() => {
  posts.length = 0
})

describe('Transfer dialog', { timeout: 20000 }, () => {
  describe('opening and closing', () => {
    it('opens, moves focus to the first step, and returns focus to the button on Esc', async () => {
      const user = userEvent.setup()
      const dialog = await openDialog(user)

      const heading = within(dialog).getByRole('heading', { name: 'Who are you sending to?' })
      await waitFor(() => expect(heading).toHaveFocus())
      expect(within(dialog).getByRole('list', { name: 'Transfer progress' })).toBeVisible()

      await user.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
      expect(screen.getByRole('button', { name: 'New transfer' })).toHaveFocus()
    })

    it('closes with the close button, and Cancel on the first step', async () => {
      const user = userEvent.setup()
      await openDialog(user)

      await user.click(screen.getByRole('button', { name: 'Close' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: 'New transfer' }))
      await user.click(await screen.findByRole('button', { name: 'Cancel' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    })

    it('starts from scratch each time it opens', async () => {
      const user = userEvent.setup()
      await openDialog(user)
      await choosePayee(user, 'Jamie Tan')
      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: 'New transfer' }))

      expect(await screen.findByRole('radio', { name: /Jamie Tan/ }, SLOW)).not.toBeChecked()
    })
  })

  describe('step 1: recipient', () => {
    it('lists the saved payees and the option to send to someone new', async () => {
      const user = userEvent.setup()
      await openDialog(user)

      const group = await screen.findByRole('radiogroup', { name: 'Who are you sending to?' })
      await within(group).findByRole('radio', { name: /Jamie Tan/ }, SLOW)

      expect(within(group).getAllByRole('radio')).toHaveLength(5)
      expect(within(group).getByRole('radio', { name: /Send to someone new/ })).toBeInTheDocument()
      expect(within(group).getByText('DBS · •••• 3391')).toBeVisible()
    })

    it('filters the payees by name, and says when nothing matches', async () => {
      const user = userEvent.setup()
      await openDialog(user)
      await screen.findByRole('radio', { name: /Jamie Tan/ }, SLOW)

      await user.type(screen.getByRole('searchbox', { name: 'Search payees' }), 'marcus')
      expect(screen.queryByRole('radio', { name: /Jamie Tan/ })).not.toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /Marcus Lee/ })).toBeInTheDocument()

      await user.clear(screen.getByRole('searchbox', { name: 'Search payees' }))
      await user.type(screen.getByRole('searchbox', { name: 'Search payees' }), 'zzz')
      expect(screen.getByText('No payees match your search.')).toBeVisible()
      expect(screen.getByRole('radio', { name: /Send to someone new/ })).toBeInTheDocument()
    })

    it('keeps the chosen payee in view when a later search no longer matches them', async () => {
      const user = userEvent.setup()
      await openDialog(user)
      await choosePayee(user, 'Jamie Tan')

      await user.type(screen.getByRole('searchbox', { name: 'Search payees' }), 'zzz')

      expect(screen.getByRole('radio', { name: /Jamie Tan/ })).toBeChecked()
      // It is labelled, so it doesn't look like a stray search result.
      expect(screen.getByText('Selected')).toBeVisible()
      expect(screen.getByText('Search results')).toBeVisible()
      expect(screen.getByText('No payees match your search.')).toBeVisible()
      expect(screen.getByRole('button', { name: 'Continue' })).toHaveAttribute('aria-disabled', 'false')

      // Searching for someone else shows them too, and the choice stays on top.
      await user.clear(screen.getByRole('searchbox', { name: 'Search payees' }))
      await user.type(screen.getByRole('searchbox', { name: 'Search payees' }), 'marcus')
      const names = screen.getAllByRole('radio').map((radio) => radio.closest('label')?.textContent)
      expect(names[0]).toContain('Jamie Tan')
      expect(names[1]).toContain('Marcus Lee')

      // Once the search matches them again there is nothing to explain, so the labels go.
      await user.clear(screen.getByRole('searchbox', { name: 'Search payees' }))
      expect(screen.queryByText('Selected')).not.toBeInTheDocument()
      expect(screen.queryByText('Search results')).not.toBeInTheDocument()
      expect(screen.getByRole('radio', { name: /Jamie Tan/ })).toBeChecked()
    })

    it('can be operated from the keyboard', async () => {
      const user = userEvent.setup()
      await openDialog(user)
      const first = await screen.findByRole('radio', { name: /Jamie Tan/ }, SLOW)

      first.focus()
      await user.keyboard('{ArrowDown}')

      expect(screen.getByRole('radio', { name: /Marcus Lee/ })).toBeChecked()
    })

    it('needs someone chosen before continuing', async () => {
      const user = userEvent.setup()
      await openDialog(user)
      await screen.findByRole('radio', { name: /Jamie Tan/ }, SLOW)

      await cont(user)

      expect(screen.getByText("Choose who you're sending to.")).toBeVisible()
      expect(screen.getByRole('heading', { name: 'Who are you sending to?' })).toBeVisible()
      expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription("Choose who you're sending to.")
    })

    it('shows our message, not a library one, after tabbing through the payees without choosing', async () => {
      const user = userEvent.setup()
      await openDialog(user)
      const first = await screen.findByRole('radio', { name: /Jamie Tan/ }, SLOW)

      // Focusing a radio and leaving it with none checked is what makes the form hold null.
      first.focus()
      first.blur()
      await cont(user)

      expect(screen.getByText("Choose who you're sending to.")).toBeVisible()
      expect(screen.queryByText(/Invalid input/)).not.toBeInTheDocument()
    })

    it('checks the details of someone new, shows each error, and focuses the first invalid field', async () => {
      const user = userEvent.setup()
      await openDialog(user)
      await user.click(await screen.findByRole('radio', { name: /Send to someone new/ }, SLOW))
      await user.type(screen.getByLabelText('Account number'), '123')

      await cont(user)

      expect(screen.getByText('Enter a name between 2 and 50 characters.')).toBeVisible()
      expect(screen.getByText('Enter a valid 8-digit account number.')).toBeVisible()
      expect(screen.getByText('Choose a bank.')).toBeVisible()
      expect(screen.getByLabelText('Recipient name')).toHaveFocus()
      expect(screen.getByLabelText('Account number')).toHaveAccessibleDescription(
        'Enter a valid 8-digit account number.',
      )
    })

    it('checks a field when you leave it, and clears the error once you fix it', async () => {
      const user = userEvent.setup()
      await openDialog(user)
      await user.click(await screen.findByRole('radio', { name: /Send to someone new/ }, SLOW))

      await user.type(screen.getByLabelText('Account number'), '123')
      await user.tab()
      expect(screen.getByText('Enter a valid 8-digit account number.')).toBeVisible()

      await user.type(screen.getByLabelText('Account number'), '45678')
      await waitFor(() =>
        expect(screen.queryByText('Enter a valid 8-digit account number.')).not.toBeInTheDocument(),
      )
    })
  })

  describe('step 2: amount', () => {
    it('shows the available balance and the remaining daily limit', async () => {
      const user = userEvent.setup()
      await toAmountStep(user)

      expect(screen.getByText(`Available ${moneyText(4280.55)}`)).toBeVisible()
      expect(screen.getByText(`Remaining daily limit ${moneyText(5000)}`)).toBeVisible()
    })

    it('only offers the deposit accounts, not the credit card', async () => {
      const user = userEvent.setup()
      await toAmountStep(user)

      const options = within(screen.getByLabelText('From account')).getAllByRole('option')

      expect(options.map((option) => option.textContent)).toEqual([
        'Everyday Checking · •••• 4821',
        'Savings Plus · •••• 9930',
      ])
      expect(screen.getByText('Deposit accounts only')).toBeVisible()
    })

    it('fills in an amount from the quick buttons', async () => {
      const user = userEvent.setup()
      await toAmountStep(user)

      await user.click(screen.getByRole('button', { name: '250' }))

      expect(screen.getByLabelText('Amount')).toHaveValue('250')
    })

    it('counts the characters in the note', async () => {
      const user = userEvent.setup()
      await toAmountStep(user)
      expect(screen.getByText('0/50')).toBeVisible()

      await user.type(screen.getByLabelText('Note (optional)'), 'Dinner')

      expect(screen.getByText('6/50')).toBeVisible()
    })

    // Required test 1
    it('shows an error and sends no request when the amount is more than the balance', async () => {
      const user = userEvent.setup()
      await toAmountStep(user)

      await user.type(screen.getByLabelText('Amount'), '4280.56')
      await cont(user)

      expect(
        screen.getByText(`Amount can't be more than your available balance (${moneyText(4280.55)}).`),
      ).toBeVisible()
      expect(screen.getByRole('heading', { name: 'How much?' })).toBeVisible()
      expect(screen.getByLabelText('Amount')).toHaveFocus()
      expect(posts).toHaveLength(0)
    })

    it('shows the daily limit message, using the real remaining limit', async () => {
      const user = userEvent.setup()
      await toAmountStep(user)

      await user.selectOptions(screen.getByLabelText('From account'), 'acc_savings')
      await user.type(screen.getByLabelText('Amount'), '5000.01')
      await cont(user)

      expect(
        screen.getByText(`This transfer exceeds your remaining daily limit (${moneyText(5000)}).`),
      ).toBeVisible()
      expect(posts).toHaveLength(0)
    })

    it('rejects an amount with too many decimals or under SGD 1.00', async () => {
      const user = userEvent.setup()
      await toAmountStep(user)

      await user.type(screen.getByLabelText('Amount'), '12.345')
      await cont(user)
      expect(screen.getByText('Use at most 2 decimal places.')).toBeVisible()

      await user.clear(screen.getByLabelText('Amount'))
      await user.type(screen.getByLabelText('Amount'), '0.5')
      await cont(user)
      expect(screen.getByText('Amount must be at least SGD 1.00.')).toBeVisible()
    })

    it('rejects a note over 50 characters', async () => {
      const user = userEvent.setup()
      await toAmountStep(user)

      await user.type(screen.getByLabelText('Amount'), '10')
      await user.type(screen.getByLabelText('Note (optional)'), 'x'.repeat(51))
      await cont(user)

      expect(screen.getByText('Note can be at most 50 characters.')).toBeVisible()
      expect(screen.getByLabelText('Note (optional)')).toHaveFocus()
    })
  })

  describe('step 3: review', () => {
    it('shows every detail and the total', async () => {
      const user = userEvent.setup()
      await toReviewStep(user, '120', 'Dinner')

      const summary = screen.getByRole('dialog')
      expect(within(summary).getByText('Everyday Checking · •••• 4821')).toBeVisible()
      expect(within(summary).getByText('Jamie Tan · DBS · •••• 3391')).toBeVisible()
      expect(within(summary).getAllByText(moneyText(120))).toHaveLength(2) // amount and total
      expect(within(summary).getByText(moneyText(0))).toBeVisible() // fee
      expect(within(summary).getByText('Dinner')).toBeVisible()
      expect(within(summary).getByText('Usually arrives in minutes.')).toBeVisible()
      expect(posts).toHaveLength(0)
    })

    it('keeps everything that was entered when you go back', async () => {
      const user = userEvent.setup()
      await toReviewStep(user, '120', 'Dinner')

      await user.click(screen.getByRole('button', { name: 'Back' }))
      expect(screen.getByLabelText('Amount')).toHaveValue('120')
      expect(screen.getByLabelText('Note (optional)')).toHaveValue('Dinner')

      await user.click(screen.getByRole('button', { name: 'Back' }))
      expect(await screen.findByRole('radio', { name: /Jamie Tan/ })).toBeChecked()
    })
  })

  describe('sending', () => {
    // Required test 2
    it('shows the success screen, then the dashboard has the new balance, transaction and limit', async () => {
      const user = userEvent.setup()
      await toReviewStep(user, '120', 'Dinner')

      await user.click(screen.getByRole('button', { name: 'Confirm transfer' }))

      expect(await screen.findByRole('heading', { name: 'Transfer sent' }, SLOW)).toBeVisible()
      const dialog = screen.getByRole('dialog')
      expect(within(dialog).getByText(moneyText(120))).toBeVisible()
      expect(within(dialog).getByText('to Jamie Tan · DBS · •••• 3391')).toBeVisible()
      expect(within(dialog).getByText(/TRF-/)).toBeVisible()
      expect(within(dialog).getByText('The money should arrive within minutes.')).toBeVisible()
      expect(posts).toHaveLength(1)

      await user.click(screen.getByRole('button', { name: 'Back to dashboard' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

      // 17,120.55 - 120 total available; checking 4,280.55 - 120; limit 5,000 - 120.
      expect(await screen.findByText(moneyText(17000.55), {}, SLOW)).toBeVisible()
      expect(screen.getByText(moneyText(4160.55))).toBeVisible()
      expect(await screen.findByText(`${moneyText(4880)} remaining today`, {}, SLOW)).toBeVisible()
      // The new transaction is the newest row.
      const recent = await screen.findByRole('region', { name: 'Recent transactions' })
      expect(await within(recent).findByText('Transfer to Jamie Tan', {}, SLOW)).toBeVisible()
      expect(within(recent).getAllByRole('listitem')[0]).toHaveTextContent('Transfer to Jamie Tan')
    })

    it('can send to someone new', async () => {
      const user = userEvent.setup()
      await openDialog(user)
      await user.click(await screen.findByRole('radio', { name: /Send to someone new/ }, SLOW))
      await user.type(screen.getByLabelText('Recipient name'), 'Alex Lim')
      await user.type(screen.getByLabelText('Account number'), '12345678')
      await user.selectOptions(screen.getByLabelText('Bank'), 'OCBC')
      await cont(user)
      await user.type(await screen.findByLabelText('Amount'), '50')
      await cont(user)

      expect(await screen.findByText('Alex Lim · OCBC · •••• 5678')).toBeVisible()
      await user.click(screen.getByRole('button', { name: 'Confirm transfer' }))

      expect(await screen.findByText('to Alex Lim · OCBC · •••• 5678', {}, SLOW)).toBeVisible()
      const body = await posts[0].json()
      expect(body.recipient).toEqual({ name: 'Alex Lim', accountNumber: '12345678', bank: 'OCBC' })
      expect(body).not.toHaveProperty('payeeId')
    })

    it('shows Sending… and can only send once', async () => {
      const user = userEvent.setup()
      await toReviewStep(user)

      const confirm = screen.getByRole('button', { name: 'Confirm transfer' })
      await user.dblClick(confirm)

      const sending = screen.getByRole('button', { name: 'Sending…' })
      expect(sending).toBeDisabled()
      await screen.findByRole('heading', { name: 'Transfer sent' }, SLOW)
      expect(posts).toHaveLength(1)
    })

    it('stays on the review step with an alert when sending fails, then lets you try again', async () => {
      const user = userEvent.setup()
      await toReviewStep(user, '120', '#fail')

      await user.click(screen.getByRole('button', { name: 'Confirm transfer' }))

      expect(await screen.findByRole('alert', {}, SLOW)).toHaveTextContent(SEND_ERROR_MESSAGE)
      expect(screen.getByRole('heading', { name: 'Check the details' })).toBeVisible()
      expect(screen.queryByRole('heading', { name: 'Transfer sent' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirm transfer' })).toBeEnabled()
      expect(screen.getByText('#fail')).toBeVisible() // data intact

      // Fix the note and try again.
      await user.click(screen.getByRole('button', { name: 'Back' }))
      await user.clear(screen.getByLabelText('Note (optional)'))
      await user.type(screen.getByLabelText('Note (optional)'), 'Dinner')
      await cont(user)
      await user.click(screen.getByRole('button', { name: 'Confirm transfer' }))

      expect(await screen.findByRole('heading', { name: 'Transfer sent' }, SLOW)).toBeVisible()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})

describe('the Continue button', { timeout: 20000 }, () => {
  const continueButton = () => screen.getByRole('button', { name: 'Continue' })
  const looksDisabled = () => continueButton().getAttribute('aria-disabled') === 'true'

  it('looks disabled until a recipient is chosen, and enables once one is', async () => {
    const user = userEvent.setup()
    await openDialog(user)
    await screen.findByRole('radio', { name: /Jamie Tan/ }, SLOW)
    expect(looksDisabled()).toBe(true)

    await choosePayee(user, 'Jamie Tan')

    expect(looksDisabled()).toBe(false)
  })

  it('waits for every detail of someone new to be valid', async () => {
    const user = userEvent.setup()
    await openDialog(user)
    await user.click(await screen.findByRole('radio', { name: /Send to someone new/ }, SLOW))
    expect(looksDisabled()).toBe(true)

    await user.type(screen.getByLabelText('Recipient name'), 'Alex Lim')
    await user.type(screen.getByLabelText('Account number'), '12345678')
    expect(looksDisabled()).toBe(true) // still no bank

    await user.selectOptions(screen.getByLabelText('Bank'), 'OCBC')
    expect(looksDisabled()).toBe(false)

    await user.clear(screen.getByLabelText('Account number'))
    await user.type(screen.getByLabelText('Account number'), '123')
    expect(looksDisabled()).toBe(true)
  })

  it('on the amount step, enables for a valid amount and not for an empty or too-large one', async () => {
    const user = userEvent.setup()
    await toAmountStep(user)
    expect(looksDisabled()).toBe(true)

    await user.type(screen.getByLabelText('Amount'), '120')
    expect(looksDisabled()).toBe(false)

    await user.clear(screen.getByLabelText('Amount'))
    await user.type(screen.getByLabelText('Amount'), '99999')
    expect(looksDisabled()).toBe(true)

    await user.click(screen.getByRole('button', { name: '100' }))
    expect(looksDisabled()).toBe(false)
  })

  it('stays focusable, and pressing it early explains what is wrong instead of advancing', async () => {
    const user = userEvent.setup()
    await openDialog(user)
    await screen.findByRole('radio', { name: /Jamie Tan/ }, SLOW)

    expect(continueButton()).not.toBeDisabled()
    continueButton().focus()
    expect(continueButton()).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(await screen.findByText("Choose who you're sending to.")).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Who are you sending to?' })).toBeVisible()
  })
})
