import { describe, expect, it } from 'vitest'
import { NEW_RECIPIENT } from '../constants/transfer'
import { moneyText } from '../test/money'
import { buildStepSchema } from './transferSchema'
import type { TransferFormValues } from './transferSchema'

const context = { balance: 4280.55, remaining: 5000 }

const values = (overrides: Partial<TransferFormValues> = {}): TransferFormValues => ({
  recipientChoice: 'pay_001',
  newRecipient: { name: '', accountNumber: '', bank: '' },
  fromAccountId: 'acc_checking',
  amount: '120',
  note: '',
  ...overrides,
})

/** `path -> message` for every problem found in the given step. */
function problems(
  step: 'recipient' | 'amount' | 'review',
  input: TransferFormValues,
  ctx = context,
) {
  const result = buildStepSchema(step, ctx).safeParse(input)
  if (result.success) return {}
  return Object.fromEntries(result.error.issues.map((i) => [i.path.join('.'), i.message]))
}

const newRecipient = (fields: Partial<TransferFormValues['newRecipient']>) =>
  values({
    recipientChoice: NEW_RECIPIENT,
    newRecipient: { name: 'Alex Lim', accountNumber: '12345678', bank: 'OCBC', ...fields },
  })

describe('recipient step', () => {
  it('needs someone chosen', () => {
    expect(problems('recipient', values({ recipientChoice: '' }))).toEqual({
      recipientChoice: "Choose who you're sending to.",
    })
  })

  it('accepts a saved payee without checking the new-recipient fields', () => {
    expect(problems('recipient', values())).toEqual({})
  })

  it('accepts a complete new recipient', () => {
    expect(problems('recipient', newRecipient({}))).toEqual({})
  })

  it('needs a name of 2 to 50 characters, ignoring spaces around it', () => {
    const message = 'Enter a name between 2 and 50 characters.'
    expect(problems('recipient', newRecipient({ name: 'A' }))['newRecipient.name']).toBe(message)
    expect(problems('recipient', newRecipient({ name: '   ' }))['newRecipient.name']).toBe(message)
    expect(problems('recipient', newRecipient({ name: 'x'.repeat(51) }))['newRecipient.name']).toBe(message)
    expect(problems('recipient', newRecipient({ name: ' Al ' }))).toEqual({})
    expect(problems('recipient', newRecipient({ name: 'x'.repeat(50) }))).toEqual({})
  })

  it('needs exactly 8 digits for the account number', () => {
    const message = 'Enter a valid 8-digit account number.'
    for (const bad of ['', '1234567', '123456789', '1234abcd', '1234 567']) {
      expect(problems('recipient', newRecipient({ accountNumber: bad }))['newRecipient.accountNumber']).toBe(message)
    }
  })

  it('needs a bank', () => {
    expect(problems('recipient', newRecipient({ bank: '' }))['newRecipient.bank']).toBe('Choose a bank.')
  })
})

describe('missing values', () => {
  // An unchecked radio group reports null (not ''), and the form can also hand us undefined.
  const MESSAGE_FROM_THE_LIBRARY = /Invalid input|expected .* received/i

  it.each([null, undefined])('treats a recipient of %s like an empty choice, with our message', (missing) => {
    const input = { ...values(), recipientChoice: missing } as unknown as TransferFormValues

    expect(problems('recipient', input)).toEqual({
      recipientChoice: "Choose who you're sending to.",
    })
  })

  it.each([null, undefined])('treats a from-account of %s like an empty choice, with our message', (missing) => {
    const input = { ...values(), fromAccountId: missing } as unknown as TransferFormValues

    expect(problems('amount', input).fromAccountId).toBe('Choose an account to send from.')
  })

  it('never shows one of the validation library\'s own messages for a field the step shows', () => {
    const shown = {
      recipient: ['recipientChoice', 'newRecipient'],
      amount: ['fromAccountId', 'amount', 'note'],
      review: ['recipientChoice', 'newRecipient', 'fromAccountId', 'amount', 'note'],
    } as const
    const newRecipientFields = ['name', 'accountNumber', 'bank'] as const

    for (const step of ['recipient', 'amount', 'review'] as const) {
      const cases: TransferFormValues[] = []
      for (const field of shown[step]) {
        for (const missing of [null, undefined]) {
          if (field === 'newRecipient') {
            for (const inner of newRecipientFields) {
              const base = newRecipient({})
              cases.push({ ...base, newRecipient: { ...base.newRecipient, [inner]: missing } } as unknown as TransferFormValues)
            }
          } else {
            cases.push({ ...newRecipient({}), [field]: missing } as unknown as TransferFormValues)
          }
        }
      }
      for (const input of cases) {
        for (const [path, message] of Object.entries(problems(step, input))) {
          if (shown[step].some((owned) => path === owned || path.startsWith(owned + '.'))) {
            expect(message).not.toMatch(MESSAGE_FROM_THE_LIBRARY)
          }
        }
      }
    }
  })
})

