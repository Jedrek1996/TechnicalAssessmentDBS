import styles from '../../../styles/components/dashboard/DashboardSkeleton.module.css'
import { Skeleton } from '../../common/Skeleton'
import { ContentLayout } from '../../layout/ContentLayout'

const ACCOUNT_CARDS = 3
const TRANSACTION_ROWS = 8

/** Mirrors the loaded dashboard block for block, so nothing moves when data arrives. */
export function DashboardSkeleton() {
  return (
    <ContentLayout
      main={
        <div
          role="status"
          aria-label="Loading your dashboard"
          className={styles.stack}
        >
          <Skeleton width="60%" height="2rem" />
          <Skeleton height="10rem" radius="var(--radius-lg)" />
          <div className={styles.accounts}>
            {Array.from({ length: ACCOUNT_CARDS }, (_, index) => (
              <Skeleton key={index} height="6rem" radius="var(--radius-lg)" />
            ))}
          </div>
          <div className={styles.rows}>
            {Array.from({ length: TRANSACTION_ROWS }, (_, index) => (
              <Skeleton key={index} height="3.5rem" />
            ))}
          </div>
        </div>
      }
      rail={<Skeleton height="9rem" radius="var(--radius-lg)" />}
    />
  )
}
