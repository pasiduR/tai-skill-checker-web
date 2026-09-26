import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/api"
import { CoverImage } from "@/components/shared/CoverImage"
import { FieldError } from "@/components/shared/FieldError"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, PdfFile, Sparkles, Trash, Upload } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  addCompetency, addRubric, addScenario, generateAssessment, mapScenarioCompetency,
  processResource, removeCoverImage, updateCompetency, updateRubric, updateScenario,
  uploadCoverImage, uploadResource,
} from "../api/assessments"
import { competencySchema, generationSchema, rubricSchema, scenarioSchema } from "../schemas"
import type { Assessment, Competency, Rubric, Scenario } from "../types"

type SectionProps = { assessment: Assessment; refresh: () => Promise<unknown> }
type ValidationErrors = Record<string, string | undefined>

const scenarioContentSchema = scenarioSchema.omit({ competencyId: true })

function errorsFrom(issues: readonly { path: PropertyKey[]; message: string }[]) {
  const errors: ValidationErrors = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form")
    if (!errors[key]) errors[key] = issue.message
  }
  return errors
}

function MutationMessage({ error, success }: { error?: Error | null; success?: string }) {
  if (error) return <p className="text-sm text-destructive" role="alert">{error.message}</p>
  if (success) return <p className="text-sm font-medium text-primary" role="status">{success}</p>
  return null
}

export function AiGenerationSection({ assessment, refresh }: SectionProps) {
  const [brief, setBrief] = useState("")
  const [validationError, setValidationError] = useState<string>()
  const mutation = useMutation({ mutationFn: (validBrief: string) => generateAssessment(assessment.id, { brief: validBrief }), onSuccess: refresh })
  const submit = () => {
    const parsed = generationSchema.safeParse({ brief })
    if (!parsed.success) return setValidationError(parsed.error.issues[0]?.message)
    setValidationError(undefined)
    mutation.mutate(parsed.data.brief)
  }
  return <Card className="border-primary/30 bg-brand-soft shadow-none">
    <CardHeader><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><CardTitle className="text-base">AI-assisted draft</CardTitle></div><CardDescription>Generation replaces all current draft scenarios, competencies, and rubrics. Review and edit the result before publishing.</CardDescription></CardHeader>
    <CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="brief">Assessment brief</Label><Textarea id="brief" rows={5} maxLength={20_000} value={brief} aria-invalid={Boolean(validationError)} aria-describedby={validationError ? "brief-error" : undefined} onChange={(event) => { setBrief(event.target.value); setValidationError(undefined) }} placeholder="Assess customer support managers on de-escalation, privacy, and clear communication…" /><FieldError id="brief-error" message={validationError} /></div><MutationMessage error={mutation.error} success={mutation.isSuccess ? "Draft generated. Review every section below." : undefined} /><Button variant="outline" loading={mutation.isPending} onClick={submit}><Sparkles />{mutation.isPending ? "Generating draft…" : "Generate draft"}</Button></CardContent>
  </Card>
}

