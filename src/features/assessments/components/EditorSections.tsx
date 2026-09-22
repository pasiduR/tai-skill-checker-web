import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { FileText, Loader2, Sparkles, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  addCompetency, addRubric, addScenario, generateAssessment, mapScenarioCompetency,
  processResource, updateCompetency, updateRubric, updateScenario, uploadResource,
} from "../api/assessments"
import type { Assessment, Competency, Rubric, Scenario } from "../types"

type SectionProps = { assessment: Assessment; refresh: () => Promise<unknown> }

function MutationMessage({ error, success }: { error?: Error | null; success?: string }) {
  if (error) return <p className="text-sm text-destructive" role="alert">{error.message}</p>
  if (success) return <p className="text-sm font-medium text-primary" role="status">{success}</p>
  return null
}

export function AiGenerationSection({ assessment, refresh }: SectionProps) {
  const [brief, setBrief] = useState("")
  const mutation = useMutation({ mutationFn: () => generateAssessment(assessment.id, { brief }), onSuccess: refresh })
  return <Card className="border-primary/30 bg-brand-soft shadow-none"><CardHeader><div className="flex items-center gap-2"><Sparkles className="size-4 text-primary" /><CardTitle className="text-base">AI-assisted draft</CardTitle></div><CardDescription>Generation replaces all current draft scenarios, competencies, and rubrics. Review and edit the result before publishing.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="brief">Assessment brief</Label><Textarea id="brief" rows={5} value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Assess customer support managers on de-escalation, privacy, and clear communication…" /></div><MutationMessage error={mutation.error} success={mutation.isSuccess ? "Draft generated. Review every section below." : undefined} /><Button variant="outline" disabled={mutation.isPending || brief.trim().length < 10} onClick={() => mutation.mutate()}>{mutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}Generate draft</Button></CardContent></Card>
}

function CompetencyEditor({ assessmentId, competency, refresh }: { assessmentId: string; competency: Competency; refresh: () => Promise<unknown> }) {
  const [name, setName] = useState(competency.name)
  const [description, setDescription] = useState(competency.description)
  const mutation = useMutation({ mutationFn: () => updateCompetency(assessmentId, competency.id, { name, description, position: competency.position }), onSuccess: refresh })
  return <Card className="shadow-none"><CardContent className="space-y-3 pt-6"><div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"><Input aria-label="Competency name" value={name} onChange={(e) => setName(e.target.value)} /><Input aria-label="Competency description" value={description} onChange={(e) => setDescription(e.target.value)} /><Button variant="outline" disabled={mutation.isPending || !name.trim() || !description.trim()} onClick={() => mutation.mutate()}>Save</Button></div><MutationMessage error={mutation.error} /></CardContent></Card>
}

function RubricEditor({ assessmentId, rubric, refresh }: { assessmentId: string; rubric: Rubric; refresh: () => Promise<unknown> }) {
  const [title, setTitle] = useState(rubric.title)
  const [expected, setExpected] = useState(rubric.expectedBehaviors.join("\n"))
  const [criteria, setCriteria] = useState(rubric.criteria)
  const mutation = useMutation({ mutationFn: () => updateRubric(assessmentId, rubric.id, { title, expectedBehaviors: lines(expected), criteria }), onSuccess: refresh })
  return <div className="space-y-3 rounded-lg border bg-neutral-50 p-4"><div className="grid gap-3 md:grid-cols-[1fr_auto]"><Input aria-label="Rubric title" value={title} onChange={(e) => setTitle(e.target.value)} /><Button variant="outline" disabled={mutation.isPending || !title.trim() || !lines(expected).length || criteria.some((item) => !item.description.trim())} onClick={() => mutation.mutate()}>Save rubric</Button></div><div className="grid gap-3 md:grid-cols-3">{criteria.map((criterion, index) => <div key={criterion.score} className="space-y-1"><Label>Score {criterion.score}</Label><Textarea rows={3} value={criterion.description} onChange={(event) => setCriteria(criteria.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} /></div>)}</div><div className="space-y-1"><Label>Expected behaviours, one per line</Label><Textarea rows={3} value={expected} onChange={(e) => setExpected(e.target.value)} /></div><MutationMessage error={mutation.error} /></div>
}

const lines = (value: string) => value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean)

