import db from '../db/index.js'
import { calculateStats } from '../routes/stats.js'

const SIMULATION_INTERVAL_MS = 20000 // Run simulation step every 20 seconds

const ISSUES = [
  { type: 'verification_mismatch', severity: 'high', message: 'Seal photograph hash mismatch at {booth}' },
  { type: 'verification_mismatch', severity: 'high', message: 'EVM status code mismatch at {booth}' },
  { type: 'late_sync', severity: 'medium', message: '{booth} has not synced in 15 minutes' },
  { type: 'offline_alert', severity: 'high', message: '{booth} connection lost abruptly' },
]

const PROOF_LABELS = [
  'Seal — front view',
  'EVM bay verification',
  'Queue check-in photo',
  'Polling paper bundle hash',
  'VVPAT verification code print',
  'Officer ID confirmation'
]

export function startSimulator(io) {
  console.log('[VoteVerify Telemetry Simulator] Started.');

  setInterval(() => {
    try {
      const booths = db.booths.find()
      if (booths.length === 0) return

      // Find all booths that are not verified yet
      const unverified = booths.filter((b) => b.status !== 'verified')
      
      // If everything is verified, randomly reset 3 booths back to pending or offline to keep the loop going!
      if (unverified.length === 0) {
        console.log('[VoteVerify Telemetry Simulator] All booths verified. Resetting a few to keep dashboard active.')
        for (let i = 0; i < 3; i++) {
          const randIdx = Math.floor(Math.random() * booths.length)
          const target = booths[randIdx]
          const newStatus = Math.random() > 0.5 ? 'pending' : 'offline'
          db.booths.update(target.id, {
            status: newStatus,
            lastVerificationAt: null
          })
          const updated = db.booths.findById(target.id)
          io.emit('boothUpdate', updated)
        }
        const stats = calculateStats()
        io.emit('verificationStats', stats)
        return
      }

      // Pick a random unverified booth (or any booth sometimes)
      const targetBooth = unverified[Math.floor(Math.random() * unverified.length)]
      const rand = Math.random()

      if (rand < 0.75) {
        // 75% chance: Verify the booth
        const updatedBooth = db.booths.update(targetBooth.id, {
          status: 'verified',
          lastVerificationAt: new Date().toISOString()
        })
        
        // Add a proof
        const seed = Math.floor(Math.random() * 1000)
        const newProof = db.proofs.create({
          boothId: targetBooth.id,
          imageUrl: `https://picsum.photos/seed/vv${seed}/400/300`,
          label: PROOF_LABELS[Math.floor(Math.random() * PROOF_LABELS.length)]
        })

        console.log(`[Simulator] Verified booth: ${targetBooth.name}. Added proof ID: ${newProof.id}`)

        // Emit socket events
        io.emit('boothUpdate', updatedBooth)
      } else if (rand < 0.90) {
        // 15% chance: Trigger an issue/alert
        const updatedBooth = db.booths.update(targetBooth.id, {
          status: 'issue',
          lastVerificationAt: new Date().toISOString()
        })

        const issueTemplate = ISSUES[Math.floor(Math.random() * ISSUES.length)]
        const message = issueTemplate.message.replace('{booth}', targetBooth.name)

        const newAlert = db.alerts.create({
          severity: issueTemplate.severity,
          type: issueTemplate.type,
          message,
          boothId: targetBooth.id,
          boothName: targetBooth.name
        })

        console.log(`[Simulator] Issue at booth: ${targetBooth.name}. Created alert ID: ${newAlert.id}`)

        // Emit socket events
        io.emit('boothUpdate', updatedBooth)
        io.emit('newAlert', newAlert)
      } else {
        // 10% chance: Go offline
        const updatedBooth = db.booths.update(targetBooth.id, {
          status: 'offline'
        })

        console.log(`[Simulator] Booth offline: ${targetBooth.name}`)

        // Emit socket events
        io.emit('boothUpdate', updatedBooth)
      }

      // Broadcast fresh global stats
      const stats = calculateStats()
      io.emit('verificationStats', stats)

    } catch (err) {
      console.error('[Simulator] Error in simulator loop:', err)
    }
  }, SIMULATION_INTERVAL_MS)
}
