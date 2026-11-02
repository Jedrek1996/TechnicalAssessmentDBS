import type { ReactNode } from 'react'
import styles from '../../../styles/components/common/SectionHeading.module.css'

interface SectionHeadingProps {
  id: string
  children: ReactNode
}

export function SectionHeading({ id, children }: SectionHeadingProps) {
  return (
    <h2 id={id} className={styles.heading}>
      {children}
    </h2>
  )
}
