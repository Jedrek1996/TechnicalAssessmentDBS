import type { Account } from '../../../../api/types'
import { formatMoney } from '../../../../lib/format'
import styles from '../../../../styles/components/dashboard/accounts/AccountCard.module.css'
import { isDepositAccount } from '../../../../utils/money'
import { AccountIcon } from '../AccountIcon'

interface AccountCardProps {
  account: Account
}

export function AccountCard({ account }: AccountCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.icon}>
        <AccountIcon type={account.type} />
      </div>
      <h3 className={styles.name}>{account.name}</h3>
      <p className={styles.number}>{account.maskedNumber}</p>
      <p className={styles.balance}>{formatMoney(account.balance)}</p>
      {isDepositAccount(account) ? (
        <p className={styles.status}>Available balance</p>
      ) : (
        <p className={styles.due}>Amount due</p>
      )}
    </article>
  )
}
