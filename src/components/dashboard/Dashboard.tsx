import type { Account, Customer, Transaction } from '../../api/types'
import styles from '../../styles/components/dashboard/Dashboard.module.css'
import { depositAccountCount, totalAvailable } from '../../utils/money'
import { ContentLayout } from '../layout/ContentLayout'
import { AccountList } from './accounts/AccountList'
import { DailyLimit } from './limit/DailyLimit'
import { BalanceHero } from './summary/BalanceHero'
import { Greeting } from './summary/Greeting'
import { TransactionList } from './transactions/TransactionList'

interface DashboardProps {
  customer: Customer
  accounts: Account[]
  transactions: Transaction[]
  onNewTransfer: (trigger: HTMLElement) => void
}

export function Dashboard({
  customer,
  accounts,
  transactions,
  onNewTransfer,
}: DashboardProps) {
  return (
    <ContentLayout>
      <div className={styles.grid}>
        <div className={styles.greeting}>
          <Greeting firstName={customer.firstName} />
        </div>
        <div className={styles.hero}>
          <BalanceHero
            total={totalAvailable(accounts)}
            depositCount={depositAccountCount(accounts)}
            onNewTransfer={onNewTransfer}
          />
        </div>
        <div className={styles.limit}>
          <DailyLimit
            limit={customer.dailyTransferLimit}
            used={customer.transferredToday}
          />
        </div>
        <div className={styles.accounts}>
          <AccountList accounts={accounts} />
        </div>
        <div className={styles.transactions}>
          <TransactionList transactions={transactions} />
        </div>
      </div>
    </ContentLayout>
  )
}
