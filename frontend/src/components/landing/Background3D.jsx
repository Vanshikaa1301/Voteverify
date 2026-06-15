import { motion } from 'framer-motion'

export default function Background3D() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-vv-bg transition-colors duration-500">
      {/* Intense grid background */}
      <div 
        className="absolute inset-0 opacity-40 dark:opacity-20 transition-opacity duration-500" 
        style={{ 
          backgroundImage: `
            linear-gradient(var(--vv-border) 1px, transparent 1px),
            linear-gradient(90deg, var(--vv-border) 1px, transparent 1px)
          `, 
          backgroundSize: '40px 40px' 
        }} 
      />
      
      {/* Animated glowing orbs */}
      <motion.div 
        animate={{ 
          x: [0, 150, -50, 0], 
          y: [0, -100, 150, 0],
          scale: [1, 1.3, 0.8, 1],
          opacity: [0.3, 0.5, 0.2, 0.3]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px]"
      />
      
      <motion.div 
        animate={{ 
          x: [0, -200, 100, 0], 
          y: [0, 150, -100, 0],
          scale: [1, 1.5, 0.9, 1],
          opacity: [0.2, 0.4, 0.1, 0.2]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-fuchsia-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px]"
      />
      
      <motion.div 
        animate={{ 
          x: [0, 100, -100, 0], 
          y: [0, 200, -50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.1, 0.2]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute top-[20%] left-[40%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[150px]"
      />

      {/* Floating isometric panels for the 3D look in the background */}
      <div
        className="absolute left-[60%] top-[30%] h-[min(100vw,600px)] w-[min(100vw,600px)] -translate-x-1/2 -translate-y-1/2 opacity-70 dark:opacity-50 transition-opacity duration-500"
        style={{ perspective: '1200px' }}
      >
        <div
          className="relative h-full w-full"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateZ(-40deg)' }}
        >
          <motion.div 
            animate={{ z: [0, 50, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[10%] top-[20%] h-[40%] w-[60%] rounded-[2rem] border border-cyan-400/50 bg-gradient-to-br from-cyan-500/10 to-transparent shadow-[0_0_50px_rgba(34,211,238,0.2)] backdrop-blur-md" 
          />
          <motion.div 
            animate={{ z: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-[10%] top-[40%] h-[30%] w-[50%] rounded-[2rem] border border-fuchsia-500/50 bg-gradient-to-br from-fuchsia-500/10 to-transparent shadow-[0_0_50px_rgba(217,70,239,0.2)] backdrop-blur-md" 
          />
        </div>
      </div>

      {/* Noise overlay to make it look cinematic */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--vv-bg))' }} />
    </div>
  )
}