describe('amount step', () => {
  const amountMessage = (amount: string, ctx = context) =>
    problems('amount', values({ amount }), ctx).amount

  it('needs an amount', () => {
    expect(amountMessage('')).toBe('Enter an amount.')
  })

  it('rejects text, signs and exponents', () => {
    for (const bad of ['abc', '-5', '1e3', '12,50', '1.']) {
      expect(amountMessage(bad)).toBe('Enter a valid amount, for example 120.50.')
    }
  })

  it('allows at most 2 decimal places', () => {
    expect(amountMessage('12.345')).toBe('Use at most 2 decimal places.')
    expect(amountMessage('12.34')).toBeUndefined()
    expect(amountMessage('12.3')).toBeUndefined()
  })

  it('needs at least SGD 1.00', () => {
    expect(amountMessage('0.99')).toBe('Amount must be at least SGD 1.00.')
    expect(amountMessage('0')).toBe('Amount must be at least SGD 1.00.')
    expect(amountMessage('1')).toBeUndefined()
    expect(amountMessage('1.00')).toBeUndefined()
  })

  it('cannot be more than the available balance, using the real balance', () => {
    expect(amountMessage('4280.56')).toBe(
      `Amount can't be more than your available balance (${formatted(4280.55)}).`,
    )
    expect(amountMessage('4280.55')).toBeUndefined()
  })

  it('cannot be more than the remaining daily limit, using the real limit', () => {
    const ctx = { balance: 12840, remaining: 4880 }
    expect(amountMessage('5000', ctx)).toBe(
      `This transfer exceeds your remaining daily limit (${formatted(4880)}).`,
    )
    expect(amountMessage('4880', ctx)).toBeUndefined()
  })

  it('shows the balance message when both the balance and the limit are exceeded', () => {
    expect(amountMessage('99999')).toContain("available balance")
  })

  it('needs a from-account', () => {
    expect(problems('amount', values({ fromAccountId: '' })).fromAccountId).toBe(
      'Choose an account to send from.',
    )
  })

  it('allows a note of up to 50 characters', () => {
    expect(problems('amount', values({ note: 'x'.repeat(50) })).note).toBeUndefined()
    expect(problems('amount', values({ note: 'x'.repeat(51) })).note).toBe(
      'Note can be at most 50 characters.',
    )
  })
})

describe('review step', () => {
  it('checks every rule from the earlier steps', () => {
    const found = problems('review', values({ recipientChoice: '', amount: '', note: 'x'.repeat(51) }))
    expect(Object.keys(found).sort()).toEqual(['amount', 'note', 'recipientChoice'])
  })

  it('passes when everything is valid', () => {
    expect(problems('review', values())).toEqual({})
  })
})

// The real message contains a non-breaking space; moneyText gives the plain-space form
// that appears in the DOM, so compare against the raw formatter here.
function formatted(amount: number) {
  return moneyText(amount).replace(/ /g, ' ')
}
