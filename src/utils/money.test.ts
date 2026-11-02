import { describe, expect, it } from 'vitest'
import type { Account } from '../api/types'
import {
  depositAccountCount,
  remainingLimit,
  totalAvailable,
} from './money'

const account = (type: Account['type'], balance: number): Account => ({
  id: `acc_${type}`,
  name: type,
  type,
  maskedNumber: '•••• 0000',
  balance,
  currency: 'SGD',
})

// The seed data from the brief.
const ava = [
  account('checking', 4280.55),
  account('savings', 12840),
  account('credit', -420.3),
]

describe('totalAvailable', () => {
  it('adds checking and savings and leaves out the credit card', () => {
    expect(totalAvailable(ava)).toBe(17120.55)
  })

  it('does not drift the way floating point addition does', () => {
    expect(0.1 + 0.2).not.toBe(0.3)
    expect(
      totalAvailable([account('checking', 0.1), account('savings', 0.2)]),
    ).toBe(0.3)
  })

  it('is zero with no deposit accounts', () => {
    expect(totalAvailable([account('credit', -50)])).toBe(0)
    expect(totalAvailable([])).toBe(0)
  })
})

describe('depositAccountCount', () => {
  it('counts every account except the credit card', () => {
    expect(depositAccountCount(ava)).toBe(2)
  })
})

describe('remainingLimit', () => {
  it('is the daily limit minus what has been sent today', () => {
    expect(remainingLimit({ dailyTransferLimit: 5000, transferredToday: 0 })).toBe(
      5000,
    )
    expect(
      remainingLimit({ dailyTransferLimit: 5000, transferredToday: 120.1 }),
    ).toBe(4879.9)
  })
})
