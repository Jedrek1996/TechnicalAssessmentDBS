import { Dialog, useMediaQuery } from '@mui/material'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import type { Account, Customer } from '../../api/types'
import { muiTheme } from '../../styles/theme/muiTheme'
import { TRANSFER_TITLE_ID, TransferFlow } from './TransferFlow'

interface TransferDialogProps {
  open: boolean
  onClose: () => void
  customer: Customer
  accounts: Account[]
  returnFocusTo: HTMLElement | null
}

export function TransferDialog({
  open,
  onClose,
  customer,
  accounts,
  returnFocusTo,
}: TransferDialogProps) {
  const fullScreen = useMediaQuery('(max-width: 1023px)')

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={muiTheme}>
        <Dialog
          open={open}
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
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
