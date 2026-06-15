import { useTheme } from '../../context/useTheme'

/**
 * Sliding sun/moon toggle with a 3D-style track and eased thumb motion.
 */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
      className={`group relative inline-flex h-11 w-[4.5rem] shrink-0 items-center rounded-full border border-vv-border bg-vv-surface-muted px-1 shadow-inner transition-all duration-500 ease-out hover:border-vv-accent/40 hover:shadow-[0_8px_30px_-12px_var(--vv-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-vv-accent focus-visible:ring-offset-2 focus-visible:ring-offset-vv-bg ${className}`}
    >
      <span
        className="absolute inset-0 rounded-full opacity-40"
        style={{
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 45%, rgba(0,0,0,0.15) 100%)',
        }}
        aria-hidden
      />
      <span
        className="absolute inset-[3px] rounded-full border border-white/5 dark:border-white/10"
        style={{ boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.25)' }}
        aria-hidden
      />

      <span
        className={`absolute left-1 top-1 z-[1] flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-vv-accent to-vv-accent-dim shadow-[0_4px_14px_-2px_var(--vv-accent),inset_0_1px_0_rgba(255,255,255,0.35)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform group-hover:shadow-[0_6px_20px_-2px_var(--vv-accent),inset_0_1px_0_rgba(255,255,255,0.45)] ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        <span
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full opacity-40"
          aria-hidden
        >
          <span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent"
            style={{
              animation: 'vv-shine 3.2s ease-in-out infinite',
              transform: 'translateX(-100%) skewX(-12deg)',
            }}
          />
        </span>
        {isDark ? (
          <svg className="relative h-5 w-5 text-[#0A192F] drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        ) : (
          <svg className="relative h-5 w-5 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        )}
      </span>

      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 text-vv-muted" aria-hidden>
        <svg
          className={`h-4 w-4 transition-all duration-500 ${theme === 'light' ? 'scale-110 opacity-100' : 'scale-90 opacity-25'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0z" />
        </svg>
        <svg
          className={`h-4 w-4 transition-all duration-500 ${theme === 'dark' ? 'scale-110 opacity-100' : 'scale-90 opacity-25'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      </span>
    </button>
  )
}
