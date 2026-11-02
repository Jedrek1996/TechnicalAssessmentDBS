import { useQuery } from '@tanstack/react-query'
import {
  RECENT_TRANSACTIONS_LIMIT,
  accountsQuery,
  transactionsQuery,
} from '../api/queries'
import { useCustomer } from './useCustomer'

// Three independent queries fired together (no waterfall), folded into one status for the page.
export function useDashboardData() {
  const customer = useCustomer()
  const accounts = useQuery(accountsQuery())
  const transactions = useQuery(transactionsQuery(RECENT_TRANSACTIONS_LIMIT))
  const queries = [customer, accounts, transactions]

  const failed = queries.filter(
    (query) => query.isError && !query.isFetching && query.data === undefined,
  )

  if (failed.length > 0) {
    return {
      status: 'error' as const,
      retry: () => failed.forEach((query) => void query.refetch()),
    }
  }

  if (customer.data && accounts.data && transactions.data) {
    return {
      status: 'success' as const,
      customer: customer.data,
      accounts: accounts.data,
      transactions: transactions.data,
    }
  }

  return { status: 'pending' as const }
}
