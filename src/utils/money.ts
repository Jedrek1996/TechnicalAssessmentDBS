import type { Account, Customer } from '../api/types'

// Summed in whole cents so 0.1 + 0.2 is exactly 0.3.
const toCents = (amount: number) => Math.round(amount * 100)

export const isDepositAccount = (account: Account) => account.type !== 'credit'

export function totalAvailable(accounts: Account[]): number {
  const cents = accounts
    .filter(isDepositAccount)
    .reduce((sum, account) => sum + toCents(account.balance), 0)
  return cents / 100
}

export function depositAccountCount(accounts: Account[]): number {
  return accounts.filter(isDepositAccount).length
}

export function remainingLimit(
  customer: Pick<Customer, 'dailyTransferLimit' | 'transferredToday'>,
): number {
  return (
    (toCents(customer.dailyTransferLimit) -
      toCents(customer.transferredToday)) /
    100
  )
}
