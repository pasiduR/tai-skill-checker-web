import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useRoomContext,
  useTranscriptions,
  useVoiceAssistant,
} from "@livekit/components-react"
import { AudioWaveform, MessageSquareText, Mic, MicOff, PhoneOff, ShieldCheck } from "lucide-react"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { ConnectionState, Track } from "livekit-client"
import { queryKeys } from "@/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { resolveSessionState, sessionStateLabel, sessionStateShortLabel } from "../sessionState"
import type { AssessmentSessionLocationState } from "../types"

function SessionRoom({ assignmentId, assessmentTitle, failed }: { assignmentId: string; assessmentTitle: string; failed: boolean }) {
  const room = useRoomContext()
  const connectionState = useConnectionState()
  const { agent, state: agentState, audioTrack } = useVoiceAssistant()
  const { localParticipant, isMicrophoneEnabled, microphoneTrack } = useLocalParticipant()
  const employeeSpeaking = useIsSpeaking(localParticipant)
  const transcriptions = useTranscriptions()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [ending, setEnding] = useState(false)
  const sawAgent = useRef(false)
  const wasConnected = useRef(false)
  const completed = useRef(false)
  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (agent) sawAgent.current = true
    if (!agent && sawAgent.current && !ending) {
      completed.current = true
      void queryClient.invalidateQueries({ queryKey: queryKeys.assignmentPreparation(assignmentId) })
      void room.disconnect().finally(() => navigate(`/assessment/${assignmentId}/completed`, { replace: true }))
    }
  }, [agent, assignmentId, ending, navigate, queryClient, room])

  useEffect(() => {
    if (connectionState === ConnectionState.Connected) wasConnected.current = true
    if ((connectionState === ConnectionState.Reconnecting || connectionState === ConnectionState.Disconnected) && wasConnected.current && !ending && !completed.current) {
      if (connectionState === ConnectionState.Reconnecting) void room.disconnect()
      void queryClient.invalidateQueries({ queryKey: queryKeys.assignmentPreparation(assignmentId) })
        .finally(() => navigate(`/assessment/${assignmentId}/prepare`, { replace: true, state: { interrupted: true } }))
    }
  }, [assignmentId, connectionState, ending, navigate, queryClient, room])

  const state = resolveSessionState({ connectionState, agentState, employeeSpeaking, ending, failed })
  const hasTranscript = transcriptions.some((entry) => entry.text.trim().length > 0)
  const latestTranscriptText = transcriptions.at(-1)?.text

  useEffect(() => {
    if (!hasTranscript) return
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" })
  }, [hasTranscript, latestTranscriptText, transcriptions.length])

  const end = async () => {
    setEnding(true)
    await room.disconnect()
    await queryClient.invalidateQueries({ queryKey: queryKeys.assignmentPreparation(assignmentId) })
    navigate(`/assessment/${assignmentId}/prepare`, { replace: true, state: { interrupted: true } })
  }

  return <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-surface-dark text-white">
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><AudioWaveform className="size-4" /></span><div className="min-w-0"><p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#a8acb3]">Live interview</p><h1 className="truncate text-sm font-semibold sm:text-base">{assessmentTitle}</h1></div></div>
      <Badge className="shrink-0 border border-white/10 bg-white/10 text-white hover:bg-white/10" aria-label={sessionStateLabel[state]}><span className={`mr-2 size-2 rounded-full ${state === "ERROR" || state === "DISCONNECTED" ? "bg-red-400" : state === "CONNECTING" ? "bg-amber-300" : "bg-primary"}`} /><span className="sm:hidden">{sessionStateShortLabel[state]}</span><span className="hidden sm:inline">{sessionStateLabel[state]}</span></Badge>
    </header>

    <main className={cn("grid min-h-0 flex-1 overflow-y-auto lg:overflow-hidden", hasTranscript ? "grid-rows-[minmax(300px,0.8fr)_minmax(340px,1.2fr)] lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.46fr)] lg:grid-rows-1" : "grid-cols-1")}>
      <section className={cn("relative flex min-h-0 flex-col items-center justify-center overflow-hidden px-6 py-8 text-center sm:px-10", hasTranscript && "border-b border-white/10 lg:border-r lg:border-b-0")}>
        <div className={cn("absolute rounded-full border border-white/[0.06] transition-all duration-700", agentState === "speaking" || employeeSpeaking ? "size-72 scale-110 border-primary/20" : "size-64")} aria-hidden="true" />
        <div className={cn("relative grid size-24 place-items-center rounded-full border transition-all duration-300 sm:size-28", agentState === "speaking" ? "border-primary/40 bg-primary text-primary-foreground shadow-[0_0_80px_rgba(250,102,25,0.18)]" : employeeSpeaking ? "border-white/30 bg-white text-foreground shadow-[0_0_80px_rgba(255,255,255,0.12)]" : "border-white/10 bg-[#16181c] text-primary")}><Mic className="size-9 sm:size-10" /></div>
        <p className="relative mt-7 text-[11px] font-medium uppercase tracking-[0.14em] text-primary">{sessionStateLabel[state]}</p>
        <h2 className="relative mt-2 font-display text-2xl sm:text-3xl">{agentState === "speaking" ? "Listen to the interviewer" : employeeSpeaking ? "We’re listening" : state === "CONNECTING" ? "Preparing your interview" : "Take your time"}</h2>
        <p className="relative mt-2 max-w-md text-sm leading-6 text-[#a8acb3]">{agentState === "speaking" ? "You’ll have space to respond when the interviewer finishes." : employeeSpeaking ? "Speak naturally. You do not need to rush your answer." : "Answer naturally when you are ready. Pauses are completely fine."}</p>
        <BarVisualizer
          className="session-visualizer relative mt-7 flex h-14 w-full max-w-xs items-center justify-center gap-1"
          state={agentState}
          track={agentState === "speaking" ? audioTrack : microphoneTrack ? { participant: localParticipant, publication: microphoneTrack, source: Track.Source.Microphone } : undefined}
          barCount={9}
        />
        {!hasTranscript && <div className="relative mt-8 flex items-center gap-2 text-xs text-[#7c828a]"><MessageSquareText className="size-4" />Transcript will appear after the conversation begins</div>}
        {failed && <p className="relative mt-5 text-sm text-red-300" role="alert">The realtime connection failed. This attempt cannot be resumed.</p>}
      </section>

      {hasTranscript && <aside className="flex min-h-0 flex-col bg-[#111316] animate-in fade-in slide-in-from-right-3 duration-300" aria-label="Live transcript">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6"><div><div className="flex items-center gap-2"><MessageSquareText className="size-4 text-primary" /><h2 className="text-sm font-semibold">Live transcript</h2></div><p className="mt-1 text-xs text-[#7c828a]">Updates while you speak</p></div><span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#a8acb3]"><span className="size-1.5 animate-pulse rounded-full bg-primary" />Live</span></div>
        <div ref={transcriptRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6" aria-live="polite" aria-relevant="additions text">
          {transcriptions.map((entry, index) => {
            const employee = entry.participantInfo.identity.startsWith("employee-")
            if (!entry.text.trim()) return null
            return <div key={`${entry.participantInfo.identity}-${index}`} className={cn("flex flex-col", employee ? "items-end" : "items-start")}><p className="mb-1.5 px-1 text-[11px] font-medium text-[#a8acb3]">{employee ? "You" : "Interviewer"}</p><p className={cn("max-w-[92%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6", employee ? "rounded-br-md bg-white text-foreground" : "rounded-bl-md border border-white/10 bg-[#1a1d21] text-white/90")}>{entry.text}</p></div>
          })}
        </div>
        <div className="flex shrink-0 items-center gap-2 border-t border-white/10 px-5 py-3 text-[11px] text-[#7c828a] sm:px-6"><ShieldCheck className="size-3.5" />Live captions may contain transcription errors.</div>
      </aside>}
    </main>

    <footer className="flex shrink-0 items-center justify-center border-t border-white/10 bg-[#0a0b0d]/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="flex w-full max-w-xl items-center justify-between gap-3"><Button variant="secondary" onClick={() => void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)} disabled={ending}>{isMicrophoneEnabled ? <Mic /> : <MicOff />}{isMicrophoneEnabled ? "Mute" : "Unmute"}</Button><div className="hidden items-center gap-2 text-xs text-[#7c828a] sm:flex"><ShieldCheck className="size-4" />Secure assessment session</div><Button variant="destructive" onClick={() => void end()} disabled={ending}><PhoneOff />{ending ? "Ending…" : "End interview"}</Button></div>
    </footer>
    <RoomAudioRenderer />
  </div>
}

export function AssessmentSessionPage() {
  const { assignmentId = "" } = useParams()
  const location = useLocation()
  const session = (location.state as AssessmentSessionLocationState | null)
  const [error, setError] = useState(false)
  if (!session?.connection || !assignmentId) return <Navigate to={`/assessment/${assignmentId}/prepare`} replace />
  return <LiveKitRoom
    serverUrl={session.connection.url}
    token={session.connection.token}
    connect
    audio={session.microphoneDeviceId ? { deviceId: { exact: session.microphoneDeviceId } } : true}
    video={false}
    onError={() => setError(true)}
    onMediaDeviceFailure={() => setError(true)}
    className="contents"
  >
    <SessionRoom assignmentId={assignmentId} assessmentTitle={session.assessmentTitle} failed={error} />
    {error && <p className="sr-only" role="alert">The LiveKit connection failed.</p>}
  </LiveKitRoom>
}
