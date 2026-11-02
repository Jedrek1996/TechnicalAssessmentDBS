import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { muiTheme } from '../styles/theme/muiTheme'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {/* MUI's styles go first, so our CSS modules override them instead of losing ties. */}
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
      </StyledEngineProvider>
    </QueryClientProvider>
  )
}
