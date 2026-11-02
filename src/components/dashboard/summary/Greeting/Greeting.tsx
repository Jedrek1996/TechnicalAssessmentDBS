import styles from '../../../../styles/components/dashboard/summary/Greeting.module.css'
import { formatLongDate } from '../../../../utils/date'

interface GreetingProps {
  firstName: string
  today?: Date
}

export function Greeting({ firstName, today = new Date() }: GreetingProps) {
  return (
    <div className={styles.block}>
      <h1 className={styles.greeting}>Good evening, {firstName}</h1>
      <p className={styles.date}>{formatLongDate(today)}</p>
    </div>
  )
}
