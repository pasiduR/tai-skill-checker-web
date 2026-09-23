export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return <div className="flex flex-col gap-5 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1 className="font-display mt-1.5 text-3xl leading-[1.1] sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
}
