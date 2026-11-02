import type { ReactNode } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import styles from '../../../../styles/components/transfer/recipient/RecipientOption.module.css'

interface RecipientOptionProps {
  value: string
  registration: UseFormRegisterReturn
  avatar: ReactNode
  title: string
  detail?: string
}

// A native radio underneath, so arrow keys, Tab and screen readers behave as expected.
export function RecipientOption({
  value,
  registration,
  avatar,
  title,
  detail,
}: RecipientOptionProps) {
  return (
    <label className={styles.option}>
      <input type="radio" value={value} className={styles.radio} {...registration} />
      <span className={styles.avatar} aria-hidden="true">
        {avatar}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {detail && <span className={styles.detail}>{detail}</span>}
      </span>
      <span className={styles.check} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="m5 12 5 5 9-10" />
        </svg>
      </span>
    </label>
  )
}
