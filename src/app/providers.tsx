import { StyledEngineProvider } from "@mui/material/styles"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false }, mutations: { retry: false } } })

export function AppProviders({ children }: { children: ReactNode }) {
  return <StyledEngineProvider injectFirst><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></StyledEngineProvider>
}
