import type { AttemptTurn } from "../types"

const speakerLabel = { EMPLOYEE: "Employee", AGENT: "Interviewer", SYSTEM: "System" } as const

export function Transcript({ turns, emptyMessage = "Waiting for the conversation to begin…" }: { turns: AttemptTurn[]; emptyMessage?: string }) {
  if (turns.length === 0) return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  return <ol className="space-y-5" aria-label="Transcript">
    {turns.map((turn) => <li id={`turn-${turn.id}`} key={turn.id} className="scroll-mt-24 rounded-2xl border bg-white p-4 target:border-primary target:bg-brand-soft sm:p-5">
      <div className="flex items-center justify-between gap-4"><p className="text-xs font-semibold text-primary">{speakerLabel[turn.speaker]}</p><span className="font-mono text-[11px] text-muted-foreground">#{turn.sequence}</span></div>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{turn.content}</p>
    </li>)}
  </ol>
}