function CompetencyEditor({ assessmentId, competency, refresh }: { assessmentId: string; competency: Competency; refresh: () => Promise<unknown> }) {
  const [name, setName] = useState(competency.name)
  const [description, setDescription] = useState(competency.description)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const mutation = useMutation({ mutationFn: (values: { name: string; description: string }) => updateCompetency(assessmentId, competency.id, { ...values, position: competency.position }), onSuccess: refresh })
  const submit = () => {
    const parsed = competencySchema.safeParse({ name, description })
    if (!parsed.success) return setErrors(errorsFrom(parsed.error.issues))
    setErrors({})
    mutation.mutate(parsed.data)
  }
  const nameId = `competency-name-${competency.id}`
  const descriptionId = `competency-description-${competency.id}`
  return <Card className="shadow-none"><CardContent className="space-y-3 pt-5 sm:pt-6"><div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
    <div className="space-y-1"><Label htmlFor={nameId}>Competency name</Label><Input id={nameId} maxLength={200} value={name} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${nameId}-error` : undefined} onChange={(event) => { setName(event.target.value); setErrors((current) => ({ ...current, name: undefined })) }} /><FieldError id={`${nameId}-error`} message={errors.name} /></div>
    <div className="space-y-1"><Label htmlFor={descriptionId}>Competency description</Label><Input id={descriptionId} maxLength={5_000} value={description} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? `${descriptionId}-error` : undefined} onChange={(event) => { setDescription(event.target.value); setErrors((current) => ({ ...current, description: undefined })) }} /><FieldError id={`${descriptionId}-error`} message={errors.description} /></div>
    <Button className="self-end" variant="outline" loading={mutation.isPending} onClick={submit}>Save</Button>
  </div><MutationMessage error={mutation.error} /></CardContent></Card>
}

function RubricEditor({ assessmentId, rubric, refresh }: { assessmentId: string; rubric: Rubric; refresh: () => Promise<unknown> }) {
  const [title, setTitle] = useState(rubric.title)
  const [expected, setExpected] = useState(rubric.expectedBehaviors.join("\n"))
  const [criteria, setCriteria] = useState(rubric.criteria)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const mutation = useMutation({ mutationFn: (values: { title: string; expectedBehaviors: string[]; criteria: Rubric["criteria"] }) => updateRubric(assessmentId, rubric.id, values), onSuccess: refresh })
  const submit = () => {
    const low = criteria.find((item) => item.score === 1)?.description ?? ""
    const medium = criteria.find((item) => item.score === 3)?.description ?? ""
    const high = criteria.find((item) => item.score === 5)?.description ?? ""
    const parsed = rubricSchema.safeParse({ competencyId: rubric.competencyId, title, low, medium, high, expected })
    if (!parsed.success) return setErrors(errorsFrom(parsed.error.issues))
    setErrors({})
    mutation.mutate({ title: parsed.data.title, expectedBehaviors: parsed.data.expected, criteria: criteria.map((item) => ({ ...item, description: item.description.trim() })) })
  }
  const titleId = `rubric-title-${rubric.id}`
  return <div className="space-y-3 rounded-lg border bg-neutral-50 p-4">
    <div className="grid gap-3 md:grid-cols-[1fr_auto]"><div className="space-y-1"><Label htmlFor={titleId}>Rubric title</Label><Input id={titleId} maxLength={300} value={title} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? `${titleId}-error` : undefined} onChange={(event) => { setTitle(event.target.value); setErrors((current) => ({ ...current, title: undefined })) }} /><FieldError id={`${titleId}-error`} message={errors.title} /></div><Button className="self-end" variant="outline" loading={mutation.isPending} onClick={submit}>Save rubric</Button></div>
    <div className="grid gap-3 md:grid-cols-3">{criteria.map((criterion, index) => { const key = criterion.score === 1 ? "low" : criterion.score === 3 ? "medium" : "high"; const id = `rubric-${rubric.id}-score-${criterion.score}`; return <div key={criterion.score} className="space-y-1"><Label htmlFor={id}>Score {criterion.score}</Label><Textarea id={id} rows={3} maxLength={2_000} value={criterion.description} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key] ? `${id}-error` : undefined} onChange={(event) => { setCriteria(criteria.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item)); setErrors((current) => ({ ...current, [key]: undefined })) }} /><FieldError id={`${id}-error`} message={errors[key]} /></div> })}</div>
    <div className="space-y-1"><Label htmlFor={`rubric-expected-${rubric.id}`}>Expected behaviours, one per line</Label><Textarea id={`rubric-expected-${rubric.id}`} rows={3} value={expected} aria-invalid={Boolean(errors.expected)} aria-describedby={errors.expected ? `rubric-expected-${rubric.id}-error` : undefined} onChange={(event) => { setExpected(event.target.value); setErrors((current) => ({ ...current, expected: undefined })) }} /><FieldError id={`rubric-expected-${rubric.id}-error`} message={errors.expected} /></div>
    <MutationMessage error={mutation.error} />
  </div>
}

export function CompetenciesSection({ assessment, refresh }: SectionProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [competencyErrors, setCompetencyErrors] = useState<ValidationErrors>({})
  const [rubricCompetencyId, setRubricCompetencyId] = useState("")
  const [rubricTitle, setRubricTitle] = useState("")
  const [expected, setExpected] = useState("")
  const [low, setLow] = useState("")
  const [medium, setMedium] = useState("")
  const [high, setHigh] = useState("")
  const [rubricErrors, setRubricErrors] = useState<ValidationErrors>({})
  const add = useMutation({ mutationFn: (values: { name: string; description: string }) => addCompetency(assessment.id, { ...values, position: assessment.competencies.length + 1 }), onSuccess: async () => { setName(""); setDescription(""); await refresh() } })
  const addScale = useMutation({ mutationFn: (values: { competencyId: string; title: string; low: string; medium: string; high: string; expected: string[] }) => addRubric(assessment.id, { competencyId: values.competencyId, title: values.title, criteria: [{ score: 1, description: values.low }, { score: 3, description: values.medium }, { score: 5, description: values.high }], expectedBehaviors: values.expected }), onSuccess: async () => { setRubricCompetencyId(""); setRubricTitle(""); setExpected(""); setLow(""); setMedium(""); setHigh(""); await refresh() } })
  const unrubriced = assessment.competencies.filter((competency) => !assessment.rubrics.some((rubric) => rubric.competencyId === competency.id))
  const submitCompetency = () => {
    const parsed = competencySchema.safeParse({ name, description })
    if (!parsed.success) return setCompetencyErrors(errorsFrom(parsed.error.issues))
    setCompetencyErrors({})
    add.mutate(parsed.data)
  }
  const submitRubric = () => {
    const parsed = rubricSchema.safeParse({ competencyId: rubricCompetencyId, title: rubricTitle, low, medium, high, expected })
    if (!parsed.success) return setRubricErrors(errorsFrom(parsed.error.issues))
    setRubricErrors({})
    addScale.mutate(parsed.data)
  }
  const rubricFields = [
    { key: "low", label: "Score 1 description", value: low, setValue: setLow },
    { key: "medium", label: "Score 3 description", value: medium, setValue: setMedium },
    { key: "high", label: "Score 5 description", value: high, setValue: setHigh },
  ]
  return <div className="space-y-6"><div><h2 className="text-xl font-semibold">Competencies and rubrics</h2><p className="mt-1 text-sm text-muted-foreground">Define what is assessed and the evidence scale used by evaluators.</p></div>
    <div className="space-y-3">{assessment.competencies.map((competency) => <div key={competency.id} className="space-y-2"><CompetencyEditor assessmentId={assessment.id} competency={competency} refresh={refresh} />{assessment.rubrics.filter((item) => item.competencyId === competency.id).map((rubric) => <RubricEditor key={rubric.id} assessmentId={assessment.id} rubric={rubric} refresh={refresh} />)}</div>)}</div>
    <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Add competency</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
      <div className="space-y-1"><Label htmlFor="new-competency-name">Name</Label><Input id="new-competency-name" maxLength={200} value={name} aria-invalid={Boolean(competencyErrors.name)} aria-describedby={competencyErrors.name ? "new-competency-name-error" : undefined} onChange={(event) => { setName(event.target.value); setCompetencyErrors((current) => ({ ...current, name: undefined })) }} /><FieldError id="new-competency-name-error" message={competencyErrors.name} /></div>
      <div className="space-y-1"><Label htmlFor="new-competency-description">Description</Label><Input id="new-competency-description" maxLength={5_000} value={description} aria-invalid={Boolean(competencyErrors.description)} aria-describedby={competencyErrors.description ? "new-competency-description-error" : undefined} onChange={(event) => { setDescription(event.target.value); setCompetencyErrors((current) => ({ ...current, description: undefined })) }} /><FieldError id="new-competency-description-error" message={competencyErrors.description} /></div>
      <Button className="self-end" loading={add.isPending} onClick={submitCompetency}>Add</Button><MutationMessage error={add.error} />
    </CardContent></Card>
    {unrubriced.length > 0 && <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Add rubric</CardTitle><CardDescription>Each competency needs a scoring rubric before publication.</CardDescription></CardHeader><CardContent className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2"><div className="space-y-1"><Label htmlFor="rubric-competency">Competency</Label><select id="rubric-competency" className="h-11 w-full rounded-xl border bg-white px-3 text-sm" value={rubricCompetencyId} aria-invalid={Boolean(rubricErrors.competencyId)} aria-describedby={rubricErrors.competencyId ? "rubric-competency-error" : undefined} onChange={(event) => { setRubricCompetencyId(event.target.value); setRubricErrors((current) => ({ ...current, competencyId: undefined })) }}><option value="">Choose competency</option>{unrubriced.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><FieldError id="rubric-competency-error" message={rubricErrors.competencyId} /></div><div className="space-y-1"><Label htmlFor="new-rubric-title">Rubric title</Label><Input id="new-rubric-title" maxLength={300} value={rubricTitle} aria-invalid={Boolean(rubricErrors.title)} aria-describedby={rubricErrors.title ? "new-rubric-title-error" : undefined} onChange={(event) => { setRubricTitle(event.target.value); setRubricErrors((current) => ({ ...current, title: undefined })) }} /><FieldError id="new-rubric-title-error" message={rubricErrors.title} /></div></div>
      <div className="grid gap-3 md:grid-cols-3">{rubricFields.map(({ key, label, value, setValue }) => <div key={key} className="space-y-1"><Label htmlFor={`new-rubric-${key}`}>{label}</Label><Textarea id={`new-rubric-${key}`} maxLength={2_000} value={value} aria-invalid={Boolean(rubricErrors[key])} aria-describedby={rubricErrors[key] ? `new-rubric-${key}-error` : undefined} onChange={(event) => { setValue(event.target.value); setRubricErrors((current) => ({ ...current, [key]: undefined })) }} /><FieldError id={`new-rubric-${key}-error`} message={rubricErrors[key]} /></div>)}</div>
      <div className="space-y-1"><Label htmlFor="new-rubric-expected">Expected behaviours, one per line</Label><Textarea id="new-rubric-expected" value={expected} aria-invalid={Boolean(rubricErrors.expected)} aria-describedby={rubricErrors.expected ? "new-rubric-expected-error" : undefined} onChange={(event) => { setExpected(event.target.value); setRubricErrors((current) => ({ ...current, expected: undefined })) }} /><FieldError id="new-rubric-expected-error" message={rubricErrors.expected} /></div>
      <MutationMessage error={addScale.error} /><Button loading={addScale.isPending} onClick={submitRubric}>Add rubric</Button>
    </CardContent></Card>}
  </div>
}

function ScenarioEditor({ assessmentId, scenario, refresh }: { assessmentId: string; scenario: Scenario; refresh: () => Promise<unknown> }) {
  const [title, setTitle] = useState(scenario.title)
  const [prompt, setPrompt] = useState(scenario.prompt)
  const [guidance, setGuidance] = useState(scenario.followUpGuidance)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const mutation = useMutation({ mutationFn: (values: { title: string; prompt: string; followUpGuidance: string }) => updateScenario(assessmentId, scenario.id, { ...values, position: scenario.position }), onSuccess: refresh })
  const submit = () => {
    const parsed = scenarioContentSchema.safeParse({ title, prompt, followUpGuidance: guidance })
    if (!parsed.success) return setErrors(errorsFrom(parsed.error.issues))
    setErrors({})
    mutation.mutate(parsed.data)
  }
  return <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Scenario {scenario.position}</CardTitle></CardHeader><CardContent className="space-y-3">
    <div className="space-y-1"><Label htmlFor={`scenario-title-${scenario.id}`}>Scenario title</Label><Input id={`scenario-title-${scenario.id}`} maxLength={300} value={title} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? `scenario-title-${scenario.id}-error` : undefined} onChange={(event) => { setTitle(event.target.value); setErrors((current) => ({ ...current, title: undefined })) }} /><FieldError id={`scenario-title-${scenario.id}-error`} message={errors.title} /></div>
    <div className="space-y-1"><Label htmlFor={`scenario-prompt-${scenario.id}`}>Scenario prompt</Label><Textarea id={`scenario-prompt-${scenario.id}`} rows={4} maxLength={20_000} value={prompt} aria-invalid={Boolean(errors.prompt)} aria-describedby={errors.prompt ? `scenario-prompt-${scenario.id}-error` : undefined} onChange={(event) => { setPrompt(event.target.value); setErrors((current) => ({ ...current, prompt: undefined })) }} /><FieldError id={`scenario-prompt-${scenario.id}-error`} message={errors.prompt} /></div>
    <div className="space-y-1"><Label htmlFor={`scenario-guidance-${scenario.id}`}>Follow-up guidance</Label><Textarea id={`scenario-guidance-${scenario.id}`} rows={3} maxLength={10_000} value={guidance} aria-invalid={Boolean(errors.followUpGuidance)} aria-describedby={errors.followUpGuidance ? `scenario-guidance-${scenario.id}-error` : undefined} onChange={(event) => { setGuidance(event.target.value); setErrors((current) => ({ ...current, followUpGuidance: undefined })) }} /><FieldError id={`scenario-guidance-${scenario.id}-error`} message={errors.followUpGuidance} /></div>
    <MutationMessage error={mutation.error} /><Button variant="outline" loading={mutation.isPending} onClick={submit}>Save scenario</Button>
  </CardContent></Card>
}

export function ScenariosSection({ assessment, refresh }: SectionProps) {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [guidance, setGuidance] = useState("")
  const [competencyId, setCompetencyId] = useState("")
  const [errors, setErrors] = useState<ValidationErrors>({})
  const mutation = useMutation({ mutationFn: async (values: { title: string; prompt: string; followUpGuidance: string; competencyId: string }) => { const scenario = await addScenario(assessment.id, { title: values.title, prompt: values.prompt, followUpGuidance: values.followUpGuidance, position: assessment.scenarios.length + 1 }); await mapScenarioCompetency(assessment.id, { scenarioId: scenario.id, competencyId: values.competencyId }); return scenario }, onSuccess: async () => { setTitle(""); setPrompt(""); setGuidance(""); setCompetencyId(""); await refresh() } })
  const submit = () => {
    const parsed = scenarioSchema.safeParse({ title, prompt, followUpGuidance: guidance, competencyId })
    if (!parsed.success) return setErrors(errorsFrom(parsed.error.issues))
    setErrors({})
    mutation.mutate(parsed.data)
  }
  return <div className="space-y-6"><div><h2 className="text-xl font-semibold">Scenarios</h2><p className="mt-1 text-sm text-muted-foreground">Scenarios run in this fixed order. Map every scenario to at least one competency.</p></div><div className="space-y-3">{assessment.scenarios.map((scenario) => <ScenarioEditor key={scenario.id} assessmentId={assessment.id} scenario={scenario} refresh={refresh} />)}</div><Card className="shadow-none"><CardHeader><CardTitle className="text-base">Add scenario</CardTitle></CardHeader><CardContent className="space-y-3">
    <div className="space-y-1"><Label htmlFor="new-scenario-title">Scenario title</Label><Input id="new-scenario-title" maxLength={300} value={title} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "new-scenario-title-error" : undefined} onChange={(event) => { setTitle(event.target.value); setErrors((current) => ({ ...current, title: undefined })) }} /><FieldError id="new-scenario-title-error" message={errors.title} /></div>
    <div className="space-y-1"><Label htmlFor="new-scenario-prompt">Scenario prompt</Label><Textarea id="new-scenario-prompt" rows={5} maxLength={20_000} value={prompt} aria-invalid={Boolean(errors.prompt)} aria-describedby={errors.prompt ? "new-scenario-prompt-error" : undefined} onChange={(event) => { setPrompt(event.target.value); setErrors((current) => ({ ...current, prompt: undefined })) }} /><FieldError id="new-scenario-prompt-error" message={errors.prompt} /></div>
    <div className="space-y-1"><Label htmlFor="new-scenario-guidance">Follow-up guidance</Label><Textarea id="new-scenario-guidance" rows={3} maxLength={10_000} value={guidance} aria-invalid={Boolean(errors.followUpGuidance)} aria-describedby={errors.followUpGuidance ? "new-scenario-guidance-error" : undefined} onChange={(event) => { setGuidance(event.target.value); setErrors((current) => ({ ...current, followUpGuidance: undefined })) }} /><FieldError id="new-scenario-guidance-error" message={errors.followUpGuidance} /></div>
    <div className="space-y-1"><Label htmlFor="new-scenario-competency">Competency</Label><select id="new-scenario-competency" className="h-11 w-full rounded-xl border bg-white px-3 text-sm" value={competencyId} aria-invalid={Boolean(errors.competencyId)} aria-describedby={errors.competencyId ? "new-scenario-competency-error" : undefined} onChange={(event) => { setCompetencyId(event.target.value); setErrors((current) => ({ ...current, competencyId: undefined })) }}><option value="">Map to competency</option>{assessment.competencies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><FieldError id="new-scenario-competency-error" message={errors.competencyId} /></div>
    <MutationMessage error={mutation.error} /><Button loading={mutation.isPending} onClick={submit}>Add scenario</Button>
  </CardContent></Card></div>
}

const maxCoverImageBytes = 5 * 1024 * 1024
const coverImageTypes = new Set(["image/png", "image/jpeg", "image/webp"])

export function CoverImageSection({ assessment }: { assessment: Assessment }) {
  const queryClient = useQueryClient()
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>()
  const [inputKey, setInputKey] = useState(0)
  const refreshAll = () => queryClient.invalidateQueries({ queryKey: queryKeys.assessments })
  const upload = useMutation({ mutationFn: async () => { if (!file) throw new Error("Choose an image file."); return uploadCoverImage(assessment.id, file) }, onSuccess: async () => { setFile(null); setInputKey((key) => key + 1); await refreshAll() } })
  const remove = useMutation({ mutationFn: () => removeCoverImage(assessment.id), onSuccess: refreshAll })
  const chooseFile = (selected: File | null) => {
    upload.reset()
    setFileError(undefined)
    if (!selected) return setFile(null)
    if (!coverImageTypes.has(selected.type)) { setFile(null); setFileError("Choose a PNG, JPEG, or WebP image."); return }
    if (selected.size > maxCoverImageBytes) { setFile(null); setFileError("Cover images must be 5 MB or smaller."); return }
    setFile(selected)
  }
  return <Card className="max-w-3xl shadow-none"><CardHeader><CardTitle>Cover image</CardTitle><CardDescription>Shown on the admin overview, the assessment preview, and the employee preparation page. PNG, JPEG, or WebP up to 5 MB.</CardDescription></CardHeader><CardContent className="space-y-4">
    <div className="aspect-[3/1] overflow-hidden rounded-xl border bg-muted"><CoverImage url={assessment.coverImageUrl} alt="Current cover image" className="size-full object-cover" fallback={<div className="grid size-full place-items-center text-muted-foreground"><div className="flex flex-col items-center gap-2 text-sm"><ImageIcon className="size-6" />{assessment.coverImageUrl ? "Loading cover…" : "No cover image"}</div></div>} /></div>
    <div className="space-y-2"><Label htmlFor="cover-image">{assessment.coverImageUrl ? "Replace cover image" : "Upload cover image"}</Label><Input key={inputKey} id="cover-image" type="file" accept="image/png,image/jpeg,image/webp" aria-invalid={Boolean(fileError)} aria-describedby={fileError ? "cover-image-error" : undefined} onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} /><FieldError id="cover-image-error" message={fileError} /></div>
    <MutationMessage error={upload.error ?? remove.error} success={upload.isSuccess ? "Cover image updated." : remove.isSuccess ? "Cover image removed." : undefined} />
    <div className="flex flex-wrap gap-2"><Button loading={upload.isPending} disabled={!file || remove.isPending} onClick={() => upload.mutate()}><Upload />{upload.isPending ? "Uploading…" : "Upload cover"}</Button>{assessment.coverImageUrl && <Button variant="outline" loading={remove.isPending} disabled={upload.isPending} onClick={() => remove.mutate()}><Trash />{remove.isPending ? "Removing…" : "Remove"}</Button>}</div>
  </CardContent></Card>
}

export function ResourcesSection({ assessment, refresh }: SectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string>()
  const mutation = useMutation({ mutationFn: async () => { if (!file) throw new Error("Choose a PDF file."); const resource = await uploadResource(assessment.id, file); return processResource(assessment.id, resource.id) }, onSuccess: async () => { setFile(null); await refresh() } })
  const chooseFile = (selected: File | null) => {
    mutation.reset()
    setFileError(undefined)
    if (!selected) return setFile(null)
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) { setFile(null); setFileError("Choose a valid PDF file."); return }
    setFile(selected)
  }
  return <div className="space-y-6"><div><h2 className="text-xl font-semibold">Resources</h2><p className="mt-1 text-sm text-muted-foreground">Upload PDF reference material. It is processed before the assessment can be published.</p></div>{assessment.resources.map((resource) => <div key={resource.id} className="flex items-center justify-between rounded-lg border bg-white p-4"><div className="flex items-center gap-3"><PdfFile className="size-5 text-muted-foreground" /><div><p className="text-sm font-medium">{resource.filename}</p><p className="text-xs text-muted-foreground">{Math.ceil(resource.byteSize / 1024)} KB</p></div></div><span className="font-mono text-xs">{resource.status}</span></div>)}<Card className="shadow-none"><CardContent className="space-y-4 pt-5 sm:pt-6"><div className="space-y-2"><Label htmlFor="resource">PDF resource</Label><Input id="resource" type="file" accept="application/pdf,.pdf" aria-invalid={Boolean(fileError)} aria-describedby={fileError ? "resource-error" : undefined} onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} /><FieldError id="resource-error" message={fileError} /></div><MutationMessage error={mutation.error} success={mutation.isSuccess ? "Resource uploaded and processed." : undefined} /><Button loading={mutation.isPending} disabled={!file} onClick={() => mutation.mutate()}><Upload />{mutation.isPending ? "Uploading and processing…" : "Upload and process"}</Button></CardContent></Card></div>
}
