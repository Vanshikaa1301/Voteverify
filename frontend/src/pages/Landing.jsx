import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import Background3D from '../components/landing/Background3D'
import ThemeToggle from '../components/landing/ThemeToggle'
import AnimatedCounters from '../components/landing/AnimatedCounters'
import Testimonials from '../components/landing/Testimonials'
import LiveTerminalModal from '../components/landing/LiveTerminalModal'

const fadeUpVariant = {
  hidden: { opacity: 0, y: 50, filter: 'blur(10px)', scale: 0.9 },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', scale: 1, transition: { type: 'spring', bounce: 0.4, duration: 0.8 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
}

const textStagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const letterAnim = {
  hidden: { opacity: 0, y: 40, rotateX: -90 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', damping: 12, stiffness: 200 } }
}

const floatingItem = {
  animate: { y: [0, -15, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' } },
}

const features = [
  {
    title: 'Nationwide booth coverage',
    body: 'Monitor every registered polling station from a single operations view aligned with ECI reporting structures.',
  },
  {
    title: 'Evidence you can trust',
    body: 'Cryptographic proofs, imagery, and audit trails designed to pair with your Node.js API and immutable storage.',
  },
  {
    title: 'Operations-first UX',
    body: 'Built for control rooms: fast maps, alert triage, and statistics that stay readable under pressure.',
  },
]

const steps = [
  { step: '01', title: 'IoT Check-in', desc: 'Secure boot on booth devices signals readiness to our edge servers.' },
  { step: '02', title: 'Cryptographic Proof', desc: 'Periodic image hashes and state data are signed locally.' },
  { step: '03', title: 'Dashboard Sync', desc: 'Socket.IO pushes signed telemetry instantly to the dashboard.' },
  { step: '04', title: 'Immutable Ledger', desc: 'Batches of proofs are anchored to external storage.' },
]

export default function Landing() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-transparent text-vv-text transition-colors duration-500">
      <Background3D />

      <div className="relative z-10">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 text-vv-heading">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-vv-accent/15 text-vv-accent shadow-sm ring-1 ring-vv-accent/20">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-tight">VoteVerify</span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4" aria-label="Account">
            <ThemeToggle />
            <Link
              to="/about"
              className="rounded-lg px-4 py-2 text-sm font-medium text-vv-heading transition hover:text-vv-accent"
            >
              About
            </Link>
            <Link
              to="/team"
              className="rounded-lg px-4 py-2 text-sm font-medium text-vv-heading transition hover:text-vv-accent"
            >
              Team
            </Link>
            <Link
              to="/sign-in"
              className="rounded-lg bg-vv-accent px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-vv-accent/25 transition hover:bg-vv-accent-dim hover:shadow-vv-accent/35 dark:text-navy"
            >
              Sign in
            </Link>
          </nav>
        </header>

        <main>
          <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 sm:pt-12 lg:px-8 lg:pt-16">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -5 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                className="inline-block rounded-full bg-vv-accent/10 px-4 py-1.5 mb-6 shadow-[0_0_30px_#4f46e540] ring-1 ring-vv-accent/30 backdrop-blur-md"
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-vv-accent">Live Telemetry Active</span>
              </motion.div>

              <motion.h1
                variants={textStagger}
                className="text-5xl font-extrabold leading-[1.1] tracking-tight text-vv-heading sm:text-6xl lg:text-7xl"
              >
                {"Verify every booth.".split(" ").map((word, i) => (
                  <span key={i} className="inline-block mr-3 overflow-hidden">
                    <motion.span variants={letterAnim} className="inline-block">{word}</motion.span>
                  </span>
                ))}
                <br className="hidden sm:block" />
                <span className="bg-[length:200%_auto] bg-gradient-to-r from-vv-accent via-[#ff4081] to-vv-accent-dim bg-clip-text text-transparent italic pr-2 transition-all duration-300 hover:from-cyan-400 hover:via-emerald-400 hover:to-blue-500 hover:drop-shadow-[0_0_15px_rgba(56,189,248,0.8)] cursor-pointer hover:animate-pulse">
                  {"In real time.".split(" ").map((word, i) => (
                    <span key={i} className="inline-block mr-3 overflow-hidden pointer-events-none">
                      <motion.span variants={letterAnim} className="inline-block pb-2">{word}</motion.span>
                    </span>
                  ))}
                </span>
              </motion.h1>

              <motion.p variants={fadeUpVariant} className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-vv-muted">
                VoteVerify is the national dashboard for live polling booth verification.
                <span className="text-vv-heading font-medium"> Watch the truth stream live.</span>
              </motion.p>

              <motion.div variants={fadeUpVariant} className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row perspective-1000">
                <motion.div whileHover={{ scale: 1.05, translateY: -5 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/sign-up"
                    style={{ boxShadow: '0 0 40px -10px rgba(79, 70, 229, 0.7)' }}
                    className="relative inline-flex w-full min-w-[220px] items-center justify-center overflow-hidden rounded-2xl bg-vv-accent px-8 py-4 text-base font-bold text-white transition-all hover:bg-vv-accent-dim dark:text-navy sm:w-auto"
                  >
                    Create an account
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05, translateY: -5 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/sign-in"
                    className="inline-flex w-full min-w-[220px] items-center justify-center rounded-2xl border-2 border-vv-border bg-vv-surface/80 px-8 py-4 text-base font-bold text-vv-heading shadow-xl backdrop-blur-xl transition hover:border-vv-accent hover:bg-vv-surface sm:w-auto"
                  >
                    Launch operator console
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            <AnimatedCounters />

            <motion.div
              className="mx-auto mt-32 grid max-w-5xl gap-6 sm:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  variants={fadeUpVariant}
                  style={{ perspective: 1000 }}
                  className="h-full"
                >
                  <motion.article
                    whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5, zIndex: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="flex h-full flex-col justify-center rounded-3xl border border-vv-border bg-gradient-to-br from-vv-surface/90 to-vv-surface/40 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl transition-colors hover:border-vv-accent/50 cursor-crosshair"
                  >
                    <motion.h2 style={{ translateZ: 50 }} className="text-xl font-bold text-vv-heading">{f.title}</motion.h2>
                    <motion.p style={{ translateZ: 30 }} className="mt-3 text-sm leading-relaxed text-vv-muted">{f.body}</motion.p>
                  </motion.article>
                </motion.div>
              ))}
            </motion.div>

            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
              className="mx-auto mt-24 max-w-4xl rounded-3xl border border-vv-border bg-gradient-to-br from-vv-surface-muted/90 to-vv-surface/50 p-8 shadow-card backdrop-blur-md sm:p-10"
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-vv-heading">Live, not lagging</h2>
                  <p className="mt-3 max-w-xl text-vv-muted">
                    Socket.IO pushes booth updates, new alerts, and rolling verification stats straight to operators—no
                    refresh roulette when minutes matter.
                  </p>
                </div>
                <motion.button
                  variants={floatingItem}
                  animate="animate"
                  onClick={() => setIsTerminalOpen(true)}
                  className="flex shrink-0 items-center justify-start gap-3 rounded-2xl border border-vv-accent/30 bg-vv-accent/10 px-5 py-4 cursor-pointer hover:bg-vv-accent/20 transition-colors text-left shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] outline-none"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vv-accent opacity-60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-vv-accent" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-vv-heading">Real-time channel</p>
                    <p className="text-xs text-vv-muted">boothUpdate · newAlert · verificationStats</p>
                  </div>
                </motion.button>
              </div>
            </motion.section>

            {/* How it Works Section */}
            <motion.div
              className="mx-auto mt-32 max-w-5xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <div className="mb-12 text-center">
                <motion.h2 variants={fadeUpVariant} className="text-3xl font-bold text-vv-heading sm:text-4xl">
                  How VoteVerify Works
                </motion.h2>
                <motion.p variants={fadeUpVariant} className="mt-4 text-vv-muted">
                  From polling booth to decentralized storage in milliseconds.
                </motion.p>
              </div>
              <div className="grid gap-6 md:grid-cols-4">
                {steps.map((s, i) => (
                  <motion.div key={i} variants={fadeUpVariant} className="relative flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-vv-accent/10 text-xl font-bold text-vv-accent mb-4 ring-1 ring-vv-accent/20">
                      {s.step}
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-vv-heading">{s.title}</h3>
                    <p className="text-sm text-vv-muted">{s.desc}</p>
                    {i !== steps.length - 1 && (
                      <div className="hidden md:absolute md:top-8 md:left-1/2 md:block md:h-px md:w-full md:bg-gradient-to-r md:from-vv-accent/0 md:via-vv-accent/50 md:to-vv-accent/0" />
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <Testimonials />

            {/* Infinite Tech Marquee */}
            <div className="mt-32 pb-32 overflow-hidden w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-vv-bg to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-vv-bg to-transparent z-10" />
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-vv-muted mb-12 text-center">
                National scale coverage across all 28 states
              </p>
              <motion.div
                className="flex whitespace-nowrap gap-12 items-center px-4"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              >
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-12 items-center">
                    {["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"].map(state => (
                      <span key={state} className="text-4xl font-extrabold text-vv-heading opacity-20 hover:opacity-100 hover:text-vv-accent transition-all cursor-default scale-95 hover:scale-110">{state}</span>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          <footer className="border-t border-vv-border bg-vv-surface-muted/50 py-8 text-center text-sm text-vv-muted">
            <p>VoteVerify — built for transparency at national scale.</p>
            <p className="mt-2">
              <Link to="/sign-in" className="font-medium text-vv-accent hover:underline">
                Operator console
              </Link>
              <span className="mx-2 opacity-40">·</span>
              <Link to="/sign-in" className="hover:text-vv-heading">
                Sign in
              </Link>
            </p>
          </footer>
        </main>
        <LiveTerminalModal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
      </div>
    </div>
  )
}
