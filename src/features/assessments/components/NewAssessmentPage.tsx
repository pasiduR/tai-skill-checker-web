import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { queryKeys } from "@/api"
import { createAssessment } from "../api/assessments"
import { OverviewForm } from "./OverviewForm"
import { PageHeader } from "./PageHeader"

export function NewAssessmentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const mutation = useMutation({ mutationFn: createAssessment, onSuccess: async (assessment) => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.assessments })
    navigate(`/admin/assessments/${assessment.id}/edit`)
  } })
  return <div className="space-y-8"><PageHeader eyebrow="New assessment" title="Start with the essentials" description="Create the draft, then add competencies, scenarios, rubrics, and resources." /><OverviewForm submitLabel="Create draft" pending={mutation.isPending} error={mutation.error?.message} onSubmit={(values) => mutation.mutate(values)} /></div>
}
