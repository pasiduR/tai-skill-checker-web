import { useQuery } from "@tanstack/react-query"
import { Fragment } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronRight } from "@/components/ui/icons"
import { attemptInspectionQuery } from "@/features/attempts"
import { assessmentQuery } from "@/features/assessments/hooks/useAssessment"
import { cn } from "@/lib/utils"

type Crumb = { label: string; to?: string }

/**
 * Reads names for dynamic segments from the query cache only (the page itself fetches them),
 * so the header never triggers its own requests.
 */
function useCachedNames(pathname: string) {
  const assessmentId = pathname.match(/^\/admin\/assessments\/([^/]+)/)?.[1]
  const attemptId = pathname.match(/^\/admin\/(?:live|attempts)\/([^/]+)/)?.[1]
  const assessment = useQuery({ ...assessmentQuery(assessmentId ?? ""), enabled: false })
  const attempt = useQuery({ ...attemptInspectionQuery(attemptId ?? ""), enabled: false })
  return {
    assessmentName: assessmentId && assessmentId !== "new" ? assessment.data?.name : undefined,
    attemptAssessmentName: attemptId ? attempt.data?.assessment.name : undefined,
  }
}

function adminBreadcrumbs(pathname: string, names: { assessmentName?: string; attemptAssessmentName?: string }): Crumb[] {
  const segments = pathname.replace(/\/+$/, "").split("/").slice(2)
  const [section, id, action] = segments

  if (!section) return [{ label: "Operations overview" }]
  if (section === "assessments") {
    const root: Crumb = { label: "Assessments", to: "/admin/assessments" }
    if (!id) return [{ label: root.label }]
    if (id === "new") return [root, { label: "New assessment" }]
    const assessment: Crumb = { label: names.assessmentName ?? "Assessment", to: `/admin/assessments/${id}` }
    if (action === "edit") return [root, assessment, { label: "Edit draft" }]
    if (action === "invite") return [root, assessment, { label: "Invite employees" }]
    return [root, { label: assessment.label }]
  }
  if (section === "evaluations") return [{ label: "Evaluations" }]
  if (section === "live") {
    if (!id) return [{ label: "Live attempts" }]
    return [{ label: "Live attempts", to: "/admin/live" }, { label: names.attemptAssessmentName ?? "Live session" }]
  }
  if (section === "attempts") return [{ label: "Evaluations", to: "/admin/evaluations" }, { label: names.attemptAssessmentName ? `${names.attemptAssessmentName} report` : "Attempt report" }]
  if (section === "settings") return [{ label: "Settings" }, { label: "Voice agent" }]
  return [{ label: "Admin workspace" }]
}

export function AdminBreadcrumbs() {
  const { pathname } = useLocation()
  const crumbs = adminBreadcrumbs(pathname, useCachedNames(pathname))
  const lastIndex = crumbs.length - 1

  return <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
    <ol className="flex min-w-0 items-center gap-1 text-sm">
      {crumbs.map((crumb, index) => {
        const isLast = index === lastIndex
        // On narrow screens only the immediate parent and the current page are shown.
        const hideOnMobile = index < lastIndex - 1
        return <Fragment key={`${index}-${crumb.label}`}>
          {index > 0 && <li aria-hidden="true" className={cn("shrink-0 text-muted-foreground/60", hideOnMobile && "hidden sm:block")}><ChevronRight className="!size-4" /></li>}
          <li className={cn("min-w-0", isLast ? "truncate" : "shrink-0", hideOnMobile && "hidden sm:block")}>
            {crumb.to && !isLast
              ? <Link to={crumb.to} className="block max-w-[14rem] truncate rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">{crumb.label}</Link>
              : <span aria-current={isLast ? "page" : undefined} className={cn("block truncate px-1.5 py-1", isLast ? "font-medium text-foreground" : "text-muted-foreground")}>{crumb.label}</span>}
          </li>
        </Fragment>
      })}
    </ol>
  </nav>
}
