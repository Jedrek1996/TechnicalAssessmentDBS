import { Dialog, useMediaQuery } from '@mui/material'
import type { Account, Customer } from '../../api/types'
import { TRANSFER_TITLE_ID, TransferFlow } from './TransferFlow'

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  customer: Customer
  accounts: Account[]
  /** The button that opened the dialog. */
  returnFocusTo: HTMLElement | null
}

// Centred on desktop (1024px and up), a full-screen sheet below that. MUI's Dialog
// provides the focus trap and Esc to close. Focus goes back to the opener explicitly,
// because Safari doesn't focus a button when it is clicked, so there'd be nothing to restore.
export function TransferDialog({
  open,
  onClose,
  customer,
  accounts,
  returnFocusTo,
}: TransferDialogProps) {
  const fullScreen = useMediaQuery('(max-width: 1023px)')

  return (
    <Dialog
      open={open}
      // Clicking the backdrop must not throw away what has been typed.
      onClose={(_event, reason) => {
        if (reason !== 'backdropClick') onClose()
      }}
      fullScreen={fullScreen}
      fullWidth
      disableRestoreFocus
      aria-labelledby={TRANSFER_TITLE_ID}
      slotProps={{
        paper: { sx: fullScreen ? undefined : { maxWidth: 520 } },
        transition: { onExited: () => returnFocusTo?.focus() },
      }}
    >
      <TransferFlow customer={customer} accounts={accounts} onClose={onClose} />
    </Dialog>
  )
}
