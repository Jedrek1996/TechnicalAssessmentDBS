import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { muiTheme } from '../styles/theme/muiTheme'

// Fresh QueryClient per test; retry is off so failures show immediately.
export function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>{ui}</ThemeProvider>
    </QueryClientProvider>,
  )
}
