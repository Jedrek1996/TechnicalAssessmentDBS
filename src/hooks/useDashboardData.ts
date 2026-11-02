import { useQuery } from '@tanstack/react-query'
import {
  RECENT_TRANSACTIONS_LIMIT,
  accountsQuery,
  transactionsQuery,
} from '../api/queries'
import { useCustomer } from './useCustomer'

/**
 * Loads the customer, accounts and recent transactions at the same time (three
 * independent queries, so there is no waterfall) and folds them into one state
 * for the page: pending, error, or success with all the data.
 */
export function useDashboardData() {
  const customer = useCustomer()
  const accounts = useQuery(accountsQuery())
  const transactions = useQuery(transactionsQuery(RECENT_TRANSACTIONS_LIMIT))
  const queries = [customer, accounts, transactions]

  // A failed refetch that still has older data keeps showing that data. It is
  // only an error when there is nothing to show, and not while Retry is running.
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
