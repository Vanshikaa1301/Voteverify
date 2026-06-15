import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const fakeLogs = [
  "Connecting to secure edge cluster...",
  "TLS Handshake complete. Connection established.",
  "Subscribed to topic: /booths/updates",
  "Subscribed to topic: /booths/alerts",
  "Awaiting telemetry streams...",
  "[UPDATE] Booth #402 offline cache synced.",
  "[ALERT] Queue length critical at #19: 145 citizens.",
  "[VERIFY] Proof hash 0x7a8b9f... verified against chain.",
  "[UPDATE] Booth #89 battery at 92%.",
  "[UPDATE] Battery warning: Booth #12 currently 18%.",
  "Receiving batch sync from district server...",
  "[VERIFY] 250 records cryptographically sealed.",
  "[UPDATE] Connection latency 23ms. Optimal.",
  "[ALERT] Unknown device signature blocked near #05.",
]

export default function LiveTerminalModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([])
  const endRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setLogs([])
      return
    }

    setLogs([fakeLogs[0], fakeLogs[1], fakeLogs[2], fakeLogs[3], fakeLogs[4]])
    
    let index = 5
    const interval = setInterval(() => {
      setLogs(prev => [...prev, fakeLogs[index] || `[UPDATE] Node ping latency ${Math.floor(Math.random() * 40)}ms`])
      index = (index + 1) % fakeLogs.length
      if(endRef.current) endRef.current.scrollIntoView({ behavior: 'smooth' })
    }, 1200)

    return () => clearInterval(interval)
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-vv-accent/40 bg-[#0B0F19] shadow-[0_0_50px_rgba(34,211,238,0.2)]"
          >
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500 cursor-pointer" onClick={onClose} title="Close Terminal" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <span className="text-xs font-mono text-gray-400">root@voteverify-edge:~#</span>
              <div className="w-16" /> {/* Spacer for balance */}
            </div>
            
            {/* Terminal Body */}
            <div className="h-[400px] overflow-y-auto p-4 font-mono text-sm leading-relaxed" style={{ scrollBehavior: 'smooth' }}>
              {logs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className="mb-1 flex gap-3"
                >
                  <span className="text-gray-500 select-none">[{new Date().toLocaleTimeString('en-US', { hour12: false })}]</span>
                  <span className={
                    log.includes('[ALERT]') ? 'text-red-400 font-bold' : 
                    log.includes('[VERIFY]') ? 'text-emerald-400' : 
                    log.includes('established') || log.includes('Subscribed') ? 'text-cyan-400' : 'text-gray-300'
                  }>
                    {log}
                  </span>
                </motion.div>
              ))}
              <div ref={endRef} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
