import { useQuery } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { api, queryKeys } from "@/api"
import { cn } from "@/lib/utils"

// Cover URLs are versioned by the backend, so each fetched image is immutable and its object URL can be cached for the session.
export function CoverImage({ url, alt = "", className, fallback = null }: { url: string | null; alt?: string; className?: string; fallback?: ReactNode }) {
  const query = useQuery({
    queryKey: queryKeys.coverImage(url ?? ""),
    queryFn: async () => URL.createObjectURL(await api.blob(url!)),
    enabled: Boolean(url),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  })
  if (!url) return fallback
  // The skeleton takes the image's own classes so it fills exactly the space the image will occupy.
  if (query.isPending) return <div role="status" aria-label="Loading cover image" className={cn(className, "cover-skeleton")} />
  if (!query.data) return fallback
  return <img src={query.data} alt={alt} className={cn(className, "animate-in fade-in-0 duration-300")} />
}
