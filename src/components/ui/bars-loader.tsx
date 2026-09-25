import { cn } from "@/lib/utils"

const BAR_COUNT = 4

/**
 * Audio-bar micro animation used for every loading state (buttons, inline, page).
 * Bars inherit `currentColor`, so they match the surrounding text or button label.
 */
export function BarsLoader({ size = "sm", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  return <span aria-hidden="true" data-size={size} className={cn("bars-loader", className)}>
    {Array.from({ length: BAR_COUNT }, (_, index) => <span key={index} style={{ animationDelay: `${index * 120}ms` }} />)}
  </span>
}

/** Centered loading state for whole pages or panels. */
export function PageLoader({ label = "Loading…", className }: { label?: string; className?: string }) {
  return <div role="status" aria-live="polite" className={cn("grid min-h-[40vh] place-items-center", className)}>
    <div className="flex flex-col items-center gap-4 text-primary"><BarsLoader size="lg" /><p className="text-sm text-muted-foreground">{label}</p></div>
  </div>
}

/** Small inline loading row, e.g. inside a card while secondary data loads. */
export function InlineLoader({ label = "Loading…", className }: { label?: string; className?: string }) {
  return <div role="status" aria-live="polite" className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}><BarsLoader className="text-primary" />{label}</div>
}
