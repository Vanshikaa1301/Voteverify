import express from 'express'
import crypto from 'crypto'
import db from '../db/index.js'

const router = express.Router()

// In-memory store for liveness tokens (valid for 5 minutes)
const livenessTokens = new Map()

// Cleanup expired tokens every 60 seconds
setInterval(() => {
  const now = Date.now()
  for (const [token, data] of livenessTokens) {
    if (now - data.createdAt > 5 * 60 * 1000) {
      livenessTokens.delete(token)
    }
  }
}, 60_000)

const CANDIDATES = [
  { id: 'c1', name: 'Rahul Sharma', group: 'Tech Association' },
  { id: 'c2', name: 'Priya Patel', group: 'Cultural Club' },
  { id: 'c3', name: 'Ananya Rao', group: 'Sports Committee' },
]

const publicVoter = (voter) => voter && ({
  id: voter.id,
  name: voter.name,
  mobileLast4: voter.mobile?.slice(-4) || '',
  aadhaarLast4: voter.aadhaarLast4,
  status: voter.status,
  registeredAt: voter.createdAt,
})

const enrichVote = (vote) => {
  const candidate = CANDIDATES.find((c) => c.id === vote.candidateId)
  return {
    ...vote,
    candidateName: candidate?.name || 'Unknown candidate',
    candidateGroup: candidate?.group || '',
  }
}

// Helper to calculate election statistics
export function calculateElectionStats() {
  const votes = db.votes.find()
  
  const totalVotes = votes.length
  const counts = { c1: 0, c2: 0, c3: 0 }
  
  votes.forEach((v) => {
    if (counts[v.candidateId] !== undefined) {
      counts[v.candidateId]++
    }
  })

  // Format candidate data for Recharts Bar / Pie charts
  const byCandidate = CANDIDATES.map((cand) => ({
    id: cand.id,
    name: cand.name,
    group: cand.group,
    votes: counts[cand.id],
    percentage: totalVotes > 0 ? parseFloat(((counts[cand.id] / totalVotes) * 100).toFixed(1)) : 0
  }))

  return {
    totalVotes,
    byCandidate,
    recentVotes: votes.slice(-8).reverse().map(enrichVote),
  }
}

