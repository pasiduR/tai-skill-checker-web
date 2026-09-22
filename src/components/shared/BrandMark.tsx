import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

export function BrandMark({ to = "/", inverted = false, compact = false }: { to?: string; inverted?: boolean; compact?: boolean }) {
  return <Link to={to} className={cn("inline-flex items-center gap-3 font-semibold tracking-[-0.02em]", inverted ? "text-white" : "text-foreground")} aria-label="TAI Skill Checker home">
    <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-[#0a0b0d]">T</span>
    {!compact && <span>TAI <span className={inverted ? "text-white/60" : "text-muted-foreground"}>Skill Checker</span></span>}
  </Link>
}
