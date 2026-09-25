import { useQuery } from "@tanstack/react-query"
import { ArrowRight, CheckCircle2, Clock3, RotateCcw } from "@/components/ui/icons"
import { Link } from "react-router-dom"
import { queryKeys } from "@/api"
import { EmptyState, ErrorNotice, PageSkeleton } from "@/components/shared/AsyncState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { listEmployeeAssignments, type EmployeeAssignmentSummary } from "@/features/assignments"
import { mockEmployeeAssignments } from "@/lib/skeletonFixtures"

function assignmentState(assignment: EmployeeAssignmentSummary) {
  if (assignment.status === "COMPLETED") return { label: "Completed", icon: CheckCircle2 }
  if (assignment.status === "EXPIRED") return { label: "Expired", icon: Clock3 }
  if (assignment.hasActiveAttempt) return { label: "In progress", icon: Clock3 }
  if (assignment.attemptsRemaining < 1) return { label: "No attempts remaining", icon: Clock3 }
  if (assignment.latestAttemptStatus === "ABANDONED") return { label: "Ready to try again", icon: RotateCcw }
  return { label: "Ready", icon: ArrowRight }
}

export function EmployeeHome() {
  const assignments = useQuery({ queryKey: queryKeys.employeeAssignments, queryFn: listEmployeeAssignments })

  if (assignments.isLoading) return <EmployeeHomeSkeleton />
  if (assignments.error) return <ErrorNotice message="Your assessments could not be loaded." />
  if (!assignments.data?.length) return <EmptyState title="No assessments yet" description="Accepted assessment invitations will appear here." />
  return <EmployeeHomeView assignments={assignments.data} />
}

export function EmployeeHomeSkeleton() {
  return <PageSkeleton name="employee-home" fixture={<EmployeeHomeView assignments={mockEmployeeAssignments} />} />
}

function EmployeeHomeView({ assignments }: { assignments: EmployeeAssignmentSummary[] }) {
  return <div className="space-y-8">
    <header className="max-w-3xl">
      <p className="eyebrow">Employee workspace</p>
      <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">Your assessments</h1>
      <p className="mt-4 leading-7 text-muted-foreground">Prepare, start an available attempt, or review the status of work you have already submitted.</p>
    </header>
    <div className="grid gap-5 lg:grid-cols-2">
      {assignments.map((assignment) => {
        const state = assignmentState(assignment)
        const StateIcon = state.icon
        const canStart = assignment.status === "READY" && assignment.attemptsRemaining > 0 && !assignment.hasActiveAttempt
        return <Card key={assignment.assignmentId} className="flex flex-col shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-xl">{assignment.name}</CardTitle>
              <Badge variant={assignment.status === "COMPLETED" ? "default" : "secondary"}><StateIcon className="mr-1 size-3" />{state.label}</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-5">
            <p className="text-sm leading-6 text-muted-foreground">{assignment.description}</p>
            {assignment.status === "COMPLETED"
              ? <p className="text-sm font-medium">Submitted successfully</p>
              : <p className="text-sm"><span className="font-mono font-semibold">{assignment.attemptsRemaining}</span> attempt{assignment.attemptsRemaining === 1 ? "" : "s"} remaining</p>}
          </CardContent>
          {canStart && <CardFooter><Button asChild><Link to={`/assessment/${assignment.assignmentId}/prepare`}>{assignment.latestAttemptStatus === "ABANDONED" ? "Try again" : "Prepare assessment"}<ArrowRight /></Link></Button></CardFooter>}
        </Card>
      })}
    </div>
  </div>
}
