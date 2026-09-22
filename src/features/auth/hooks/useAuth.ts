import { useQuery } from "@tanstack/react-query"
import { ApiError, queryKeys } from "@/api"
import { getMembership, getSession } from "../api/auth"
import type { AuthRole } from "../types"

export function useAuth() {
  const session = useQuery({ queryKey: queryKeys.session, queryFn: getSession, retry: false })
  const role = useQuery({
    queryKey: queryKeys.membership(session.data?.user.id),
    enabled: Boolean(session.data?.user),
    retry: false,
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
