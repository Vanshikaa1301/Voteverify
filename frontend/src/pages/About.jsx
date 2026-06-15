import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ThemeToggle from '../components/landing/ThemeToggle'

export default function About() {
  return (
    <div className="relative min-h-screen bg-vv-bg text-vv-text transition-colors duration-500">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
        <Link to="/" className="text-sm font-medium text-vv-accent hover:underline">
          ← Back home
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-4xl px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl font-extrabold text-vv-heading sm:text-5xl">About VoteVerify</h1>
          <p className="mt-6 text-lg text-vv-muted leading-relaxed">
            VoteVerify was built to tackle the challenges of modern election transparency. By integrating edge IoT devices at polling stations with our centralized immutable log, we aim to eliminate blind spots in the electoral process. 
          </p>
          <p className="mt-4 text-lg text-vv-muted leading-relaxed">
            Our mission is to establish nationwide trust through verifiable, real-time data streams that citizens, auditors, and officials can observe simultaneously without lag.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
