import type { Account } from '../../../../api/types'
import styles from '../../../../styles/components/dashboard/accounts/AccountList.module.css'
import { CollapsibleSection } from '../../../common/CollapsibleSection'
import { SummaryCard } from '../../../common/SummaryCard'
import { AccountCard } from '../AccountCard'

interface AccountListProps {
  accounts: Account[]
}

export function AccountList({ accounts }: AccountListProps) {
  const summary = (
    <SummaryCard
      title={`${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`}
      detail={accounts.map((account) => account.name).join(', ')}
    />
  )

  return (
    <CollapsibleSection title="Accounts" summary={summary}>
      <ul className={styles.list}>
        {accounts.map((account) => (
          <li key={account.id}>
            <AccountCard account={account} />
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  )
}
