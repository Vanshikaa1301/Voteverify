export default function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <div className="rounded-xl border border-vv-border bg-vv-surface p-5 shadow-card transition hover:border-vv-accent/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-vv-muted">{title}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-vv-heading">{value}</p>
          {subtitle ? <p className="mt-1 text-sm text-vv-muted">{subtitle}</p> : null}
          {trend != null ? (
            <p className={`mt-2 text-xs font-medium ${trend >= 0 ? 'text-vv-accent' : 'text-amber-600 dark:text-amber-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last hour
            </p>
          ) : null}
        </div>
        {icon ? (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-vv-accent/10 text-vv-accent">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  )
}
