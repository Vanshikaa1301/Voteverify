export default function EmptyState({ title, description, icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-vv-border bg-vv-surface-muted/50 px-6 py-16 text-center">
      {icon ? <div className="mb-4 text-vv-muted">{icon}</div> : null}
      <p className="text-base font-medium text-vv-text">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm text-vv-muted">{description}</p> : null}
    </div>
  )
}
