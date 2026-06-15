export default function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-vv-border border-t-vv-accent"
        aria-hidden
      />
      <span className="text-sm text-vv-muted">{label}</span>
    </div>
  )
}
