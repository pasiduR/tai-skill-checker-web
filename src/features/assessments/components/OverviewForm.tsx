import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { overviewSchema } from "../schemas"

export type OverviewValues = z.infer<typeof overviewSchema>

export function OverviewForm({ initial, submitLabel, pending, error, onSubmit }: { initial?: OverviewValues; submitLabel: string; pending: boolean; error?: string; onSubmit: (values: OverviewValues) => void }) {
  const form = useForm<OverviewValues>({ resolver: zodResolver(overviewSchema), defaultValues: initial ?? { name: "", description: "", preparationInstructions: "" } })
  return <form className="max-w-3xl space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
    <div className="space-y-2"><Label htmlFor="name">Assessment name</Label><Input id="name" {...form.register("name")} />{form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" rows={5} {...form.register("description")} />{form.formState.errors.description && <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>}</div>
    <div className="space-y-2"><Label htmlFor="preparation">Preparation instructions</Label><Textarea id="preparation" rows={5} placeholder="What should employees know before they begin?" {...form.register("preparationInstructions")} /></div>
    {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    <Button disabled={pending}>{pending ? "Saving…" : submitLabel}</Button>
  </form>
}
