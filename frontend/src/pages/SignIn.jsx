import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/landing/ThemeToggle'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSignin = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const res = await signIn(email, password)
    setLoading(false)

    if (res.success) {
      navigate('/dashboard')
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="relative min-h-screen bg-vv-bg text-vv-text transition-colors duration-500 flex flex-col">
      <header className="mx-auto w-full max-w-lg flex items-center justify-between px-4 py-5">
        <Link to="/" className="text-sm font-medium text-vv-accent hover:underline">
          ← Back home
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 flex flex-col justify-center px-4 pb-24">
        <h1 className="text-3xl font-bold text-vv-heading">Sign in</h1>
        <p className="mt-2 text-vv-muted">
          Access the observer dashboard with your credentials.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSignin} className="mt-6 rounded-2xl border border-vv-border bg-vv-surface p-6 shadow-card space-y-4">
          <div>
            <label className="block text-sm font-medium text-vv-heading mb-1">Email</label>
            <input
              type="email"
              required
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-vv-border bg-vv-bg px-4 py-2.5 text-vv-text focus:border-vv-accent focus:outline-none focus:ring-1 focus:ring-vv-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-vv-heading mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-vv-border bg-vv-bg px-4 py-2.5 text-vv-text focus:border-vv-accent focus:outline-none focus:ring-1 focus:ring-vv-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-vv-accent py-3 text-sm font-semibold text-white shadow-lg shadow-vv-accent/30 transition hover:bg-vv-accent-dim disabled:opacity-70 dark:text-navy"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin text-white dark:text-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>

          <div className="text-center text-xs text-vv-muted pt-2">
            Don't have an account?{' '}
            <Link to="/sign-up" className="text-vv-accent hover:underline">
              Create Account
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
