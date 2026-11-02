import { useRef, useState } from 'react'
import type { Transaction } from '../../../../api/types'
import { formatShortDate } from '../../../../lib/format'
import styles from '../../../../styles/components/dashboard/transactions/TransactionList.module.css'
import { filterTransactions, formatSignedAmount } from '../../../../utils/transactions'
import { CollapsibleSection } from '../../../common/CollapsibleSection'
import { EmptyState } from '../../../common/EmptyState'
import { SearchInput } from '../../../common/SearchInput'
import { SummaryCard } from '../../../common/SummaryCard'
import { TransactionRow } from '../TransactionRow'

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const visible = filterTransactions(transactions, query)
  const searching = query.trim() !== ''
  const [latest] = transactions

  function clearSearch() {
    setQuery('')
    inputRef.current?.focus()
  }

  const summary = latest ? (
    <SummaryCard
      title={`${transactions.length} ${transactions.length === 1 ? 'transaction' : 'transactions'}`}
      detail={`Latest: ${latest.description}, ${formatSignedAmount(latest)} on ${formatShortDate(latest.date)}`}
    />
  ) : (
    <SummaryCard title="No transactions yet." />
  )

  return (
    <CollapsibleSection
      title="Recent transactions"
      summary={summary}
      action={
        <SearchInput
          ref={inputRef}
          value={query}
          onChange={setQuery}
          onClear={clearSearch}
        />
      }
    >
      <p aria-live="polite" className={styles.count}>
        {searching &&
          `${visible.length} ${visible.length === 1 ? 'result' : 'results'}`}
      </p>

      {visible.length > 0 ? (
        <ul className={styles.list}>
          {visible.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      ) : searching ? (
        <EmptyState
          message="No transactions match your search."
          action={{ label: 'Clear search', onClick: clearSearch }}
        />
      ) : (
        <EmptyState message="No transactions yet." />
      )}
    </CollapsibleSection>
  )
}
