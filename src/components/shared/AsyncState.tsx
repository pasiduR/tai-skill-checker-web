import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

export function PageSkeleton() {
  return <div className="space-y-4" aria-label="Loading"><Skeleton className="h-8 w-64" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>
}

export function ErrorNotice({ message }: { message: string }) {
  return <Alert variant="destructive" role="alert"><AlertTitle>Something went wrong</AlertTitle><AlertDescription>{message}</AlertDescription></Alert>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <div className="rounded-xl border bg-white px-6 py-12 text-center"><h2 className="text-lg font-semibold">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>{action && <div className="mt-6">{action}</div>}</div>
}
