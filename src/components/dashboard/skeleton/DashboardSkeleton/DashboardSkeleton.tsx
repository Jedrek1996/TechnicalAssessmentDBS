import accountStyles from '../../../../styles/components/dashboard/accounts/AccountList.module.css'
import gridStyles from '../../../../styles/components/dashboard/Dashboard.module.css'
import skeletonStyles from '../../../../styles/components/dashboard/skeleton/DashboardSkeleton.module.css'
import listStyles from '../../../../styles/components/dashboard/transactions/TransactionList.module.css'
import rowStyles from '../../../../styles/components/dashboard/transactions/TransactionRow.module.css'
import searchStyles from '../../../../styles/components/common/SearchInput.module.css'
import { SectionHeader } from '../../../common/SectionHeader'
import { Skeleton } from '../../../common/Skeleton'
import { ContentLayout } from '../../../layout/ContentLayout'

const ACCOUNT_CARDS = 3
const TRANSACTION_ROWS = 8

const toggle = (
  <Skeleton width="var(--tap-target)" height="var(--tap-target)" radius="var(--radius-full)" />
)

// Built from the same grid, header, list and row styles as the loaded dashboard, so
// nothing moves when the data arrives.
export function DashboardSkeleton() {
  return (
    <ContentLayout>
      <div role="status" aria-label="Loading your dashboard" className={gridStyles.grid}>
        <div className={gridStyles.greeting}>
          <div className={skeletonStyles.greeting}>
            <Skeleton width="60%" height="2rem" />
            <Skeleton width="30%" height="1.3125rem" />
          </div>
        </div>
        <div className={gridStyles.hero}>
          <div className={skeletonStyles.hero}>
            <Skeleton height="auto" radius="var(--radius-lg)" />
          </div>
        </div>
        <div className={gridStyles.limit}>
          <div className={skeletonStyles.limit}>
            <Skeleton height="auto" radius="var(--radius-lg)" />
          </div>
        </div>
        <div className={gridStyles.accounts}>
          <SectionHeader
            heading={<Skeleton width="6rem" height="1.3125rem" />}
            toggle={toggle}
          />
          <div className={accountStyles.list}>
            {Array.from({ length: ACCOUNT_CARDS }, (_, index) => (
              <Skeleton key={index} height="10.0625rem" radius="var(--radius-lg)" />
            ))}
          </div>
        </div>
        <div className={gridStyles.transactions}>
          <SectionHeader
            heading={<Skeleton width="11rem" height="1.3125rem" />}
            toggle={toggle}
            action={
              <div className={searchStyles.wrap}>
                <Skeleton height="var(--tap-target)" radius="var(--radius-full)" />
              </div>
            }
          />
          <div className={listStyles.list}>
            {Array.from({ length: TRANSACTION_ROWS }, (_, index) => (
              <div key={index} className={rowStyles.row}>
                <Skeleton width="2.5rem" height="2.5rem" radius="var(--radius-full)" />
                <div className={skeletonStyles.rowText}>
                  <Skeleton width="45%" height="1rem" />
                </div>
                <Skeleton width="5rem" height="1rem" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}
