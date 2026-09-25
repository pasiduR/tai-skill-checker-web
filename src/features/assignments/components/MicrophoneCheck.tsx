import { useEffect } from "react"
import { Mic, RefreshCw } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useMicrophoneCheck } from "../hooks/useMicrophoneCheck"

export function MicrophoneCheck({ onReadyChange }: { onReadyChange: (ready: boolean, deviceId: string) => void }) {
  const microphone = useMicrophoneCheck()
  const ready = microphone.status === "READY"

  useEffect(() => onReadyChange(ready, microphone.selectedDeviceId), [microphone.selectedDeviceId, onReadyChange, ready])

  const run = async (deviceId?: string) => {
    onReadyChange(false, deviceId ?? microphone.selectedDeviceId)
    await microphone.check(deviceId)
  }

  return <div className="space-y-5 rounded-2xl border bg-white p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div><h2 className="font-semibold">Microphone check</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Allow access, then speak normally to confirm your input level.</p></div>
      <div className={`grid size-10 shrink-0 place-items-center rounded-full ${ready ? "bg-brand-soft text-primary" : "bg-muted text-muted-foreground"}`}><Mic className="size-5" /></div>
    </div>
    {microphone.devices.length > 1 && <div className="space-y-2"><Label htmlFor="microphone">Microphone</Label><select id="microphone" className="w-full" value={microphone.selectedDeviceId} onChange={(event) => void run(event.target.value)}>{microphone.devices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${index + 1}`}</option>)}</select></div>}
    {ready && <div className="space-y-2"><div className="flex justify-between text-xs"><span>Input level</span><span className="text-muted-foreground">Speak to test</span></div><Progress value={microphone.level} aria-label="Microphone input level" /></div>}
    {microphone.status === "DENIED" && <p className="text-sm text-destructive" role="alert">Microphone access was denied. Allow access in your browser settings, then try again.</p>}
    {microphone.status === "ERROR" && <p className="text-sm text-destructive" role="alert">We could not access a microphone. Check that one is connected and available.</p>}
    <Button variant={ready ? "outline" : "default"} onClick={() => void run(microphone.selectedDeviceId || undefined)} loading={microphone.status === "REQUESTING"}>
      {ready ? <RefreshCw /> : <Mic />}{microphone.status === "REQUESTING" ? "Checking…" : ready ? "Test again" : "Check microphone"}
    </Button>
  </div>
}
