export default function ErrorState({ message, onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-amber-500/40 bg-amber-500/10 px-6 py-12 text-center dark:border-amber-500/30"
      role="alert"
    >
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">{message || 'Something went wrong.'}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-vv-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:opacity-90 dark:text-[#0A192F]"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
