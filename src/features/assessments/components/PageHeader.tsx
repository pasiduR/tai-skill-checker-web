export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return <div className="flex flex-col gap-6 border-b pb-8 sm:flex-row sm:items-end sm:justify-between">
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1 className="font-display mt-2 text-4xl leading-[1.08] sm:text-5xl">{title}</h1>{description && <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>}</div>
    {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
  </div>
}
