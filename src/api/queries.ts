import { queryOptions } from '@tanstack/react-query'
import { apiFetch } from './client'
import type {
  AccountsResponse,
  CustomerResponse,
  PayeesResponse,
  TransactionsResponse,
} from './types'

export const RECENT_TRANSACTIONS_LIMIT = 8

// Every query key in one place, so invalidating after a transfer can't miss one.
export const queryKeys = {
  customer: ['customer'] as const,
  accounts: ['accounts'] as const,
  transactions: (limit: number) => ['transactions', { limit }] as const,
  transactionsAll: ['transactions'] as const,
  payees: ['payees'] as const,
}

// Each query unwraps the response envelope, so components get the data itself.

export const customerQuery = () =>
  queryOptions({
    queryKey: queryKeys.customer,
    queryFn: async () =>
      (await apiFetch<CustomerResponse>('/api/customer')).customer,
  })

export const accountsQuery = () =>
  queryOptions({
    queryKey: queryKeys.accounts,
    queryFn: async () =>
      (await apiFetch<AccountsResponse>('/api/accounts')).accounts,
  })

export const transactionsQuery = (limit: number) =>
  queryOptions({
    queryKey: queryKeys.transactions(limit),
    queryFn: async () =>
      (await apiFetch<TransactionsResponse>(`/api/transactions?limit=${limit}`))
        .transactions,
  })

export const payeesQuery = () =>
  queryOptions({
    queryKey: queryKeys.payees,
    queryFn: async () =>
      (await apiFetch<PayeesResponse>('/api/payees')).payees,
  })
