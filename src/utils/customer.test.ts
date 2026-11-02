import { expect, it } from 'vitest'
import { customerInitials } from './customer'

it('uses the first letter of the first and last name', () => {
  expect(customerInitials({ firstName: 'Ava', lastName: 'Chen' })).toBe('AC')
  expect(customerInitials({ firstName: 'ava', lastName: 'chen' })).toBe('AC')
})
