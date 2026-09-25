import { normalizeBone, type ResponsiveBones } from "boneyard-js"
import { Skeleton as BoneyardSkeleton } from "boneyard-js/react"
import { useEffect, useState, type ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function BasicFallback() {
  return <div className="space-y-4"><div className="h-8 w-64 rounded-lg bg-muted" /><div className="h-32 rounded-2xl bg-muted" /><div className="h-32 rounded-2xl bg-muted" /></div>
}

const capturedBones = Object.fromEntries(Object.entries(import.meta.glob<ResponsiveBones>("../../bones/*.bones.json", { eager: true, import: "default" }))
  .map(([path, bones]) => [path.split("/").pop()!.replace(".bones.json", ""), bones]))

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return width
}

// boneyard's runtime draws only content bones and drops container bones (cards, panels, hero surfaces).
// Draw those captured surfaces as faint outlines underneath so the skeleton keeps the page's card structure.
function SurfaceOutlines({ name }: { name: string }) {
  const viewportWidth = useViewportWidth()
  const breakpoints = capturedBones[name]?.breakpoints
  if (!breakpoints) return null
  const widths = Object.keys(breakpoints).map(Number).sort((a, b) => a - b)
  const match = [...widths].reverse().find((width) => viewportWidth >= width) ?? widths[0]
  const layout = match === undefined ? undefined : breakpoints[match]
  if (!layout) return null
  return <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: layout.height }} aria-hidden="true">
    {layout.bones.map(normalizeBone).filter((bone) => bone.c).map((bone, index) => <div key={index} className="absolute border border-border bg-[#fcfcfc]" style={{ left: `${bone.x}%`, top: bone.y, width: `${bone.w}%`, height: bone.h, borderRadius: typeof bone.r === "number" ? `${bone.r}px` : bone.r }} />)}
  </div>
}

// Only render a fallback when nothing was captured: boneyard measures whatever renders first and scales
// every bone to that height, so a fallback shown for one frame squashes the whole skeleton.
const fallbackFor = (name: string, fallback: ReactNode) => (capturedBones[name] ? null : fallback)

/**
 * Page-level loading skeleton. `fixture` should be the page's real view rendered with mock data:
 * `npm run bones` snapshots it from the /__boneyard/* galleries so the bones match the real layout.
 */
export function PageSkeleton({ name, fixture }: { name: string; fixture: ReactNode }) {
  return <div role="status" aria-label="Loading" className="relative"><SurfaceOutlines name={name} /><BoneyardSkeleton name={name} loading fixture={fixture} fallback={fallbackFor(name, <BasicFallback />)} select="viewport">{null}</BoneyardSkeleton><span className="sr-only">Loading…</span></div>
}

function GenericFixture() {
  return <div className="space-y-7"><header className="border-b pb-5"><p className="eyebrow">Loading workspace</p><h1 className="font-display mt-1.5 text-3xl sm:text-4xl">Preparing your workspace</h1><p className="mt-2 max-w-2xl text-sm leading-6">Checking your session and loading the page you requested.</p></header><div className="grid gap-4 md:grid-cols-2">{[1, 2].map((item) => <article key={item} className="rounded-2xl border p-6"><h2 className="text-xl">Workspace section</h2><p className="mt-3 text-sm">Content for this section is loading.</p></article>)}</div></div>
}

/** For loading states where the destination page isn't known yet (auth checks, lazy routes). */
export function GenericPageSkeleton() {
  return <PageSkeleton name="page-generic" fixture={<GenericFixture />} />
}

export function InlineSkeleton({ variant = "line" }: { variant?: "line" | "rows" }) {
  const fixture = variant === "rows" ? <div className="divide-y">{[1, 2, 3].map((item) => <div key={item} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">employee@example.com</p><p className="mt-2 text-sm">ready · 3 attempts remaining</p></div><button className="h-10 rounded-full border px-4 text-sm">Reinvite and reset</button></div>)}</div> : <p className="text-sm">Preparing secure content for display…</p>
  return <div role="status" aria-label="Loading"><BoneyardSkeleton name={`inline-${variant}`} loading fixture={fixture} fallback={fallbackFor(`inline-${variant}`, <div className={variant === "rows" ? "h-36 rounded-2xl bg-muted" : "h-5 w-56 rounded bg-muted"} />)}>{null}</BoneyardSkeleton><span className="sr-only">Loading…</span></div>
}

export function ErrorNotice({ message }: { message: string }) {
  return <Alert variant="destructive" role="alert"><AlertTitle>Something went wrong</AlertTitle><AlertDescription>{message}</AlertDescription></Alert>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="rounded-2xl border bg-white px-5 py-9 text-center sm:px-6"><h2 className="text-lg font-semibold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>{action && <div className="mt-5">{action}</div>}</div>
}
