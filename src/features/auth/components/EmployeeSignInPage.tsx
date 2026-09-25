import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Mail, ShieldCheck } from "@/components/ui/icons"
import { useForm } from "react-hook-form"
import { Navigate, useSearchParams } from "react-router-dom"
import { z } from "zod"
import { BrandMark } from "@/components/shared/BrandMark"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { requestEmployeeSignIn } from "../api/auth"
import { useAuth } from "../hooks/useAuth"
import { homePathForRole } from "../routing"

const schema = z.object({ email: z.email("Enter a valid email address.") })
type Values = z.infer<typeof schema>

export function EmployeeSignInPage() {
  const auth = useAuth()
  const [searchParams] = useSearchParams()
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "" } })
  const signIn = useMutation({ mutationFn: requestEmployeeSignIn })

  if (auth.session && auth.role) return <Navigate to={homePathForRole(auth.role)} replace />

  return <main className="grid min-h-screen place-items-center bg-muted px-5 py-10">
    <section className="w-full max-w-lg rounded-3xl border bg-white p-7 sm:p-10">
      <BrandMark />
      <div className="mt-10 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><ShieldCheck /></div>
      <p className="eyebrow mt-8">Employee access</p>
      <h1 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">Return to your assessments.</h1>
      <p className="mt-4 leading-7 text-muted-foreground">Enter the email address used for your invitation. We will send a fresh, one-time sign-in link.</p>

      {searchParams.get("reason") === "invalid-link" && <Alert className="mt-8"><AlertTitle>That link was already used or expired</AlertTitle><AlertDescription>Request a fresh sign-in link below.</AlertDescription></Alert>}

      {signIn.isSuccess ? <Alert className="mt-8"><Mail /><AlertTitle>Check your inbox</AlertTitle><AlertDescription>If this email has employee access, a secure sign-in link is on its way. The link expires shortly.</AlertDescription></Alert> : <form className="mt-8 space-y-5" onSubmit={form.handleSubmit((values) => signIn.mutate(values))}>
        <div className="space-y-2">
          <Label htmlFor="employee-email">Email address</Label>
          <Input id="employee-email" type="email" autoComplete="email" placeholder="you@company.com" {...form.register("email")} />
          {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
        </div>
        {signIn.error && <p className="text-sm text-destructive" role="alert">We could not request a sign-in link. Please wait and try again.</p>}
        <Button size="lg" className="w-full" disabled={signIn.isPending}>{signIn.isPending ? "Sending secure link…" : "Email me a sign-in link"}</Button>
      </form>}
    </section>
  </main>
}
