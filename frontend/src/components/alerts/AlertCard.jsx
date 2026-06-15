const severityStyles = {
  high: 'border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-200',
  medium: 'border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100',
  low: 'border-slate-400/40 bg-slate-500/10 text-slate-800 dark:text-slate-200',
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function AlertCard({ alert }) {
  const sev = severityStyles[alert.severity] || severityStyles.low
  return (
    <article
      className={`rounded-lg border px-4 py-3 ${sev}`}
      aria-label={`Alert: ${alert.message}`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide opacity-90">
        <span className="font-semibold">{alert.severity}</span>
        <span className="text-vv-heading/40 dark:text-white/40">·</span>
        <span>{alert.type?.replace(/_/g, ' ')}</span>
        {alert.boothName ? (
          <>
            <span className="text-vv-heading/40 dark:text-white/40">·</span>
            <span>{alert.boothName}</span>
          </>
        ) : null}
      </div>
      <p className="mt-2 text-sm leading-relaxed">{alert.message}</p>
      <time className="mt-2 block text-xs opacity-70" dateTime={alert.createdAt}>
        {formatTime(alert.createdAt)}
      </time>
    </article>
  )
}
