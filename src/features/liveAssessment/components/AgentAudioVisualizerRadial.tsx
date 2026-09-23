import { useMemo, type CSSProperties, type ComponentProps } from "react"
import { useMultibandTrackVolume, type AgentState, type TrackReferenceOrPlaceholder } from "@livekit/components-react"
import type { LocalAudioTrack, RemoteAudioTrack } from "livekit-client"
import { cn } from "@/lib/utils"
import { useRadialVisualizerAnimator } from "../hooks/useRadialVisualizerAnimator"
import { normalizeVolumeBands } from "../radialVisualizer"

type AudioTrack = LocalAudioTrack | RemoteAudioTrack | TrackReferenceOrPlaceholder

type AgentAudioVisualizerRadialProps = ComponentProps<"div"> & {
  state?: AgentState
  color?: `#${string}`
  radius?: number
  barCount?: number
  audioTrack?: AudioTrack
  volumeBands?: number[]
}

// Adapted from LiveKit's Agents UI radial audio visualizer.
export function AgentAudioVisualizerRadial({
  state = "connecting",
  color,
  radius = 54,
  barCount = 24,
  audioTrack,
  volumeBands,
  className,
  style,
  ...props
}: AgentAudioVisualizerRadialProps) {
  const trackVolume = useMultibandTrackVolume(audioTrack, { bands: barCount, loPass: 100, hiPass: 200 })
  const bands = volumeBands ? normalizeVolumeBands(volumeBands, barCount) : trackVolume
  const sequenceInterval = state === "initializing" ? 250 : state === "connecting" || state === "listening" ? 500 : state === "thinking" ? Infinity : 1000
  const highlightedIndices = useRadialVisualizerAnimator(state, barCount, sequenceInterval)
  const dotSize = useMemo(() => (radius * Math.PI) / barCount, [barCount, radius])

  return <div
    data-lk-state={state}
    className={cn("relative", state === "thinking" && "animate-spin [animation-duration:5s]", className)}
    style={{ ...style, color } as CSSProperties}
    {...props}
  >
    {bands.map((band, index) => {
      const angle = (index / barCount) * Math.PI * 2
      const highlighted = highlightedIndices.includes(index)
      return <div
        key={`${barCount}-${index}`}
        className="absolute left-1/2 top-1/2 size-1 -translate-x-1/2 -translate-y-1/2"
        style={{ transform: `rotate(${angle}rad) translateY(${radius}px)` }}
      >
        <span
          className={cn("absolute left-1/2 top-1/2 origin-bottom -translate-x-1/2 rounded-full bg-current/15 transition-[height,background-color] duration-150 ease-linear", highlighted && "bg-current")}
          data-lk-index={index}
          data-lk-highlighted={highlighted}
          style={{ width: dotSize, minHeight: dotSize, height: state === "speaking" ? `${Math.max(dotSize, dotSize * 7 * band)}px` : dotSize }}
        />
      </div>
    })}
  </div>
}
