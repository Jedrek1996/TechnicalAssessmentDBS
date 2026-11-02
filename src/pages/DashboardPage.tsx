import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { Greeting } from '../components/dashboard/Greeting'
import { InlineError } from '../components/common/InlineError'
import { ContentLayout } from '../components/layout/ContentLayout'
import { useDashboardData } from '../hooks/useDashboardData'

export function DashboardPage() {
  const dashboard = useDashboardData()

  switch (dashboard.status) {
    case 'pending':
      return <DashboardSkeleton />
    case 'error':
      return (
        <ContentLayout
          main={
            <InlineError
              message="We couldn't load your dashboard."
              onRetry={dashboard.retry}
            />
          }
        />
      )
    case 'success':
      return <ContentLayout main={<Greeting firstName={dashboard.customer.firstName} />} />
  }
}
