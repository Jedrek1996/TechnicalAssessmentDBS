import type { Customer } from '../api/types'

export function customerInitials(
  customer: Pick<Customer, 'firstName' | 'lastName'>,
): string {
  return `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase()
}
