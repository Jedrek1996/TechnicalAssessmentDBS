import { useId } from 'react'
import { formatMoney } from '../../../../lib/format'
import styles from '../../../../styles/components/dashboard/limit/DailyLimit.module.css'
import { remainingLimit } from '../../../../utils/money'
import { SectionHeading } from '../../../common/SectionHeading'

interface DailyLimitProps {
  limit: number
  used: number
}

export function DailyLimit({ limit, used }: DailyLimitProps) {
  const headingId = useId()
  const remaining = remainingLimit({
    dailyTransferLimit: limit,
    transferredToday: used,
  })
  const usedShare = limit > 0 ? Math.min(used / limit, 1) : 0
  const percentUsed = Math.round(usedShare * 100)

  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <div className={styles.head}>
        <SectionHeading id={headingId}>Daily limit</SectionHeading>
        <span className={styles.used}>{percentUsed}% used</span>
      </div>
      <p className={styles.remaining}>{formatMoney(remaining)} remaining today</p>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Daily limit used"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={used}
      >
        <div className={styles.fill} style={{ width: `${usedShare * 100}%` }} />
      </div>
      <p className={styles.note}>Resets daily. Applies to all transfers.</p>
    </section>
  )
}
