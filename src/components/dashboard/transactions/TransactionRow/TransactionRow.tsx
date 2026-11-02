import type { Transaction } from '../../../../api/types'
import { formatShortDate } from '../../../../lib/format'
import styles from '../../../../styles/components/dashboard/transactions/TransactionRow.module.css'
import { formatSignedAmount } from '../../../../utils/transactions'
import { TransactionIcon } from '../TransactionIcon'

interface TransactionRowProps {
  transaction: Transaction
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const moneyIn = transaction.direction === 'in'

  return (
    <li className={styles.row}>
      <TransactionIcon category={transaction.category} direction={transaction.direction} />
      <div className={styles.details}>
        <p className={styles.description} title={transaction.description}>
          {transaction.description}
        </p>
        <p className={styles.meta}>
          {transaction.category} · {formatShortDate(transaction.date)}
        </p>
      </div>
      <div className={styles.end}>
        <p className={moneyIn ? styles.amountIn : styles.amount}>
          {formatSignedAmount(transaction)}
        </p>
        {transaction.status === 'pending' && (
          <span className={styles.pending}>Pending</span>
        )}
      </div>
    </li>
  )
}
