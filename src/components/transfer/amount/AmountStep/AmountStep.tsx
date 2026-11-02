import { InputAdornment, TextField } from '@mui/material'
import { useFormContext } from 'react-hook-form'
import type { Account } from '../../../../api/types'
import { NOTE_MAX_LENGTH, QUICK_AMOUNTS } from '../../../../constants/transfer'
import { useTransferField } from '../../../../hooks/useTransferField'
import { formatMoney } from '../../../../lib/format'
import styles from '../../../../styles/components/transfer/amount/AmountStep.module.css'
import type { TransferFormValues } from '../../../../utils/transferSchema'
import { Button } from '../../../common/Button'
import { StepHeading } from '../../StepHeading'

interface AmountStepProps {
  accounts: Account[]
  remaining: number
}

export function AmountStep({ accounts, remaining }: AmountStepProps) {
  const field = useTransferField()
  const { watch, setValue } = useFormContext<TransferFormValues>()
  const fromAccount = field('fromAccountId')
  const balance = accounts.find(({ id }) => id === watch('fromAccountId'))?.balance ?? 0

  return (
    <>
      <StepHeading>How much?</StepHeading>

      <div className={styles.fields}>
        <TextField
          id="from-account"
          label="From account"
          select
          fullWidth
          {...fromAccount}
          helperText={fromAccount.helperText ?? 'Deposit accounts only'}
          slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} · {account.maskedNumber}
            </option>
          ))}
        </TextField>

        <div>
          <TextField
            id="amount"
            label="Amount"
            autoComplete="off"
            fullWidth
            {...field('amount')}
            slotProps={{
              htmlInput: { inputMode: 'decimal' },
              input: {
                startAdornment: <InputAdornment position="start">SGD</InputAdornment>,
              },
            }}
          />
          <div role="group" aria-label="Quick amounts" className={styles.chips}>
            {QUICK_AMOUNTS.map((quick) => (
              <Button
                key={quick}
                variant="secondary"
                onClick={() =>
                  setValue('amount', String(quick), {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true,
                  })
                }
              >
                {quick}
              </Button>
            ))}
          </div>
          <p className={styles.limits}>Available {formatMoney(balance)}</p>
          <p className={styles.limits}>Remaining daily limit {formatMoney(remaining)}</p>
        </div>

        <div>
          <TextField
            id="note"
            label="Note (optional)"
            autoComplete="off"
            fullWidth
            {...field('note')}
          />
          <p className={styles.counter}>
            {watch('note').length}/{NOTE_MAX_LENGTH}
          </p>
        </div>
      </div>
    </>
  )
}
