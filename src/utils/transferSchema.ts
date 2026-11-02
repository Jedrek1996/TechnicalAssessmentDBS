import { z } from 'zod'
import { NEW_RECIPIENT, NOTE_MAX_LENGTH } from '../constants/transfer'
import { formatMoney } from '../lib/format'

export interface TransferFormValues {
  recipientChoice: string
  newRecipient: { name: string; accountNumber: string; bank: string }
  fromAccountId: string
  amount: string
  note: string
}

export interface AmountContext {
  balance: number
  remaining: number
}

// A required choice. An unchecked radio group gives null (not ''), so a missing value
// gets our message too, not the library's "expected string, received null".
const required = (message: string) => z.string({ error: message }).min(1, message)

// Each rule is defined once here and used for the inline errors and for sending.
const choiceRule = required("Choose who you're sending to.")
const NAME_MESSAGE = 'Enter a name between 2 and 50 characters.'
const ACCOUNT_NUMBER_MESSAGE = 'Enter a valid 8-digit account number.'
const nameRule = z
  .string({ error: NAME_MESSAGE })
  .trim()
  .min(2, NAME_MESSAGE)
  .max(50, NAME_MESSAGE)
const accountNumberRule = z
  .string({ error: ACCOUNT_NUMBER_MESSAGE })
  .regex(/^\d{8}$/, ACCOUNT_NUMBER_MESSAGE)
const bankRule = required('Choose a bank.')
const fromAccountRule = required('Choose an account to send from.')
const NOTE_MESSAGE = `Note can be at most ${NOTE_MAX_LENGTH} characters.`
const noteRule = z.string({ error: NOTE_MESSAGE }).max(NOTE_MAX_LENGTH, NOTE_MESSAGE)

const toCents = (amount: number) => Math.round(amount * 100)

/** The first problem with an amount typed as text, or null. If both the balance and the daily limit are exceeded, the balance message wins. */
function amountProblem(value: string, { balance, remaining }: AmountContext) {
  if (value === '') return 'Enter an amount.'
  if (!/^\d+(\.\d+)?$/.test(value)) return 'Enter a valid amount, for example 120.50.'
  if ((value.split('.')[1]?.length ?? 0) > 2) return 'Use at most 2 decimal places.'

  const cents = toCents(Number(value))
  if (cents < 100) return 'Amount must be at least SGD 1.00.'
  if (cents > toCents(balance)) {
    return `Amount can't be more than your available balance (${formatMoney(balance)}).`
  }
  if (cents > toCents(remaining)) {
    return `This transfer exceeds your remaining daily limit (${formatMoney(remaining)}).`
  }
  return null
}

const amountRule = (context: AmountContext) =>
  z.string({ error: 'Enter an amount.' }).trim().superRefine((value, ctx) => {
    const problem = amountProblem(value, context)
    if (problem) ctx.addIssue({ code: 'custom', message: problem })
  })

const newRecipientRules = z.object({
  name: nameRule,
  accountNumber: accountNumberRule,
  bank: bankRule,
})

// Every step schema has every field, with only that step's fields checked. A field a step
// doesn't check never complains: whatever it holds is accepted.
const unchecked = z.string().catch('')
const shape = z.object({
  recipientChoice: unchecked,
  newRecipient: z.object({ name: unchecked, accountNumber: unchecked, bank: unchecked }),
  fromAccountId: unchecked,
  amount: unchecked,
  note: unchecked,
})

function checkNewRecipient(
  values: TransferFormValues,
  ctx: z.RefinementCtx,
) {
  if (values.recipientChoice !== NEW_RECIPIENT) return
  const result = newRecipientRules.safeParse(values.newRecipient)
  if (result.success) return
  for (const issue of result.error.issues) {
    ctx.addIssue({
      code: 'custom',
      message: issue.message,
      path: ['newRecipient', ...issue.path.map(String)],
    })
  }
}

export function buildStepSchema(
  step: 'recipient' | 'amount' | 'review',
  context: AmountContext,
) {
  const recipient = shape
    .extend({ recipientChoice: choiceRule })
    .superRefine(checkNewRecipient)
  const amount = shape.extend({
    fromAccountId: fromAccountRule,
    amount: amountRule(context),
    note: noteRule,
  })
  if (step === 'recipient') return recipient
  if (step === 'amount') return amount
  return amount.extend({ recipientChoice: choiceRule }).superRefine(checkNewRecipient)
}
