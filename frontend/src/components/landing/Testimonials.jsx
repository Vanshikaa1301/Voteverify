import { motion } from 'framer-motion'

export default function Testimonials() {
  const reviews = [
    { name: "Election Commission", handle: "@eci", text: "VoteVerify's dashboard gave us zero-lag insights into 1.2M polling stations seamlessly." },
    { name: "Civic Auditor", handle: "@open_audits", text: "Cryptographic proofs mapped in real-time. Finally, a system built for transparency scaling." },
    { name: "Booth Officer", handle: "@democracy_worker", text: "The IoT integration is flawless. Checking in our booth took seconds, securely." },
    { name: "Tech Observer", handle: "@hackathon_judge", text: "This is easily the most polished, scalable implementation of transparent telemetry I've seen." },
  ]

  return (
    <div className="mx-auto mt-32 overflow-hidden py-10 relative z-10">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-vv-heading sm:text-4xl">
          Adopted & Trusted
        </h2>
        <p className="mt-4 text-vv-muted">See what officials and auditors are saying.</p>
      </div>

      <div className="relative flex w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden group">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-vv-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-vv-bg to-transparent z-10 pointer-events-none" />
        
        <motion.div 
          className="flex whitespace-nowrap gap-6 px-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(2)].map((_, arrayIndex) => (
            <div key={arrayIndex} className="flex gap-6">
              {reviews.map((r, i) => (
                <div 
                  key={i} 
                  className="w-[300px] whitespace-normal sm:w-[400px] flex flex-col gap-4 rounded-3xl border border-vv-border bg-vv-surface/50 p-6 shadow-xl backdrop-blur-md transition hover:border-vv-accent/50 hover:-translate-y-2 cursor-crosshair"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-vv-accent to-purple-500 shadow-inner" />
                    <div>
                      <h4 className="font-bold text-vv-heading leading-tight">{r.name}</h4>
                      <p className="text-xs text-vv-muted">{r.handle}</p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-vv-heading font-medium italic">"{r.text}"</p>
                </div>
              ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
