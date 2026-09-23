import { useEffect, useRef, useState } from "react"
import type { AgentState } from "@livekit/components-react"

function connectingSequence(barCount: number): number[][] {
  const opposite = Math.floor(barCount / 2)
  return Array.from({ length: barCount }, (_, index) => [index, (index + opposite) % barCount])
}

function listeningSequence(barCount: number): number[][] {
  const groups = barCount > 8 ? 4 : 2
  return Array.from({ length: groups }, (_, group) =>
    Array.from({ length: Math.floor(barCount / groups) }, (_, index) => index * groups + group),
  )
}

export function useRadialVisualizerAnimator(state: AgentState | undefined, barCount: number, interval: number): number[] {
  const [index, setIndex] = useState(0)
  const sequence = state === "thinking" || state === "listening"
    ? listeningSequence(barCount)
    : state === "connecting" || state === "initializing"
      ? connectingSequence(barCount)
      : state === "speaking"
        ? [Array.from({ length: barCount }, (_, item) => item)]
        : [[]]
  const sequenceLength = sequence.length
  const animationFrame = useRef<number | null>(null)

  useEffect(() => {
    setIndex(0)
  }, [barCount, state])

  useEffect(() => {
    let startedAt = performance.now()
    const animate = (time: DOMHighResTimeStamp) => {
      if (time - startedAt >= interval) {
        setIndex((current) => current + 1)
        startedAt = time
      }
      animationFrame.current = requestAnimationFrame(animate)
    }
    animationFrame.current = requestAnimationFrame(animate)
    return () => {
      if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current)
    }
  }, [barCount, interval, sequenceLength, state])

  return sequence[index % sequenceLength] ?? []
}