export function CompetenciesSection({ assessment, refresh }: SectionProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [rubricCompetencyId, setRubricCompetencyId] = useState("")
  const [rubricTitle, setRubricTitle] = useState("")
  const [expected, setExpected] = useState("")
  const [low, setLow] = useState("")
  const [medium, setMedium] = useState("")
  const [high, setHigh] = useState("")
  const add = useMutation({ mutationFn: () => addCompetency(assessment.id, { name, description, position: assessment.competencies.length + 1 }), onSuccess: async () => { setName(""); setDescription(""); await refresh() } })
  const addScale = useMutation({ mutationFn: () => addRubric(assessment.id, { competencyId: rubricCompetencyId, title: rubricTitle, criteria: [{ score: 1, description: low }, { score: 3, description: medium }, { score: 5, description: high }], expectedBehaviors: lines(expected) }), onSuccess: async () => { setRubricTitle(""); setExpected(""); setLow(""); setMedium(""); setHigh(""); await refresh() } })
  const unrubriced = assessment.competencies.filter((competency) => !assessment.rubrics.some((rubric) => rubric.competencyId === competency.id))
  return <div className="space-y-6"><div><h2 className="text-xl font-semibold">Competencies and rubrics</h2><p className="mt-1 text-sm text-muted-foreground">Define what is assessed and the evidence scale used by evaluators.</p></div>
    <div className="space-y-3">{assessment.competencies.map((competency) => <div key={competency.id} className="space-y-2"><CompetencyEditor assessmentId={assessment.id} competency={competency} refresh={refresh} />{assessment.rubrics.filter((item) => item.competencyId === competency.id).map((rubric) => <RubricEditor key={rubric.id} assessmentId={assessment.id} rubric={rubric} refresh={refresh} />)}</div>)}</div>
    <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Add competency</CardTitle></CardHeader><CardContent className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"><Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /><Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} /><Button disabled={add.isPending || !name.trim() || !description.trim()} onClick={() => add.mutate()}>Add</Button><MutationMessage error={add.error} /></CardContent></Card>
    {unrubriced.length > 0 && <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Add rubric</CardTitle><CardDescription>Each competency needs a scoring rubric before publication.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="grid gap-3 md:grid-cols-2"><select className="h-9 rounded-md border bg-white px-3 text-sm" value={rubricCompetencyId} onChange={(e) => setRubricCompetencyId(e.target.value)}><option value="">Choose competency</option>{unrubriced.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><Input placeholder="Rubric title" value={rubricTitle} onChange={(e) => setRubricTitle(e.target.value)} /></div><div className="grid gap-3 md:grid-cols-3"><Textarea placeholder="Score 1 description" value={low} onChange={(e) => setLow(e.target.value)} /><Textarea placeholder="Score 3 description" value={medium} onChange={(e) => setMedium(e.target.value)} /><Textarea placeholder="Score 5 description" value={high} onChange={(e) => setHigh(e.target.value)} /></div><Textarea placeholder="Expected behaviours, one per line" value={expected} onChange={(e) => setExpected(e.target.value)} /><MutationMessage error={addScale.error} /><Button disabled={addScale.isPending || !rubricCompetencyId || !rubricTitle.trim() || !low.trim() || !medium.trim() || !high.trim() || !lines(expected).length} onClick={() => addScale.mutate()}>Add rubric</Button></CardContent></Card>}
  </div>
}

function ScenarioEditor({ assessmentId, scenario, refresh }: { assessmentId: string; scenario: Scenario; refresh: () => Promise<unknown> }) {
  const [title, setTitle] = useState(scenario.title)
  const [prompt, setPrompt] = useState(scenario.prompt)
  const [guidance, setGuidance] = useState(scenario.followUpGuidance)
  const mutation = useMutation({ mutationFn: () => updateScenario(assessmentId, scenario.id, { title, prompt, followUpGuidance: guidance, position: scenario.position }), onSuccess: refresh })
  return <Card className="shadow-none"><CardHeader><CardTitle className="text-base">Scenario {scenario.position}</CardTitle></CardHeader><CardContent className="space-y-3"><Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Scenario title" /><Textarea rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="Scenario prompt" /><Textarea rows={3} value={guidance} onChange={(e) => setGuidance(e.target.value)} aria-label="Follow-up guidance" /><MutationMessage error={mutation.error} /><Button variant="outline" disabled={mutation.isPending || !title.trim() || !prompt.trim()} onClick={() => mutation.mutate()}>Save scenario</Button></CardContent></Card>
}

export function ScenariosSection({ assessment, refresh }: SectionProps) {
  const [title, setTitle] = useState("")
  const [prompt, setPrompt] = useState("")
  const [guidance, setGuidance] = useState("")
  const [competencyId, setCompetencyId] = useState("")
  const mutation = useMutation({ mutationFn: async () => { const scenario = await addScenario(assessment.id, { title, prompt, followUpGuidance: guidance, position: assessment.scenarios.length + 1 }); await mapScenarioCompetency(assessment.id, { scenarioId: scenario.id, competencyId }); return scenario }, onSuccess: async () => { setTitle(""); setPrompt(""); setGuidance(""); await refresh() } })
  return <div className="space-y-6"><div><h2 className="text-xl font-semibold">Scenarios</h2><p className="mt-1 text-sm text-muted-foreground">Scenarios run in this fixed order. Map every scenario to at least one competency.</p></div><div className="space-y-3">{assessment.scenarios.map((scenario) => <ScenarioEditor key={scenario.id} assessmentId={assessment.id} scenario={scenario} refresh={refresh} />)}</div><Card className="shadow-none"><CardHeader><CardTitle className="text-base">Add scenario</CardTitle></CardHeader><CardContent className="space-y-3"><Input placeholder="Scenario title" value={title} onChange={(e) => setTitle(e.target.value)} /><Textarea rows={5} placeholder="Scenario prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} /><Textarea rows={3} placeholder="Follow-up guidance" value={guidance} onChange={(e) => setGuidance(e.target.value)} /><select className="h-9 w-full rounded-md border bg-white px-3 text-sm" value={competencyId} onChange={(e) => setCompetencyId(e.target.value)}><option value="">Map to competency</option>{assessment.competencies.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><MutationMessage error={mutation.error} /><Button disabled={mutation.isPending || !title.trim() || !prompt.trim() || !competencyId} onClick={() => mutation.mutate()}>Add scenario</Button></CardContent></Card></div>
}

export function ResourcesSection({ assessment, refresh }: SectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const mutation = useMutation({ mutationFn: async () => { if (!file) throw new Error("Choose a PDF file."); const resource = await uploadResource(assessment.id, file); return processResource(assessment.id, resource.id) }, onSuccess: async () => { setFile(null); await refresh() } })
  return <div className="space-y-6"><div><h2 className="text-xl font-semibold">Resources</h2><p className="mt-1 text-sm text-muted-foreground">Upload PDF reference material. It is processed before the assessment can be published.</p></div>{assessment.resources.map((resource) => <div key={resource.id} className="flex items-center justify-between rounded-lg border bg-white p-4"><div className="flex items-center gap-3"><FileText className="size-5 text-muted-foreground" /><div><p className="text-sm font-medium">{resource.filename}</p><p className="text-xs text-muted-foreground">{Math.ceil(resource.byteSize / 1024)} KB</p></div></div><span className="font-mono text-xs">{resource.status}</span></div>)}<Card className="shadow-none"><CardContent className="space-y-4 pt-6"><div className="space-y-2"><Label htmlFor="resource">PDF resource</Label><Input id="resource" type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} /></div><MutationMessage error={mutation.error} success={mutation.isSuccess ? "Resource uploaded and processed." : undefined} /><Button disabled={!file || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? <Loader2 className="animate-spin" /> : <Upload />}Upload and process</Button></CardContent></Card></div>
}
