import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/api'
import { ErrorNotice, GenericPageSkeleton } from '@/components/shared/AsyncState'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Sliders, VoiceActivity } from '@/components/ui/icons'
import { Textarea } from '@/components/ui/textarea'
import { createAgentTestSession, endAgentTestSession, getAgentSettings, updateAgentSettings } from '../api/agentSettings'
import { agentVoices, type AgentSettings, type AgentTestConnection } from '../types'
import { AgentTestPanel } from './AgentTestPanel'

function FieldHint({ children }: { children: React.ReactNode }) { return <p className="text-xs leading-5 text-muted-foreground">{children}</p> }

export function AgentSettingsPage() {
  const queryClient = useQueryClient()
  const settingsQuery = useQuery({ queryKey: queryKeys.agentSettings, queryFn: getAgentSettings })
  const [form, setForm] = useState<AgentSettings | null>(null)
  const [connection, setConnection] = useState<AgentTestConnection | null>(null)
  useEffect(() => { if (settingsQuery.data) setForm(settingsQuery.data) }, [settingsQuery.data])

  const save = useMutation({
    mutationFn: updateAgentSettings,
    onSuccess: (value) => { setForm(value); queryClient.setQueryData(queryKeys.agentSettings, value) },
  })
  const start = useMutation({
    mutationFn: async (settings: AgentSettings) => { const saved = await updateAgentSettings(settings); queryClient.setQueryData(queryKeys.agentSettings, saved); setForm(saved); return createAgentTestSession() },
    onSuccess: setConnection,
  })
  const end = useMutation({
    mutationFn: (roomName: string) => endAgentTestSession(roomName),
    onSettled: () => setConnection(null),
  })

  if (settingsQuery.isLoading || !form) return <GenericPageSkeleton />
  if (settingsQuery.error) return <ErrorNotice message={settingsQuery.error.message} />
  const set = <K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) => setForm((current) => current ? { ...current, [key]: value } : current)
  const mutationError = save.error ?? start.error ?? end.error

  return <div className="space-y-7">
    <header className="border-b pb-5"><p className="eyebrow">Workspace settings</p><h1 className="font-display mt-1.5 text-3xl sm:text-4xl">Voice agent</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Shape how the interviewer speaks, then open a private LiveKit room to test the current configuration before employees hear it.</p></header>
    {mutationError && <ErrorNotice message={mutationError.message} />}
    {save.isSuccess && !save.isPending && <Alert><AlertTitle>Configuration saved</AlertTitle><AlertDescription>New assessment and test sessions will use these settings.</AlertDescription></Alert>}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-secondary"><Sliders /></span><div><CardTitle>Conversation</CardTitle><CardDescription>Organization-wide guidance layered onto the protected assessment workflow.</CardDescription></div></div></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2"><Label htmlFor="system-prompt">System prompt</Label><Textarea id="system-prompt" className="min-h-44 resize-y leading-6" value={form.systemPrompt} maxLength={8000} onChange={(event) => set('systemPrompt', event.target.value)} /><div className="flex justify-between gap-4"><FieldHint>Set tone, speaking style, and interview behavior. Security rules, scenario order, and scoring boundaries remain fixed.</FieldHint><span className="shrink-0 text-xs text-muted-foreground">{form.systemPrompt.length}/8000</span></div></div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="welcome-message">Opening message</Label><Textarea id="welcome-message" className="min-h-28 resize-y" value={form.welcomeMessage} maxLength={1000} onChange={(event) => set('welcomeMessage', event.target.value)} /><FieldHint>Spoken once when the participant joins.</FieldHint></div>
              <div className="space-y-2"><Label htmlFor="closing-message">Closing message</Label><Textarea id="closing-message" className="min-h-28 resize-y" value={form.closingMessage} maxLength={1000} onChange={(event) => set('closingMessage', event.target.value)} /><FieldHint>Spoken after the final scenario is completed.</FieldHint></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Voice & response</CardTitle><CardDescription>Gemini Live generation settings supported by the current LiveKit agent.</CardDescription></CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="voice">Voice</Label><select id="voice" className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" value={form.voice} onChange={(event) => set('voice', event.target.value as AgentSettings['voice'])}>{agentVoices.map((voice) => <option key={voice}>{voice}</option>)}</select><FieldHint>Voice changes apply to newly started sessions.</FieldHint></div>
            <div className="space-y-2"><Label htmlFor="max-tokens">Maximum response tokens</Label><Input id="max-tokens" type="number" min={64} max={8192} value={form.maxOutputTokens} onChange={(event) => set('maxOutputTokens', Number(event.target.value))} /><FieldHint>Caps response length and helps control latency.</FieldHint></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="temperature">Temperature</Label><span className="text-xs font-medium">{form.temperature.toFixed(1)}</span></div><Input id="temperature" type="range" min={0} max={2} step={0.1} value={form.temperature} onChange={(event) => set('temperature', Number(event.target.value))} /><FieldHint>Lower is more consistent; higher is more varied.</FieldHint></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="top-p">Top P</Label><span className="text-xs font-medium">{form.topP.toFixed(2)}</span></div><Input id="top-p" type="range" min={0} max={1} step={0.05} value={form.topP} onChange={(event) => set('topP', Number(event.target.value))} /><FieldHint>Controls how broadly the model samples words.</FieldHint></div>
          </CardContent>
        </Card>
        <div className="flex flex-wrap items-center gap-3"><Button loading={save.isPending} disabled={start.isPending || !form.systemPrompt.trim() || !form.welcomeMessage.trim() || !form.closingMessage.trim()} onClick={() => save.mutate(form)}><Save />{save.isPending ? 'Saving…' : 'Save changes'}</Button><p className="text-xs text-muted-foreground">Active calls keep the configuration they started with.</p></div>
      </div>
      <aside className="xl:sticky xl:top-24">
        {connection ? <AgentTestPanel connection={connection} ending={end.isPending} onEnd={() => end.mutate(connection.roomName)} /> : <Card className="overflow-hidden"><div className="bg-[#111317] px-6 py-8 text-white"><span className="grid size-12 place-items-center rounded-2xl bg-primary text-white"><VoiceActivity className="!size-7" /></span><h2 className="mt-6 text-2xl font-semibold">Test the agent</h2><p className="mt-2 text-sm leading-6 text-white/60">Start a private, unrecorded call using the values currently in this form. Your browser will request microphone access.</p></div><CardContent className="space-y-4 pt-5 sm:pt-6"><div className="space-y-2 text-sm"><p className="flex justify-between gap-4"><span className="text-muted-foreground">Voice</span><span className="font-medium">{form.voice}</span></p><p className="flex justify-between gap-4"><span className="text-muted-foreground">Session</span><span className="font-medium">Private · unrecorded</span></p></div><Button className="w-full" size="lg" loading={start.isPending} disabled={save.isPending} onClick={() => start.mutate(form)}><VoiceActivity />{start.isPending ? 'Starting test…' : 'Save & start test'}</Button><FieldHint>LiveKit usage and Gemini API usage may apply during the test.</FieldHint></CardContent></Card>}
      </aside>
    </div>
  </div>
}
