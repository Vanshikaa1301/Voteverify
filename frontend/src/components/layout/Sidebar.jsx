import { NavLink, Link } from 'react-router-dom'

const nav = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/map', label: 'Booth Map' },
  { to: '/dashboard/alerts', label: 'Alerts' },
  { to: '/dashboard/proofs', label: 'Live Proof Upload' },
  { to: '/dashboard/statistics', label: 'Statistics' },
  { to: '/dashboard/register', label: 'User Registration' },
  { to: '/dashboard/verify', label: 'Vote Casting' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-vv-border bg-vv-surface">
      <div className="border-b border-vv-border px-5 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-vv-accent/15 text-vv-accent">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-xs font-medium uppercase tracking-widest text-vv-accent">VoteVerify</p>
            <p className="text-sm font-semibold text-vv-heading">National Dashboard</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Main">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-vv-accent/15 text-vv-accent'
                  : 'text-vv-muted hover:bg-vv-surface-muted hover:text-vv-heading'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-vv-border p-4">
        <p className="text-xs text-vv-muted">Live polling booth verification · India</p>
        <Link
          to="/"
          className="mt-2 inline-block text-xs font-medium text-vv-accent hover:underline"
        >
          ← Landing page
        </Link>
      </div>
    </aside>
  )
}
