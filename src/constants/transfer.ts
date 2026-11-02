export type TransferStep = 'recipient' | 'amount' | 'review' | 'success'

/** The "Send to someone new" option shares the radio group with the saved payees. */
export const NEW_RECIPIENT = 'new'

export const NOTE_MAX_LENGTH = 50
export const QUICK_AMOUNTS = [50, 100, 250, 500] as const
export const TRANSFER_FEE = 0
export const BANKS = [
  'DBS',
  'POSB',
  'OCBC',
  'UOB',
  'Standard Chartered',
  'HSBC',
  'Citibank',
  'Maybank',
] as const

export const SEND_ERROR_MESSAGE =
  "Something went wrong. Your money hasn't left your account. Try again."
