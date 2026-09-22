import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, CalendarClock, CheckCircle2, LockKeyhole } from "lucide-react"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { queryKeys } from "@/api"
import { BrandMark } from "@/components/shared/BrandMark"
import { ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/features/auth"
import { acceptInvitation, getInvitation } from "../api/invitations"

export function InvitationEntryPage() {
  const { token = "" } = useParams()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const invitation = useQuery({ queryKey: queryKeys.invitation(token), queryFn: () => getInvitation(token), enabled: Boolean(token), retry: false })
  const accept = useMutation({
    mutationFn: () => acceptInvitation(token),
    onSuccess: async (assignment) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.membership(auth.session?.user.id) })
      navigate(`/assessment/${assignment.id}/prepare`, { replace: true, state: { invitation: invitation.data } })
    },
  })

  if (!token) return <Navigate to="/" replace />
  if (invitation.isLoading) return <main className="page-shell py-16"><PageSkeleton /></main>
  if (invitation.error || !invitation.data) {
    const expired = "code" in (invitation.error ?? {}) && (invitation.error as { code?: string }).code === "INVITATION_EXPIRED"
    return <main className="grid min-h-screen place-items-center bg-muted p-6"><div className="w-full max-w-lg"><BrandMark /><div className="mt-8"><ErrorNotice message={expired ? "This invitation has expired. Ask your administrator for a new invitation." : "This invitation is invalid or no longer available."} /></div></div></main>
  }

  const data = invitation.data
  const continueToAssessment = () => {
    if (!auth.session) {
      navigate("/sign-in", { state: { from: location.pathname } })
      return
    }
    accept.mutate()
  }

  return <main className="min-h-screen bg-[#f7f7f7] px-5 py-8 sm:px-8 sm:py-14">
    <div className="mx-auto max-w-3xl">
      <BrandMark />
      <section className="mt-8 overflow-hidden rounded-3xl border bg-white sm:mt-12">
        <div className="border-b px-6 py-8 sm:px-10 sm:py-10">
          <p className="eyebrow">Private assessment invitation</p>
          <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">{data.assessment.name}</h1>
          <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">{data.assessment.description}</p>
        </div>
        <div className="grid gap-8 px-6 py-8 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" /><p>Invited for <strong>{data.email}</strong></p></div>
            <div className="flex items-start gap-3"><CalendarClock className="mt-0.5 size-5 shrink-0 text-primary" /><p>Invitation expires {new Date(data.expiresAt).toLocaleString()}</p></div>
            <div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 size-5 shrink-0 text-primary" /><p>Your scenarios, evaluator guidance, and results stay private.</p></div>
          </div>
          <Button size="lg" onClick={continueToAssessment} disabled={auth.isLoading || accept.isPending}>
            {accept.isPending ? "Accepting…" : auth.session ? "Accept invitation" : "Sign in to continue"}<ArrowRight />
          </Button>
        </div>
        {accept.error && <div className="px-6 pb-8 sm:px-10"><ErrorNotice message={accept.error.message} /></div>}
      </section>
    </div>
  </main>
}
