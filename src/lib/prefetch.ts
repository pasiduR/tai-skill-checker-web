import { useQueryClient, type FetchQueryOptions, type QueryKey } from "@tanstack/react-query"
import { useCallback } from "react"

/**
 * Returns pointer/focus handlers that warm the cache for a link's destination page.
 * `prefetchQuery` is a no-op while cached data is still fresh, so repeated hovers cost nothing.
 */
export function usePrefetchOnIntent() {
  const queryClient = useQueryClient()
  return useCallback(<T, TKey extends QueryKey>(options: FetchQueryOptions<T, Error, T, TKey>) => {
    const prefetch = () => void queryClient.prefetchQuery(options)
    return { onPointerEnter: prefetch, onFocus: prefetch }
  }, [queryClient])
}
