import type { ReactNode } from 'react'
import styles from '../../styles/components/transfer/StepHeading.module.css'

interface StepHeadingProps {
  id?: string
  children: ReactNode
}

// Focus moves here when a step opens, so screen readers announce where you are.
export function StepHeading({ id, children }: StepHeadingProps) {
  return (
    <h2 id={id} tabIndex={-1} className={styles.heading}>
      {children}
    </h2>
  )
}