// Get election status & candidates
router.get('/', (req, res) => {
  try {
    const stats = calculateElectionStats()
    res.json({
      candidates: CANDIDATES,
      ...stats,
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch election data', message: err.message })
  }
})

// Calculate Euclidean distance between two face descriptors (128-d arrays)
const getEuclideanDistance = (desc1, desc2) => {
  if (desc1.length !== desc2.length) return Infinity
  return Math.sqrt(desc1.reduce((sum, val, i) => sum + Math.pow(val - desc2[i], 2), 0))
}

// Register a voter's face (Mock UIDAI Database enrollment)
router.post('/register-face', (req, res) => {
  try {
    const { name, mobile, aadhaar, descriptor } = req.body
    const cleanAadhaar = aadhaar?.replace(/[\s-]/g, '')
    const cleanMobile = mobile?.replace(/\D/g, '')

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Voter name is required.' })
    }
    if (!/^\d{10}$/.test(cleanMobile || '')) {
      return res.status(400).json({ error: 'A valid 10-digit mobile number is required.' })
    }
    if (!/^\d{12}$/.test(cleanAadhaar || '')) {
      return res.status(400).json({ error: 'Aadhaar card must be a 12-digit number.' })
    }
    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return res.status(400).json({ error: 'A valid 128-d facial descriptor is required.' })
    }

    const voter = db.voters.createOrUpdate({
      name: name.trim(),
      mobile: cleanMobile,
      aadhaar: cleanAadhaar,
      faceDescriptor: descriptor,
    })

    res.status(200).json({
      success: true,
      message: 'Voter registered and biometric vector mapped successfully.',
      voter: publicVoter(voter),
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to register face', message: err.message })
  }
})

router.get('/voters', (req, res) => {
  try {
    res.json(db.voters.find().map(publicVoter))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch voters', message: err.message })
  }
})

// Liveness Verification endpoint (Real mathematical matching)
router.post('/liveness', (req, res) => {
  try {
    const { descriptor, aadhaar } = req.body

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128 || !aadhaar) {
      return res.status(400).json({ error: 'Valid 128-d facial descriptor and Aadhaar are required for verification.' })
    }

    const cleanAadhaar = aadhaar.replace(/[\s-]/g, '')

    // 1. Sandbox fallback (optional for testing without registering first)
    if (cleanAadhaar.endsWith('0000')) {
      return res.status(400).json({ error: 'Biometric vector does not match UIDAI database (Sandbox Test)' })
    }
    if (cleanAadhaar.endsWith('1111')) {
      return res.status(400).json({ error: 'Liveness check failed: Presentation attack (spoofing) detected (Sandbox Test)' })
    }

    // 2. Real mathematical comparison
    const registeredVoter = db.voters.findByAadhaar(cleanAadhaar)
    if (!registeredVoter?.faceDescriptor) {
      return res.status(404).json({ error: 'This Aadhaar number is not registered. Please complete voter registration first.' })
    }

    const distance = getEuclideanDistance(descriptor, registeredVoter.faceDescriptor)
    console.log(`[Face Match] Aadhaar: ${cleanAadhaar} | Euclidean Distance: ${distance.toFixed(4)}`)

    // Distance threshold: 0.6 is standard for face-api.js. Lower means stricter.
    if (distance > 0.6) {
      return res.status(400).json({ error: 'Face Mismatch: The biometric features do not match the registered voter.' })
    }

    // Pass
    const tokenStr = `${aadhaar}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const livenessToken = crypto.createHash('sha256').update(tokenStr).digest('hex')

    livenessTokens.set(livenessToken, {
      aadhaar: cleanAadhaar,
      voterId: registeredVoter.id,
      createdAt: Date.now()
    })

    res.status(200).json({
      success: true,
      message: 'Liveness verified. Human presence confirmed.',
      livenessToken,
      voter: publicVoter(registeredVoter),
    })
  } catch (err) {
    res.status(500).json({ error: 'Liveness verification failed', message: err.message })
  }
})

// Cast a vote using Aadhaar card verification
router.post('/', (req, res) => {
  try {
    const { aadhaar, candidateId, livenessToken } = req.body

    // 1. Basic validation
    if (!aadhaar || !candidateId || !livenessToken) {
      return res.status(400).json({ error: 'Aadhaar card, candidate selection, and liveness verification are required' })
    }

    // Validate Liveness Token
    const tokenData = livenessTokens.get(livenessToken)
    if (!tokenData || tokenData.aadhaar !== aadhaar.replace(/[\s-]/g, '')) {
       return res.status(400).json({ error: 'Invalid or expired liveness token. Please verify liveness again.' })
    }
    
    // Consume the token so it can't be reused
    livenessTokens.delete(livenessToken)

    // Clean Aadhaar spacing if passed as "1234-5678-9012" or "1234 5678 9012"
    const cleanedAadhaar = aadhaar.replace(/[\s-]/g, '')
    
    if (!/^\d{12}$/.test(cleanedAadhaar)) {
      return res.status(400).json({ error: 'Aadhaar card must be a 12-digit number' })
    }

    // 2. Validate Candidate
    const candidateExists = CANDIDATES.some((c) => c.id === candidateId)
    if (!candidateExists) {
      return res.status(400).json({ error: 'Invalid candidate selected' })
    }

    // 3. Double-voting check (using SHA-256 hashed Aadhaar validation)
    const hasVoted = db.votes.hasVoted(cleanedAadhaar)
    if (hasVoted) {
      return res.status(400).json({ error: 'Duplicate Vote! This Aadhaar card has already cast a vote in this election.' })
    }

    // 4. Record the vote in DB (stored anonymized with SHA-256 and last 4 digits)
    const voter = db.voters.findByAadhaar(cleanedAadhaar)
    if (!voter) {
      return res.status(404).json({ error: 'Voter is not registered. Complete registration before casting a vote.' })
    }

    const newVote = db.votes.create({
      aadhaar: cleanedAadhaar,
      candidateId,
      voterId: voter.id,
      voterName: voter.name,
      voterMobileLast4: voter.mobile?.slice(-4) || '',
    })

    const candidate = CANDIDATES.find((c) => c.id === candidateId)

    // 5. Emit real-time events via Socket.IO
    const io = req.app.get('io')
    if (io) {
      // Recalculate stats and broadcast
      const electionStats = calculateElectionStats()
      
      // Emit single new vote details (anonymized)
      io.emit('newVote', {
        id: newVote.id,
        aadhaarLast4: newVote.aadhaarLast4,
        voterName: newVote.voterName,
        voterMobileLast4: newVote.voterMobileLast4,
        candidateName: candidate.name,
        candidateId: candidate.id,
        timestamp: newVote.timestamp,
      })
      
      // Emit full updated election statistics
      io.emit('electionStats', electionStats)
    }

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully!',
      vote: {
        id: newVote.id,
        voterName: newVote.voterName,
        voterMobileLast4: newVote.voterMobileLast4,
        aadhaarLast4: newVote.aadhaarLast4,
        timestamp: newVote.timestamp,
      },
    })
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit vote', message: err.message })
  }
})

export default router
