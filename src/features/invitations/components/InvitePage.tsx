import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Mail, RotateCcw, XCircle } from "@/components/ui/icons"
import { useParams } from "react-router-dom"
import { queryKeys } from "@/api"
import { ErrorNotice, InlineSkeleton, PageSkeleton } from "@/components/shared/AsyncState"
import { FieldError } from "@/components/shared/FieldError"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/features/assessments/components/PageHeader"
import { useAssessment } from "@/features/assessments/hooks/useAssessment"
import type { AssessmentSummary } from "@/features/assessments/types"
import { mockAssessment, mockEmployeeInvitations } from "@/lib/skeletonFixtures"
import { inviteEmployees, listEmployeeInvitations, reinviteEmployee, type EmployeeInvitation } from "../api/invitations"
import { emailsSchema } from "../schemas"

export function InvitePage() {
  const { id = "" } = useParams()
  const assessment = useAssessment(id)
  const employees = useQuery({ queryKey: queryKeys.assessmentInvitations(id), queryFn: () => listEmployeeInvitations(id), enabled: Boolean(id) })
  if (assessment.isLoading) return <InviteSkeleton />
  if (assessment.error || !assessment.data) return <ErrorNotice message={assessment.error?.message ?? "Assessment not found."} />
  return <InviteView assessment={assessment.data} employees={employees} />
}

export function InviteSkeleton() {
  return <PageSkeleton name="admin-invite" fixture={<InviteView assessment={mockAssessment} employees={{ data: mockEmployeeInvitations, isLoading: false, error: null }} />} />
}

function InviteView({ assessment, employees }: { assessment: AssessmentSummary; employees: { data?: EmployeeInvitation[]; isLoading: boolean; error: Error | null } }) {
  const id = assessment.id
  const queryClient = useQueryClient()
  const [value, setValue] = useState("")
  const [validationError, setValidationError] = useState<string>()
  const [selected, setSelected] = useState<EmployeeInvitation>()
  const invite = useMutation({
    mutationFn: (emails: string[]) => inviteEmployees(id, emails),
    onSuccess: async () => {
      setValue("")
      setValidationError(undefined)
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessmentInvitations(id) })
    },
  })
  const reinvite = useMutation({
    mutationFn: (invitationId: string) => reinviteEmployee(id, invitationId),
    onSuccess: async () => {
      setSelected(undefined)
      await queryClient.invalidateQueries({ queryKey: queryKeys.assessmentInvitations(id) })
    },
  })

  const send = () => {
    const parsed = emailsSchema.safeParse(value)
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? "Check the email addresses.")
      return
    }
    setValidationError(undefined)
    invite.mutate(parsed.data)
  }

  return <div className="space-y-8">
    <PageHeader eyebrow="Employee invitations" title={`Invite to ${assessment.name}`} description="Send invitations, review employee access, and grant a fresh set of attempts when someone needs to try again." />

    <Card className="max-w-2xl shadow-none">
      <CardHeader><CardTitle>Email employees</CardTitle><CardDescription>Separate up to 100 addresses with commas or new lines.</CardDescription></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label htmlFor="emails">Employee emails</Label><Textarea id="emails" rows={7} value={value} aria-invalid={Boolean(validationError)} aria-describedby={validationError ? "emails-error" : undefined} onChange={(event) => { setValue(event.target.value); setValidationError(undefined) }} placeholder={"alex@example.com\nsam@example.com"} /><FieldError id="emails-error" message={validationError} /></div>
        {invite.error && <p className="text-sm text-destructive" role="alert">{invite.error.message}</p>}
        <Button loading={invite.isPending} disabled={!value.trim()} onClick={send}><Mail />{invite.isPending ? "Sending invitations…" : "Send invitations"}</Button>
      </CardContent>
    </Card>

    {invite.data && <Card className="max-w-2xl shadow-none">
      <CardHeader><CardTitle>Delivery status</CardTitle><CardDescription>Invitations expire {new Date(invite.data.expiresAt).toLocaleString()}.</CardDescription></CardHeader>
      <CardContent className="divide-y">{invite.data.invitations.map((item) => <div key={item.invitationId} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-2">{item.sent ? <CheckCircle2 className="size-4 text-primary" /> : <XCircle className="size-4 text-destructive" />}<span className="truncate text-sm">{item.email}</span></div><Badge variant={item.sent ? "default" : "destructive"}>{item.sent ? "Sent" : "Failed"}</Badge></div>)}</CardContent>
    </Card>}

    <Card className="shadow-none">
      <CardHeader><CardTitle>Invited employees</CardTitle><CardDescription>Reinviting rotates the invitation link and grants the employee a fresh set of attempts. Previous attempts and reports remain available.</CardDescription></CardHeader>
      <CardContent>
        {employees.isLoading && <InlineSkeleton variant="rows" />}
        {employees.error && <ErrorNotice message={employees.error.message} />}
        {employees.data?.length === 0 && <p className="text-sm text-muted-foreground">No employees have been invited yet.</p>}
        {employees.data && employees.data.length > 0 && <div className="divide-y">
          {employees.data.map((employee) => <div key={employee.invitationId} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-medium">{employee.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{employee.assignmentStatus.toLowerCase()}</Badge>
                <span>{employee.attemptsRemaining} attempts remaining</span>
                <span aria-hidden="true">·</span>
                <span>{employee.attemptsUsed} used in current allowance</span>
              </div>
            </div>
            <Button variant="outline" onClick={() => { reinvite.reset(); setSelected(employee) }}><RotateCcw />Reinvite and reset</Button>
          </div>)}
        </div>}
      </CardContent>
    </Card>

    {reinvite.data && <Alert variant={reinvite.data.sent ? "default" : "destructive"}><AlertTitle>{reinvite.data.sent ? "Employee reinvited" : "Attempts reset, but email failed"}</AlertTitle><AlertDescription>{reinvite.data.sent ? `${reinvite.data.email} received a new invitation and has ${reinvite.data.attemptsRemaining} attempts available.` : `Try reinviting ${reinvite.data.email} again to send a new link.`}</AlertDescription></Alert>}

    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open && !reinvite.isPending) setSelected(undefined) }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Reinvite employee?</DialogTitle><DialogDescription>A new invitation will be sent to {selected?.email}. Their attempt allowance will reset, while prior attempts and reports stay in the audit history.{selected?.hasActiveAttempt ? " The unfinished session will be ended." : ""}</DialogDescription></DialogHeader>
        {reinvite.error && <ErrorNotice message={reinvite.error.message} />}
        <DialogFooter><Button variant="outline" disabled={reinvite.isPending} onClick={() => setSelected(undefined)}>Cancel</Button><Button loading={reinvite.isPending} disabled={!selected} onClick={() => selected && reinvite.mutate(selected.invitationId)}><RotateCcw />{reinvite.isPending ? "Reinviting" : "Reinvite and reset"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
}
