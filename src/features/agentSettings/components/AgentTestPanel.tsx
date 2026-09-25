import { useState } from 'react'
import { LiveKitRoom, RoomAudioRenderer, useConnectionState, useLocalParticipant, useTranscriptions, useVoiceAssistant } from '@livekit/components-react'
import { ConnectionState } from 'livekit-client'
import { Mic, MicOff, PhoneOff, VoiceActivity } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { AgentTestConnection } from '../types'
import { agentTestStateLabel, resolveAgentTestState } from '../testState'

function TestRoom({ ending, onEnd }: { ending: boolean; onEnd: () => void }) {
  const connectionState = useConnectionState()
  const { agent, state: agentState } = useVoiceAssistant()
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant()
  const transcriptions = useTranscriptions()
  const [previewingEnding, setPreviewingEnding] = useState(false)
  const latest = [...transcriptions].reverse().find((item) => item.text.trim())
  const connected = connectionState === ConnectionState.Connected
  const testState = resolveAgentTestState({ connectionState, hasAgent: Boolean(agent), agentState })

  return <div className="flex min-h-[31rem] flex-col rounded-2xl bg-[#111317] p-5 text-white sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">Live preview</p><h2 className="mt-1 text-xl font-semibold">Talk to your agent</h2></div>
      <Badge className="border border-white/10 bg-white/10 text-white hover:bg-white/10"><span className={`mr-2 size-2 rounded-full ${agent ? 'bg-emerald-400' : 'bg-amber-300'}`} />{agentTestStateLabel[testState]}</Badge>
    </div>
    <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
      <div className={`grid size-28 place-items-center rounded-full border transition-all ${agentState === 'speaking' ? 'border-primary/50 bg-primary text-white shadow-[0_0_50px_rgba(250,102,25,0.28)]' : 'border-white/10 bg-white/5 text-primary'}`}><VoiceActivity className="!size-12" /></div>
      <p className="mt-6 text-sm font-medium">{agentTestStateLabel[testState]}</p>
      {connected && !agent && <p className="mt-2 max-w-sm text-xs leading-5 text-amber-200/80">Your browser is connected. The configured worker has not joined yet.</p>}
      <div className="mt-5 min-h-20 max-w-md" aria-live="polite">{latest ? <><p className="text-xs uppercase tracking-wider text-white/40">Latest transcript</p><p className="mt-2 text-sm leading-6 text-white/80">{latest.text}</p></> : <p className="text-sm leading-6 text-white/45">The opening message and live transcript will appear here.</p>}</div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
      <Button variant="secondary" disabled={!connected || ending} onClick={() => void localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}>{isMicrophoneEnabled ? <Mic /> : <MicOff />}{isMicrophoneEnabled ? 'Mute' : 'Unmute'}</Button>
      <div className="flex items-center gap-2"><Button className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" variant="outline" loading={previewingEnding} disabled={!connected || ending} onClick={() => { setPreviewingEnding(true); void localParticipant.sendText('Finish this preview now and say the configured closing message.', { topic: 'lk.chat' }).finally(() => setPreviewingEnding(false)) }}>{previewingEnding ? 'Requesting…' : 'Preview ending'}</Button><Button variant="destructive" loading={ending} onClick={onEnd}><PhoneOff />{ending ? 'Ending…' : 'End test'}</Button></div>
    </div>
    <RoomAudioRenderer />
  </div>
}

export function AgentTestPanel({ connection, ending, onEnd }: { connection: AgentTestConnection; ending: boolean; onEnd: () => void }) {
  const [error, setError] = useState(false)
  return <LiveKitRoom serverUrl={connection.url} token={connection.token} connect audio video={false} onError={() => setError(true)} onMediaDeviceFailure={() => setError(true)}>
    <TestRoom ending={ending} onEnd={onEnd} />
    {error && <p className="mt-3 text-sm text-destructive" role="alert">The test room could not access LiveKit or your microphone.</p>}
  </LiveKitRoom>
}
