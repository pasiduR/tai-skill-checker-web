import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, CalendarClock, CheckCircle2, LockKeyhole, LogOut } from "lucide-react"
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom"
import { queryKeys } from "@/api"
import { BrandMark } from "@/components/shared/BrandMark"
import { ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { signOut, useAuth } from "@/features/auth"
import { acceptInvitation, getInvitation } from "../api/invitations"
import { matchesInvitationEmail } from "../invitationAccess"

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
  const switchAccount = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear()
      navigate("/sign-in", { replace: true, state: { from: location.pathname } })
    },
  })

  if (!token) return <Navigate to="/" replace />
  if (invitation.isLoading) return <main className="page-shell py-16"><PageSkeleton /></main>
  if (invitation.error || !invitation.data) {
    const expired = "code" in (invitation.error ?? {}) && (invitation.error as { code?: string }).code === "INVITATION_EXPIRED"
    return <main className="grid min-h-screen place-items-center bg-muted p-6"><div className="w-full max-w-lg"><BrandMark /><div className="mt-8"><ErrorNotice message={expired ? "This invitation has expired. Ask your administrator for a new invitation." : "This invitation is invalid or no longer available."} /></div></div></main>
  }

  const data = invitation.data
  const wrongAccount = Boolean(auth.session && !matchesInvitationEmail(auth.session.user.email, data.email))
  const continueToAssessment = () => {
    if (!auth.session) {
      navigate("/sign-in", { state: { from: location.pathname } })
      return
    }
    if (!wrongAccount) accept.mutate()
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
          {wrongAccount ? <Button size="lg" onClick={() => switchAccount.mutate()} disabled={switchAccount.isPending}>
            <LogOut />{switchAccount.isPending ? "Signing out…" : "Switch account"}
          </Button> : <Button size="lg" onClick={continueToAssessment} disabled={auth.isLoading || accept.isPending}>
            {accept.isPending ? "Accepting…" : auth.session ? "Accept invitation" : "Sign in to continue"}<ArrowRight />
          </Button>}
        </div>
        {wrongAccount && <div className="px-6 pb-8 sm:px-10"><Alert><AlertTitle>Use the invited account</AlertTitle><AlertDescription>You are signed in as {auth.session?.user.email}. Switch accounts and sign in as {data.email} to accept this invitation.</AlertDescription></Alert></div>}
        {switchAccount.error && <div className="px-6 pb-8 sm:px-10"><ErrorNotice message="We could not sign you out. Refresh the page and try again." /></div>}
        {!wrongAccount && accept.error && <div className="px-6 pb-8 sm:px-10"><ErrorNotice message={accept.error.message} /></div>}
      </section>
    </div>
  </main>
}
