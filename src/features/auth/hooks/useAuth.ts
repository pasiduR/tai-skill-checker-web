import { useQuery } from "@tanstack/react-query"
import { ApiError, queryKeys } from "@/api"
import { getMembership, getSession } from "../api/auth"
import type { AuthRole } from "../types"

// Session and role only change on sign-in/out or invitation acceptance, which invalidate them explicitly.
const AUTH_STALE_TIME = 5 * 60 * 1_000

export function useAuth() {
  const session = useQuery({ queryKey: queryKeys.session, queryFn: getSession, retry: false, staleTime: AUTH_STALE_TIME })
  const role = useQuery({
    queryKey: queryKeys.membership(session.data?.user.id),
    enabled: Boolean(session.data?.user),
    retry: false,
    staleTime: AUTH_STALE_TIME,
    queryFn: async (): Promise<AuthRole> => {
      try {
        return (await getMembership()).role
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) return "UNASSIGNED"
        throw error
      }
    },
  })
  return { session: session.data ?? null, role: role.data, isLoading: session.isLoading || (Boolean(session.data) && role.isLoading), error: session.error ?? role.error }
}
