import { TextField } from '@mui/material'
import { BANKS } from '../../../../constants/transfer'
import { useTransferField } from '../../../../hooks/useTransferField'
import styles from '../../../../styles/components/transfer/recipient/NewRecipientFields.module.css'

export function NewRecipientFields() {
  const field = useTransferField()
  // Registered in the order they appear: on a failed Continue the form focuses the first
  // invalid field in registration order.
  const name = field('newRecipient.name')
  const account = field('newRecipient.accountNumber')
  const bank = field('newRecipient.bank')

  return (
    <div className={styles.fields}>
      <TextField
        id="new-recipient-name"
        label="Recipient name"
        autoComplete="off"
        fullWidth
        {...name}
      />
      <TextField
        id="new-recipient-account"
        label="Account number"
        fullWidth
        {...account}
        helperText={account.helperText ?? '8 digits'}
        slotProps={{ htmlInput: { inputMode: 'numeric', autoComplete: 'off' } }}
      />
      <TextField
        id="new-recipient-bank"
        label="Bank"
        select
        fullWidth
        {...bank}
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      >
        <option value="">Select a bank</option>
        {BANKS.map((bank) => (
          <option key={bank} value={bank}>
            {bank}
          </option>
        ))}
      </TextField>
    </div>
  )
}
