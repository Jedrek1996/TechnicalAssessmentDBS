import { describe, expect, it } from 'vitest'
import { NEW_RECIPIENT } from '../constants/transfer'
import type { TransferFormValues } from '../utils/transferSchema'
import { toFormErrors, toRequest } from './transfers'

const values = (overrides: Partial<TransferFormValues> = {}): TransferFormValues => ({
  recipientChoice: 'pay_001',
  newRecipient: { name: '', accountNumber: '', bank: '' },
  fromAccountId: 'acc_checking',
  amount: '120.50',
  note: '',
  ...overrides,
})

describe('toRequest', () => {
  it('sends a saved payee by id, with the amount as a number and no empty note', () => {
    expect(toRequest(values())).toEqual({
      fromAccountId: 'acc_checking',
      amount: 120.5,
      payeeId: 'pay_001',
    })
  })

  it('sends a new recipient with the typed details, never both a payee and a recipient', () => {
    const request = toRequest(
      values({
        recipientChoice: NEW_RECIPIENT,
        newRecipient: { name: ' Alex Lim ', accountNumber: '12345678', bank: 'OCBC' },
        note: ' Dinner ',
      }),
    )

    expect(request).toEqual({
      fromAccountId: 'acc_checking',
      amount: 120.5,
      note: 'Dinner',
      recipient: { name: 'Alex Lim', accountNumber: '12345678', bank: 'OCBC' },
    })
    expect(request).not.toHaveProperty('payeeId')
  })
})

describe('toFormErrors', () => {
  it('maps the API field names onto the form field names', () => {
    expect(
      toFormErrors({
        amount: 'Too much',
        'recipient.accountNumber': 'Bad number',
        payeeId: 'Unknown payee',
        somethingElse: 'ignored',
      }),
    ).toEqual([
      ['amount', 'Too much'],
      ['newRecipient.accountNumber', 'Bad number'],
      ['recipientChoice', 'Unknown payee'],
    ])
  })

  it('handles no field errors', () => {
    expect(toFormErrors(undefined)).toEqual([])
  })
})
