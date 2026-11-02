import { Suspense, lazy, useEffect, useState } from 'react'
import { InlineError } from '../components/common/InlineError'
import { Dashboard } from '../components/dashboard/Dashboard'
import { DashboardSkeleton } from '../components/dashboard/skeleton/DashboardSkeleton'
import { ContentLayout } from '../components/layout/ContentLayout'
import { useDashboardData } from '../hooks/useDashboardData'

// The dialog (and the MUI parts it needs) is a separate chunk: most visits never open it.
const loadTransferDialog = () => import('../components/transfer/TransferDialog')
const TransferDialog = lazy(() =>
  loadTransferDialog().then((module) => ({ default: module.TransferDialog })),
)

export function DashboardPage() {
  const dashboard = useDashboardData()
  const [transferOpen, setTransferOpen] = useState(false)
  // Mounted on first use, then kept, so closing still plays the exit animation and returns focus.
  const [transferUsed, setTransferUsed] = useState(false)
  const [opener, setOpener] = useState<HTMLElement | null>(null)

  // Fetch the chunk in the background once the page is up, so opening is instant.
  useEffect(() => {
    void loadTransferDialog()
  }, [])

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
        <>
          <Dashboard
            customer={dashboard.customer}
            accounts={dashboard.accounts}
            transactions={dashboard.transactions}
            onNewTransfer={(trigger) => {
              setOpener(trigger)
              setTransferUsed(true)
              setTransferOpen(true)
            }}
          />
          {transferUsed && (
            <Suspense fallback={null}>
              <TransferDialog
                open={transferOpen}
                onClose={() => setTransferOpen(false)}
                returnFocusTo={opener}
                customer={dashboard.customer}
                accounts={dashboard.accounts}
              />
            </Suspense>
          )}
        </>
      )
  }
}
