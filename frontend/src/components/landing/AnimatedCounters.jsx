import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useSpring, useTransform } from 'framer-motion'

function Counter({ from, to, duration = 2 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  
  const spring = useSpring(from, { mass: 1, stiffness: 50, damping: 20 })
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())

  useEffect(() => {
    if (inView) {
      spring.set(to)
    }
  }, [inView, spring, to])

  return <motion.span ref={ref}>{display}</motion.span>
}

export default function AnimatedCounters() {
  const stats = [
    { label: 'Booths Monitored', value: 1245600, suffix: '+' },
    { label: 'Uptime', value: 99.99, suffix: '%' },
    { label: 'Alerts Processed', value: 45000, suffix: '' },
    { label: 'Proofs Verified', value: 3.5, suffix: 'M' },
  ]

  return (
    <div className="mx-auto mt-32 max-w-6xl px-4 relative z-10">
      <div className="rounded-3xl border border-vv-border/50 bg-vv-surface/40 p-8 shadow-2xl backdrop-blur-md sm:p-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {stats.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center"
            >
              <h4 className="text-4xl font-black text-vv-heading sm:text-5xl md:text-6xl mb-2 flex items-baseline">
                <Counter from={0} to={s.value} />
                <span className="text-2xl text-vv-accent ml-1">{s.suffix}</span>
              </h4>
              <p className="text-sm font-semibold uppercase tracking-widest text-vv-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
