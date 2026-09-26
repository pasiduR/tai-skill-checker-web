import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/shared/FieldError"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { overviewSchema } from "../schemas"

export type OverviewValues = z.infer<typeof overviewSchema>

export function OverviewForm({ initial, submitLabel, pending, error, onSubmit }: { initial?: OverviewValues; submitLabel: string; pending: boolean; error?: string; onSubmit: (values: OverviewValues) => void }) {
  const form = useForm<OverviewValues>({ resolver: zodResolver(overviewSchema), defaultValues: initial ?? { name: "", description: "", preparationInstructions: "" } })
  const nameError = form.formState.errors.name?.message
  const descriptionError = form.formState.errors.description?.message
  const preparationError = form.formState.errors.preparationInstructions?.message
  return <form className="max-w-3xl space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
    <div className="space-y-2"><Label htmlFor="name">Assessment name</Label><Input id="name" maxLength={200} aria-invalid={Boolean(nameError)} aria-describedby={nameError ? "name-error" : undefined} {...form.register("name")} /><FieldError id="name-error" message={nameError} /></div>
    <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" rows={5} maxLength={10_000} aria-invalid={Boolean(descriptionError)} aria-describedby={descriptionError ? "description-error" : undefined} {...form.register("description")} /><FieldError id="description-error" message={descriptionError} /></div>
    <div className="space-y-2"><Label htmlFor="preparation">Preparation instructions</Label><Textarea id="preparation" rows={5} maxLength={10_000} aria-invalid={Boolean(preparationError)} aria-describedby={preparationError ? "preparation-error" : undefined} placeholder="What should employees know before they begin?" {...form.register("preparationInstructions")} /><FieldError id="preparation-error" message={preparationError} /></div>
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    <Button loading={pending}>{pending ? "Saving…" : submitLabel}</Button>
  </form>
}
