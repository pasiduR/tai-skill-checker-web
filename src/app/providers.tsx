import { StyledEngineProvider } from "@mui/material/styles"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { configureBoneyard } from "boneyard-js/react"
import type { ReactNode } from "react"

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false }, mutations: { retry: false } } })

configureBoneyard({ color: "#eef0f3", darkColor: "#16181c", animate: "shimmer", shimmerColor: "#f7f7f7", darkShimmerColor: "#25282d", speed: "1.8s", transition: 180, select: "viewport" })

export function AppProviders({ children }: { children: ReactNode }) {
  return <StyledEngineProvider injectFirst><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></StyledEngineProvider>
}
