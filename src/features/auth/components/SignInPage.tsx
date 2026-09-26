import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, ShieldCheck, VoiceActivity } from "@/components/ui/icons"
import { useForm } from "react-hook-form"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"
import { queryKeys } from "@/api"
import { BrandMark } from "@/components/shared/BrandMark"
import { FieldError } from "@/components/shared/FieldError"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "../api/auth"
import { useAuth } from "../hooks/useAuth"
import { homePathForRole } from "../routing"

const schema = z.object({ email: z.email("Enter a valid email address."), password: z.string().min(8, "Password must be at least 8 characters.") })
type Values = z.infer<typeof schema>

export function SignInPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } })
  const mutation = useMutation({ mutationFn: signIn, onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.session })
    const destination = (location.state as { from?: string } | null)?.from ?? "/admin"
    navigate(destination, { replace: true })
  } })
  const emailError = form.formState.errors.email?.message
  const passwordError = form.formState.errors.password?.message
  if (auth.session && auth.role) return <Navigate to={homePathForRole(auth.role)} replace />
  return <main className="grid min-h-screen bg-[#0a0b0d] lg:grid-cols-[1.08fr_0.92fr]">
    <section className="relative hidden min-h-screen overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between xl:p-16">
      <BrandMark inverted />
      <div className="relative z-10 max-w-xl py-16">
        <p className="eyebrow !text-[#fa6619]">Evidence over instinct</p>
        <h1 className="font-display mt-5 text-6xl leading-[0.98] text-white xl:text-7xl">See what your people can actually do.</h1>
        <p className="mt-7 max-w-lg text-lg leading-8 text-[#a8acb3]">Structured voice assessments turn realistic conversations into clear, evidence backed skill reports.</p>
      </div>
      <div className="relative z-10 grid max-w-xl grid-cols-3 gap-3">
        {[{ icon: VoiceActivity, label: "Voice first" }, { icon: ShieldCheck, label: "Private" }, { icon: CheckCircle2, label: "Evidence backed" }].map(({ icon: Icon, label }) => <div key={label} className="rounded-3xl bg-[#16181c] p-5 text-white"><Icon className="mb-6 size-5 text-primary" /><p className="text-sm font-medium">{label}</p></div>)}
      </div>
      <div className="absolute -right-28 top-16 size-96 rounded-full border border-white/10" aria-hidden="true" /><div className="absolute -right-5 top-44 size-52 rounded-full bg-primary" aria-hidden="true" />
    </section>
    <section className="flex min-h-screen min-w-0 flex-col overflow-hidden bg-white px-6 py-8 sm:px-12 lg:justify-center lg:px-16 xl:px-24">
      <div className="mb-16 lg:hidden"><BrandMark /></div>
      <div className="mx-auto w-full min-w-0 max-w-md">
        <p className="eyebrow">Administrator access</p>
        <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">Welcome back.</h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">Sign in with the administrator credentials configured for this workspace.</p>
        <form className="mt-10 space-y-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" autoComplete="email" placeholder="you@company.com" aria-invalid={Boolean(emailError)} aria-describedby={emailError ? "email-error" : undefined} {...form.register("email")} /><FieldError id="email-error" message={emailError} /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" autoComplete="current-password" placeholder="At least 8 characters" aria-invalid={Boolean(passwordError)} aria-describedby={passwordError ? "password-error" : undefined} {...form.register("password")} /><FieldError id="password-error" message={passwordError} /></div>
          {mutation.error && <p className="text-sm text-destructive" role="alert">{mutation.error.message}</p>}
          <Button size="lg" className="w-full" loading={mutation.isPending}>{mutation.isPending ? "Signing in…" : "Sign in"}</Button>
        </form>
      </div>
    </section>
  </main>
}
