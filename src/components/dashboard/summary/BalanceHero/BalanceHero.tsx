import { formatMoney } from '../../../../lib/format'
import styles from '../../../../styles/components/dashboard/summary/BalanceHero.module.css'
import { Button } from '../../../common/Button'

interface BalanceHeroProps {
  total: number
  depositCount: number
  onNewTransfer: () => void
}

export function BalanceHero({
  total,
  depositCount,
  onNewTransfer,
}: BalanceHeroProps) {
  const noun = depositCount === 1 ? 'deposit account' : 'deposit accounts'

  return (
    <section className={styles.hero} aria-label="Total available">
      <div>
        <p className={styles.label}>Total available</p>
        <p className={styles.amount}>{formatMoney(total)}</p>
        <p className={styles.caption}>
          Across {depositCount} {noun}
        </p>
      </div>
      <Button className={styles.transfer} onClick={onNewTransfer}>
        <span aria-hidden="true">+</span>
        New transfer
      </Button>
    </section>
  )
}
