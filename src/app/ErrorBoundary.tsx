import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

type State = { failed: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }
  static getDerivedStateFromError(): State { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Application error", error, info.componentStack) }
  render() {
    if (this.state.failed) return <main className="grid min-h-screen place-items-center p-6"><div className="max-w-md text-center"><h1 className="text-2xl font-semibold">This page could not be displayed</h1><p className="mt-2 text-sm text-muted-foreground">Reload the page to try again. Your saved assessment data is unaffected.</p><Button className="mt-6" onClick={() => window.location.reload()}>Reload page</Button></div></main>
    return this.props.children
  }
}
