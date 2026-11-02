import styles from '../../../styles/components/common/SummaryCard.module.css'

interface SummaryCardProps {
  title: string
  detail?: string
}

/** What a collapsed section shows, so it is never empty. */
export function SummaryCard({ title, detail }: SummaryCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      {detail && <p className={styles.detail}>{detail}</p>}
    </div>
  )
}
