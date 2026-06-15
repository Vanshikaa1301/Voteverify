import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/landing/ThemeToggle'

export default function Team() {
  return (
    <div className="relative min-h-screen bg-vv-bg text-vv-text transition-colors duration-500">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
        <Link to="/" className="text-sm font-medium text-vv-accent hover:underline">
          ← Back home
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-4xl px-4 py-16">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold text-vv-heading sm:text-5xl">Meet the Team</h1>
          <p className="mt-4 text-lg text-vv-muted">
            We are a group of developers passionate about civic tech and open data.
          </p>
          
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {[1, 2, 3, 4].map((member) => (
              <div key={member} className="flex items-center gap-4 rounded-2xl border border-vv-border bg-vv-surface p-4 shadow-sm">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-vv-surface-muted ring-2 ring-vv-accent/30 flex items-center justify-center font-bold text-vv-accent">
                  TM
                </div>
                <div>
                  <h3 className="text-lg font-bold text-vv-heading">Team Member {member}</h3>
                  <p className="text-sm text-vv-muted">Full Stack Developer</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
