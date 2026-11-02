import type { ReactNode } from 'react'
import styles from '../../../styles/components/common/SectionHeader.module.css'

interface SectionHeaderProps {
  heading: ReactNode
  /** Expand/collapse button, beside the heading. */
  toggle?: ReactNode
  /** Search and the like: beside the heading on wider screens, below it on mobile. */
  action?: ReactNode
}

export function SectionHeader({ heading, toggle, action }: SectionHeaderProps) {
  const classes = [styles.header, action ? styles.withAction : styles.plain].join(' ')

  return (
    <div className={classes}>
      <div className={styles.heading}>{heading}</div>
      {toggle && <div className={styles.toggle}>{toggle}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
