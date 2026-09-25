import type { SVGProps } from "react"

/** Sidebar toggle glyph: a panel with its left rail marked. Same icon for open and collapsed states. */
export function PanelLeft(props: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <rect x="3.5" y="4" width="17" height="16" rx="2.5" />
    <path d="M9.5 4v16" />
  </svg>
}
