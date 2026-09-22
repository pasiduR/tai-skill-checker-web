import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { CheckCircle2, Mail, XCircle } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAssessment } from "@/features/assessments/hooks/useAssessment"
import { PageHeader } from "@/features/assessments/components/PageHeader"
import { inviteEmployees } from "../api/invitations"
import { emailsSchema } from "../schemas"

export function InvitePage() {
  const { id = "" } = useParams()
  const assessment = useAssessment(id)
  const [value, setValue] = useState("")
  const [validationError, setValidationError] = useState<string>()
  const mutation = useMutation({ mutationFn: (emails: string[]) => inviteEmployees(id, emails), onSuccess: () => { setValue(""); setValidationError(undefined) } })
  if (assessment.isLoading) return <PageSkeleton />
  if (assessment.error || !assessment.data) return <ErrorNotice message={assessment.error?.message ?? "Assessment not found."} />
  const send = () => { const parsed = emailsSchema.safeParse(value); if (!parsed.success) { setValidationError(parsed.error.issues[0]?.message ?? "Check the email addresses."); return } setValidationError(undefined); mutation.mutate(parsed.data) }
  return <div className="space-y-8"><PageHeader eyebrow="Employee invitations" title={`Invite to ${assessment.data.name}`} description="Enter up to 100 employee email addresses. Each person receives a unique, expiring invitation." actions={<Button variant="outline" asChild><Link to={`/admin/assessments/${id}`}>Back to assessment</Link></Button>} /><Card className="max-w-2xl shadow-none"><CardHeader><CardTitle>Email employees</CardTitle><CardDescription>Separate addresses with commas or new lines.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="emails">Employee emails</Label><Textarea id="emails" rows={7} value={value} onChange={(event) => setValue(event.target.value)} placeholder={"alex@example.com\nsam@example.com"} /></div>{(validationError || mutation.error) && <p className="text-sm text-destructive" role="alert">{validationError ?? mutation.error?.message}</p>}<Button disabled={mutation.isPending || !value.trim()} onClick={send}><Mail />{mutation.isPending ? "Sending invitations…" : "Send invitations"}</Button></CardContent></Card>
    {mutation.data && <Card className="max-w-2xl shadow-none"><CardHeader><CardTitle>Delivery status</CardTitle><CardDescription>Invitations expire {new Date(mutation.data.expiresAt).toLocaleString()}.</CardDescription></CardHeader><CardContent className="divide-y">{mutation.data.invitations.map((item) => <div key={item.invitationId} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-2">{item.sent ? <CheckCircle2 className="size-4 text-primary" /> : <XCircle className="size-4 text-destructive" />}<span className="truncate text-sm">{item.email}</span></div><Badge variant={item.sent ? "default" : "destructive"}>{item.sent ? "Sent" : "Failed"}</Badge></div>)}</CardContent></Card>}
  </div>
}
