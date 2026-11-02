import type { TransferStep } from '../../../../constants/transfer'
import styles from '../../../../styles/components/transfer/stepper/Stepper.module.css'

const STEPS = [
  { key: 'recipient', label: 'Recipient' },
  { key: 'amount', label: 'Amount' },
  { key: 'review', label: 'Review' },
] as const

interface StepperProps {
  step: Exclude<TransferStep, 'success'>
}

export function Stepper({ step }: StepperProps) {
  const current = STEPS.findIndex(({ key }) => key === step)

  return (
    <ol className={styles.stepper} aria-label="Transfer progress">
      {STEPS.map(({ key, label }, index) => (
        <li
          key={key}
          className={index <= current ? styles.reached : styles.step}
          aria-current={index === current ? 'step' : undefined}
        >
          <span className={styles.number}>{index + 1}</span>
          {label}
        </li>
      ))}
    </ol>
  )
}
