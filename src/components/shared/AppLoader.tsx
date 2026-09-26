import logo from "@/assets/logo.png"
import { BarsLoader } from "@/components/ui/bars-loader"

/** Full-screen splash shown while the session is being resolved, before any layout renders. */
export function AppLoader({ label = "Loading TAI Skill Checker…" }: { label?: string }) {
  return <main role="status" aria-live="polite" className="grid min-h-dvh place-items-center bg-white">
    <div className="flex flex-col items-center gap-6">
      <span className="relative grid size-20 place-items-center">
        <span className="app-loader-ring absolute inset-0 rounded-full bg-primary/15" aria-hidden="true" />
        <img src={logo} alt="" className="app-loader-logo relative size-14" />
      </span>
      <BarsLoader size="md" className="text-primary" />
      <span className="sr-only">{label}</span>
    </div>
  </main>
}
