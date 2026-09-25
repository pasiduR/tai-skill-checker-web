import { useCallback, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { AlertTriangle, ArrowRight, Check, ShieldAlert } from "@/components/ui/icons"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { InvitationPreview } from "@/features/invitations/api/invitations"
import { startAttempt } from "../api/assignments"
import { useAssignmentPreparation } from "../hooks/useAssignmentPreparation"
import { mockPreparation } from "@/lib/skeletonFixtures"
import type { AssignmentPreparation } from "../types"
import { MicrophoneCheck } from "./MicrophoneCheck"

export function PreparationPage() {
  const { assignmentId = "" } = useParams()
  const preparation = useAssignmentPreparation(assignmentId)
  const location = useLocation()
  const invitation = (location.state as { invitation?: InvitationPreview } | null)?.invitation
  const interrupted = Boolean((location.state as { interrupted?: boolean } | null)?.interrupted)

  if (preparation.isLoading || preparation.isFetching) return <PreparationSkeleton />
  if (preparation.error || !preparation.data) return <ErrorNotice message={preparation.error?.message ?? "This assessment is unavailable."} />
  if (preparation.data.status === "COMPLETED") return <Navigate to={`/assessment/${assignmentId}/completed`} replace />
  return <PreparationView assignmentId={assignmentId} data={preparation.data} invitation={invitation} interrupted={interrupted} />
}

export function PreparationSkeleton() {
  return <PageSkeleton name="employee-preparation" fixture={<PreparationView assignmentId="as0" data={mockPreparation} interrupted={false} />} />
}

function PreparationView({ assignmentId, data, invitation, interrupted }: { assignmentId: string; data: AssignmentPreparation; invitation?: InvitationPreview; interrupted: boolean }) {
  const navigate = useNavigate()
  const [microphoneReady, setMicrophoneReady] = useState(false)
  const [microphoneDeviceId, setMicrophoneDeviceId] = useState("")
  const handleMicrophoneReady = useCallback((ready: boolean, deviceId: string) => {
    setMicrophoneReady(ready)
    setMicrophoneDeviceId(deviceId)
  }, [])
  const start = useMutation({
    mutationFn: () => startAttempt(assignmentId),
    onSuccess: (connection) => navigate(`/assessment/${assignmentId}/session`, { state: { connection, assessmentTitle: data.name, microphoneDeviceId } }),
  })

  const competencies = data.competencies.length > 0 ? data.competencies : invitation?.assessment.competencies ?? []
  const unavailable = data.attemptsRemaining < 1 || data.status !== "READY"

  return <div className="mx-auto max-w-4xl space-y-8">
    <header className="max-w-3xl"><div className="flex flex-wrap items-center gap-3"><p className="eyebrow">Assessment preparation</p><Badge variant="secondary"><span className="font-mono">{data.attemptsRemaining}</span> attempt{data.attemptsRemaining === 1 ? "" : "s"} remaining</Badge></div><h1 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">{data.name}</h1><p className="mt-5 text-base leading-7 text-muted-foreground">{data.description}</p></header>

    <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
      <div className="space-y-8">
        {interrupted && <Alert variant="destructive"><AlertTriangle /><AlertTitle>Previous attempt ended</AlertTitle><AlertDescription>The interrupted attempt was consumed. Complete the microphone check again if you want to use another available attempt.</AlertDescription></Alert>}
        <section><h2 className="text-lg font-semibold">How to prepare</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{data.preparationInstructions || "Find a quiet place and answer each prompt in your own words."}</p></section>
        {competencies.length > 0 && <section><h2 className="text-lg font-semibold">Competencies covered</h2><ul className="mt-4 space-y-3">{competencies.map((competency) => <li key={competency.name} className="flex gap-3 rounded-2xl bg-muted p-4"><Check className="mt-0.5 size-4 shrink-0 text-primary" /><div><p className="text-sm font-semibold">{competency.name}</p>{competency.description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{competency.description}</p>}</div></li>)}</ul></section>}
        <Alert><ShieldAlert /><AlertTitle>An attempt starts when you continue</AlertTitle><AlertDescription>If you close this page, disconnect, or end early after starting, the attempt is consumed. Interrupted attempts cannot be resumed. You may start again only while attempts remain.</AlertDescription></Alert>
      </div>
      <div className="space-y-5"><MicrophoneCheck onReadyChange={handleMicrophoneReady} />
        {unavailable ? <Alert variant="destructive"><AlertTriangle /><AlertTitle>Assessment unavailable</AlertTitle><AlertDescription>{data.attemptsRemaining < 1 ? "You have used all available attempts." : "This assignment cannot be started."}</AlertDescription></Alert> : <Button size="lg" className="w-full" disabled={!microphoneReady || start.isPending} onClick={() => start.mutate()}>{start.isPending ? "Starting secure session…" : "Start assessment"}<ArrowRight /></Button>}
        {!microphoneReady && !unavailable && <p className="text-center text-xs text-muted-foreground">Complete the microphone check to enable the assessment.</p>}
        {start.error && <ErrorNotice message={start.error.message} />}
      </div>
    </div>
  </div>
}
