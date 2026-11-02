import { useQuery } from '@tanstack/react-query'
import { useFormContext } from 'react-hook-form'
import { payeesQuery } from '../../../../api/queries'
import type { Account } from '../../../../api/types'
import { NEW_RECIPIENT, TRANSFER_FEE } from '../../../../constants/transfer'
import { formatMoney } from '../../../../lib/format'
import styles from '../../../../styles/components/transfer/review/ReviewStep.module.css'
import type { TransferFormValues } from '../../../../utils/transferSchema'
import { StepHeading } from '../../StepHeading'
import { ReviewSummary } from '../ReviewSummary'

interface ReviewStepProps {
  accounts: Account[]
  sendError?: string
}

export function ReviewStep({ accounts, sendError }: ReviewStepProps) {
  const { getValues } = useFormContext<TransferFormValues>()
  const payees = useQuery(payeesQuery())
  const values = getValues()

  const account = accounts.find(({ id }) => id === values.fromAccountId)
  const payee = payees.data?.find(({ id }) => id === values.recipientChoice)
  const amount = Number(values.amount)

  const to =
    values.recipientChoice === NEW_RECIPIENT
      ? `${values.newRecipient.name.trim()} · ${values.newRecipient.bank} · •••• ${values.newRecipient.accountNumber.slice(-4)}`
      : payee
        ? `${payee.name} · ${payee.bank} · ${payee.accountNumberMasked}`
        : ''

  return (
    <>
      <StepHeading>Check the details</StepHeading>
      <ReviewSummary
        from={account ? `${account.name} · ${account.maskedNumber}` : ''}
        to={to}
        amount={formatMoney(amount)}
        fee={formatMoney(TRANSFER_FEE)}
        note={values.note.trim()}
        total={formatMoney(amount + TRANSFER_FEE)}
      />
      <p className={styles.info}>Usually arrives in minutes.</p>
      {sendError && (
        <div role="alert" className={styles.alert}>
          {sendError}
        </div>
      )}
    </>
  )
}
