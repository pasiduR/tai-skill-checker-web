import { useCallback, useEffect, useRef, useState } from "react"

type MicrophoneStatus = "IDLE" | "REQUESTING" | "READY" | "DENIED" | "ERROR"

export function useMicrophoneCheck() {
  const [status, setStatus] = useState<MicrophoneStatus>("IDLE")
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const [level, setLevel] = useState(0)
  const streamRef = useRef<MediaStream | undefined>(undefined)
  const contextRef = useRef<AudioContext | undefined>(undefined)
  const frameRef = useRef<number | undefined>(undefined)

  const stop = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    void contextRef.current?.close()
    streamRef.current = undefined
    contextRef.current = undefined
    setLevel(0)
  }, [])

  const check = useCallback(async (deviceId?: string) => {
    stop()
    setStatus("REQUESTING")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: deviceId ? { deviceId: { exact: deviceId } } : true })
      streamRef.current = stream
      const inputs = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput")
      setDevices(inputs)
      const activeId = stream.getAudioTracks()[0]?.getSettings().deviceId ?? deviceId ?? ""
      setSelectedDeviceId(activeId)
      const context = new AudioContext()
      contextRef.current = context
      const analyser = context.createAnalyser()
      analyser.fftSize = 256
      context.createMediaStreamSource(stream).connect(analyser)
      const samples = new Uint8Array(analyser.frequencyBinCount)
      const update = () => {
        analyser.getByteFrequencyData(samples)
        const average = samples.reduce((sum, value) => sum + value, 0) / samples.length
        setLevel(Math.min(100, Math.round((average / 90) * 100)))
        frameRef.current = requestAnimationFrame(update)
      }
      update()
      setStatus("READY")
    } catch (error) {
      setStatus(error instanceof DOMException && error.name === "NotAllowedError" ? "DENIED" : "ERROR")
    }
  }, [stop])

  useEffect(() => stop, [stop])

  return { status, devices, selectedDeviceId, level, check, stop }
}
