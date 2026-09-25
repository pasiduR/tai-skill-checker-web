import { CheckCircle2, LockKeyhole } from "@/components/ui/icons"
import { Navigate, useParams } from "react-router-dom"
import { ErrorNotice } from "@/components/shared/AsyncState"
import { PageLoader } from "@/components/ui/bars-loader"
import { useAssignmentPreparation } from "../hooks/useAssignmentPreparation"

export function CompletedPage() {
  const { assignmentId = "" } = useParams()
  const preparation = useAssignmentPreparation(assignmentId)
  if (preparation.isLoading || preparation.isFetching) return <PageLoader />
  if (preparation.error || !preparation.data) return <ErrorNotice message={preparation.error?.message ?? "This assessment is unavailable."} />
  if (preparation.data.status !== "COMPLETED") return <Navigate to={`/assessment/${assignmentId}/prepare`} replace />
  return <CompletedView name={preparation.data.name} />
}

function CompletedView({ name }: { name: string }) {
  return <section className="mx-auto max-w-2xl rounded-3xl border bg-white px-6 py-12 text-center sm:px-12 sm:py-16">
    <div className="mx-auto grid size-14 place-items-center rounded-full bg-brand-soft text-primary"><CheckCircle2 className="size-7" /></div>
    <p className="eyebrow mt-7">Assessment submitted</p>
    <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">Thank you. You’re finished.</h1>
    <p className="mx-auto mt-5 max-w-lg leading-7 text-muted-foreground">Your responses for <strong className="text-foreground">{name}</strong> were submitted successfully. Your organization will handle the next steps.</p>
    <div className="mx-auto mt-8 flex max-w-md items-start gap-3 rounded-2xl bg-muted p-4 text-left text-sm leading-6"><LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" /><p>This assignment is now locked. Scores and evaluator output are shared only with authorized administrators.</p></div>
  </section>
}
