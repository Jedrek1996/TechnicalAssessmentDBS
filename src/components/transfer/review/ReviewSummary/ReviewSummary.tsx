import styles from '../../../../styles/components/transfer/review/ReviewSummary.module.css'

interface ReviewSummaryProps {
  from: string
  to: string
  amount: string
  fee: string
  note: string
  total: string
}

export function ReviewSummary({ from, to, amount, fee, note, total }: ReviewSummaryProps) {
  const rows = [
    ['From', from],
    ['To', to],
    ['Amount', amount],
    ['Fee', fee],
    ['Note', note || '—'],
  ]

  return (
    <dl className={styles.list}>
      {rows.map(([label, value]) => (
        <div key={label} className={styles.row}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
      <div className={`${styles.row} ${styles.total}`}>
        <dt>Total</dt>
        <dd>{total}</dd>
      </div>
    </dl>
  )
}
