import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/api"
import { createObserverConnection, getAttemptInspection, getAttemptRecording, listActiveAttempts } from "../api/attempts"
import { shouldPollAttemptInspection } from "../polling"

export const useActiveAttempts = () => useQuery({
  queryKey: queryKeys.activeAttempts,
  queryFn: listActiveAttempts,
  refetchInterval: 5_000,
})

export const useAttemptInspection = (attemptId: string, live = false) => useQuery({
  queryKey: queryKeys.attemptInspection(attemptId),
  queryFn: () => getAttemptInspection(attemptId),
  enabled: Boolean(attemptId),
  refetchInterval: live ? 2_000 : (query) => {
    return shouldPollAttemptInspection(query.state.data) ? 5_000 : false
  },
})

export const useObserverConnection = (attemptId: string, enabled: boolean) => useQuery({
  queryKey: queryKeys.observerConnection(attemptId),
  queryFn: () => createObserverConnection(attemptId),
  enabled: Boolean(attemptId) && enabled,
  staleTime: Infinity,
  retry: false,
  refetchOnWindowFocus: false,
})

export const useAttemptRecording = (attemptId: string, enabled: boolean) => useQuery({
  queryKey: queryKeys.attemptRecording(attemptId),
  queryFn: () => getAttemptRecording(attemptId),
  enabled: Boolean(attemptId) && enabled,
  staleTime: 4 * 60 * 1_000,
  retry: false,
})
