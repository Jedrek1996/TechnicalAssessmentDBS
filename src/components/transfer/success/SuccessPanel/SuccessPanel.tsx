import type { Transfer } from '../../../../api/types'
import { formatMoney } from '../../../../lib/format'
import styles from '../../../../styles/components/transfer/success/SuccessPanel.module.css'
import { StepHeading } from '../../StepHeading'

interface SuccessPanelProps {
  transfer: Transfer
}

export function SuccessPanel({ transfer }: SuccessPanelProps) {
  const { recipient } = transfer

  return (
    <div aria-live="polite" className={styles.panel}>
      <span className={styles.tick} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="m5 12 5 5 9-10" />
        </svg>
      </span>
      <StepHeading>Transfer sent</StepHeading>
      <p className={styles.amount}>{formatMoney(transfer.amount)}</p>
      <p className={styles.recipient}>
        to {recipient.name} · {recipient.bank} · {recipient.accountNumberMasked}
      </p>
      <p className={styles.reference}>
        <span>Reference</span> {transfer.reference}
      </p>
      <p className={styles.message}>The money should arrive within minutes.</p>
    </div>
  )
}
