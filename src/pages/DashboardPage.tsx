import { InlineError } from '../components/common/InlineError'
import { Dashboard } from '../components/dashboard/Dashboard'
import { DashboardSkeleton } from '../components/dashboard/skeleton/DashboardSkeleton'
import { ContentLayout } from '../components/layout/ContentLayout'
import { useDashboardData } from '../hooks/useDashboardData'

// Opens the transfer dialog once it exists (T1).
const openTransferDialog = () => {}

export function DashboardPage() {
  const dashboard = useDashboardData()

  switch (dashboard.status) {
    case 'pending':
      return <DashboardSkeleton />
    case 'error':
      return (
        <ContentLayout>
          <InlineError
            message="We couldn't load your dashboard."
            onRetry={dashboard.retry}
          />
        </ContentLayout>
      )
    case 'success':
      return (
        <Dashboard
          customer={dashboard.customer}
          accounts={dashboard.accounts}
          transactions={dashboard.transactions}
          onNewTransfer={openTransferDialog}
        />
      )
  }
}
