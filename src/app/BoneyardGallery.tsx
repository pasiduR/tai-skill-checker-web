import { GenericPageSkeleton, InlineSkeleton } from "@/components/shared/AsyncState"
import { AdminDashboardSkeleton } from "@/features/assessments/components/AdminDashboard"
import { AssessmentDetailSkeleton } from "@/features/assessments/components/AssessmentDetailPage"
import { AssessmentEditorSkeleton } from "@/features/assessments/components/AssessmentEditorPage"
import { AssessmentsSkeleton } from "@/features/assessments/components/AssessmentsPage"
import { EvaluationsSkeleton } from "@/features/evaluations/components/EvaluationsPage"
import { InviteSkeleton } from "@/features/invitations/components/InvitePage"
import { LiveAttemptSkeleton } from "@/features/liveInspection/components/LiveAttemptPage"
import { LiveAttemptsSkeleton } from "@/features/liveInspection/components/LiveAttemptsPage"
import { AttemptReportSkeleton } from "@/features/reports/components/AttemptReportPage"

// Rendered at /__boneyard/admin inside the real layout, so each skeleton
// is captured at the same width it occupies in the app. Add new page skeletons here.
export function AdminSkeletonGallery() {
  return <div className="space-y-24">
    <AdminDashboardSkeleton />
    <AssessmentsSkeleton />
    <AssessmentDetailSkeleton />
    <AssessmentDetailSkeleton showCover />
    <AssessmentEditorSkeleton />
    <InviteSkeleton />
    <EvaluationsSkeleton />
    <LiveAttemptsSkeleton />
    <LiveAttemptSkeleton />
    <AttemptReportSkeleton />
    <GenericPageSkeleton />
    <InlineSkeleton variant="line" />
    <InlineSkeleton variant="rows" />
  </div>
}
