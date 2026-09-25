import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowRight, CalendarClock, CheckCircle2, LockKeyhole, LogOut } from "@/components/ui/icons"
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { queryKeys } from "@/api"
import { BrandMark } from "@/components/shared/BrandMark"
import { ErrorNotice, GenericPageSkeleton } from "@/components/shared/AsyncState"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { signOut, useAuth } from "@/features/auth"
import { acceptInvitation, getInvitation, requestInvitationSignIn } from "../api/invitations"
import { matchesInvitationEmail } from "../invitationAccess"

export function InvitationEntryPage() {
  const { token = "" } = useParams()
  const [searchParams] = useSearchParams()
  const magicLinkError = searchParams.get("error")
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const invitation = useQuery({ queryKey: queryKeys.invitation(token), queryFn: () => getInvitation(token), enabled: Boolean(token) && !magicLinkError, retry: false })
  const accept = useMutation({
    mutationFn: () => acceptInvitation(token),
    onSuccess: async (assignment) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.membership(auth.session?.user.id) })
      navigate(`/assessment/${assignment.id}/prepare`, { replace: true, state: { invitation: invitation.data } })
    },
  })
  const requestSignIn = useMutation({ mutationFn: () => requestInvitationSignIn(token) })
  const switchAccount = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear()
      requestSignIn.mutate()
    },
  })

  if (!token) return <Navigate to="/" replace />
  if (auth.isLoading) return <main className="page-shell py-16"><GenericPageSkeleton /></main>
  if (magicLinkError) {
    if (auth.session && auth.role === "EMPLOYEE") return <Navigate to="/employee" replace />
    return <main className="grid min-h-screen place-items-center bg-muted p-6">
      <section className="w-full max-w-lg rounded-3xl border bg-white p-8 sm:p-10">
        <BrandMark />
        <p className="eyebrow mt-10">Secure link used</p>
        <h1 className="font-display mt-3 text-4xl leading-tight">This sign-in link is no longer valid.</h1>
        <p className="mt-5 leading-7 text-muted-foreground">Magic links work once. Request a fresh link to return to your employee dashboard and available assessments.</p>
        <Button className="mt-8" size="lg" asChild><Link to="/employee/sign-in">Request a new sign-in link<ArrowRight /></Link></Button>
      </section>
    </main>
  }
  if (invitation.isLoading) return <main className="page-shell py-16"><GenericPageSkeleton /></main>
  if (invitation.error || !invitation.data) {
    if (auth.session && auth.role === "EMPLOYEE") return <Navigate to="/employee" replace />
    const expired = "code" in (invitation.error ?? {}) && (invitation.error as { code?: string }).code === "INVITATION_EXPIRED"
    return <main className="grid min-h-screen place-items-center bg-muted p-6"><div className="w-full max-w-lg"><BrandMark /><div className="mt-8"><ErrorNotice message={expired ? "This invitation has expired. Ask your administrator for a new invitation." : "This invitation is invalid or has already been accepted."} /></div>{!expired && <Button className="mt-6" asChild><Link to="/employee/sign-in">Go to employee sign-in<ArrowRight /></Link></Button>}</div></main>
  }

  const data = invitation.data
  const wrongAccount = Boolean(auth.session && !matchesInvitationEmail(auth.session.user.email, data.email))
  const continueToAssessment = () => {
    if (!auth.session) {
      requestSignIn.mutate()
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
          </Button> : <Button size="lg" onClick={continueToAssessment} disabled={auth.isLoading || accept.isPending || requestSignIn.isPending || requestSignIn.isSuccess}>
            {accept.isPending ? "Accepting…" : requestSignIn.isPending ? "Sending…" : requestSignIn.isSuccess ? "Link sent" : auth.session ? "Accept invitation" : "Email me a secure sign-in link"}<ArrowRight />
          </Button>}
        </div>
        {requestSignIn.isSuccess && <div className="px-6 pb-8 sm:px-10"><Alert><AlertTitle>Check your inbox</AlertTitle><AlertDescription>We sent a fresh secure sign-in link to {data.email}. It expires shortly.</AlertDescription></Alert></div>}
        {wrongAccount && <div className="px-6 pb-8 sm:px-10"><Alert><AlertTitle>Use the invited account</AlertTitle><AlertDescription>You are signed in as {auth.session?.user.email}. We will sign you out and email a secure link to {data.email}.</AlertDescription></Alert></div>}
        {switchAccount.error && <div className="px-6 pb-8 sm:px-10"><ErrorNotice message="We could not sign you out. Refresh the page and try again." /></div>}
        {!wrongAccount && accept.error && <div className="px-6 pb-8 sm:px-10"><ErrorNotice message={accept.error.message} /></div>}
        {requestSignIn.error && <div className="px-6 pb-8 sm:px-10"><ErrorNotice message={requestSignIn.error.message} /></div>}
      </section>
    </div>
  </main>
}
