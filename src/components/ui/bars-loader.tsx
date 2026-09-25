import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

// Peak height of each bar (fraction of the loader height) and its start delay: centre-weighted, rippling outward.
const BARS = [
  { peak: 0.6, delay: 160 },
  { peak: 0.86, delay: 80 },
  { peak: 1, delay: 0 },
  { peak: 0.84, delay: 80 },
  { peak: 0.56, delay: 160 },
]

/**
 * Audio-bar micro animation used for every loading state (buttons, inline, page).
 * Bars inherit `currentColor`, so they match the surrounding text or button label.
 */
export function BarsLoader({ size = "sm", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  return <span aria-hidden="true" data-size={size} className={cn("bars-loader", className)}>
    {BARS.map(({ peak, delay }, index) => <span key={index} style={{ "--peak": peak, animationDelay: `${delay}ms` } as CSSProperties} />)}
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
