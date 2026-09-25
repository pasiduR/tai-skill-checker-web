import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { BrandMark } from "@/components/shared/BrandMark"
import { Button } from "@/components/ui/button"
import { signOut } from "../api/auth"

export function AccessPendingPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear()
      navigate("/employee/sign-in", { replace: true })
    },
  })

  return <main className="grid min-h-screen place-items-center bg-muted p-6">
    <section className="w-full max-w-lg rounded-3xl border bg-white p-8 sm:p-10">
      <BrandMark />
      <p className="eyebrow mt-10">No active access</p>
      <h1 className="font-display mt-3 text-4xl leading-tight">Open your invitation link.</h1>
      <p className="mt-5 leading-7 text-muted-foreground">Your email is verified, but no assessment invitation has been accepted. Return to the secure link in your invitation email.</p>
      <Button className="mt-8" variant="outline" loading={logout.isPending} onClick={() => logout.mutate()}>
        {logout.isPending ? "Signing out…" : "Sign out"}
      </Button>
    </section>
  </main>
}
