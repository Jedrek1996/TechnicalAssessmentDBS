import { useQuery } from '@tanstack/react-query'
import { customerQuery } from '../api/queries'

// Shared by the Header and the dashboard: one request, one cache entry.
export function useCustomer() {
  return useQuery(customerQuery())
}
