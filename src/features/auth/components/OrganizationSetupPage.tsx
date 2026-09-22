import { useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { Navigate, useNavigate } from "react-router-dom"
import { z } from "zod"
import { queryKeys } from "@/api"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { bootstrapOrganization } from "../api/auth"
import { useAuth } from "../hooks/useAuth"

const schema = z.object({
  organizationName: z.string().trim().min(1, "Organization name is required.").max(200),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens."),
})
type Values = z.infer<typeof schema>

export function OrganizationSetupPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { organizationName: "", slug: "" } })
  const name = form.watch("organizationName")
  const suggestedSlug = useMemo(() => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), [name])
  const mutation = useMutation({ mutationFn: bootstrapOrganization, onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.membership(auth.session?.user.id) })
    await queryClient.invalidateQueries({ queryKey: queryKeys.assessments })
    navigate("/admin", { replace: true })
  } })
  if (auth.isLoading) return <main className="p-8 text-sm text-muted-foreground">Loading session…</main>
  if (!auth.session) return <Navigate to="/sign-in" replace />
  if (auth.role === "ADMIN") return <Navigate to="/admin" replace />
  if (auth.role === "EMPLOYEE") return <Navigate to="/employee" replace />
  return <main className="min-h-screen bg-[#0a0b0d] px-4 py-8 sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between"><BrandMark inverted /><p className="eyebrow hidden !text-[#a8acb3] sm:block">First-time setup</p></div><div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl place-items-center py-12"><Card className="w-full max-w-xl border-0"><CardHeader><p className="eyebrow">Workspace setup</p><CardTitle className="font-display mt-2 text-4xl font-normal sm:text-5xl">Create your organization.</CardTitle><CardDescription className="text-base">This one-time step makes your account the administrator.</CardDescription></CardHeader><CardContent><form className="space-y-5" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}><div className="space-y-2"><Label htmlFor="organizationName">Organization name</Label><Input id="organizationName" {...form.register("organizationName")} onBlur={() => { if (!form.getValues("slug")) form.setValue("slug", suggestedSlug, { shouldValidate: true }) }} />{form.formState.errors.organizationName && <p className="text-sm text-destructive">{form.formState.errors.organizationName.message}</p>}</div><div className="space-y-2"><Label htmlFor="slug">Organization slug</Label><Input id="slug" placeholder="my-company" {...form.register("slug")} />{form.formState.errors.slug && <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>}</div>{mutation.error && <p className="text-sm text-destructive" role="alert">{mutation.error.message}</p>}<Button size="lg" className="w-full" disabled={mutation.isPending}>{mutation.isPending ? "Creating organization…" : "Create organization"}</Button></form></CardContent></Card></div></main>
}
