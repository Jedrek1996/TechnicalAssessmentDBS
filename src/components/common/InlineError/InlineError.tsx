import styles from '../../../styles/components/common/InlineError.module.css'
import { Button } from '../Button'

interface InlineErrorProps {
  message: string
  onRetry: () => void
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div role="alert" className={styles.error}>
      <p className={styles.message}>{message}</p>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  )
}
