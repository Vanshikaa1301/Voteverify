import express from 'express'
import db from '../db/index.js'

const router = express.Router()

// Get all proofs
router.get('/', (req, res) => {
  try {
    const proofs = db.proofs.find()
    res.json(proofs)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch proofs', message: err.message })
  }
})

// Create a new proof
router.post('/', (req, res) => {
  try {
    const { boothId, imageUrl, label, reporterName, incidentType, notes, aadhaar } = req.body

    if (!boothId || !imageUrl) {
      return res.status(400).json({ error: 'boothId and imageUrl are required' })
    }

    const cleanAadhaar = aadhaar?.replace(/[\s-]/g, '')

    const newProof = db.proofs.create({
      boothId,
      imageUrl,
      label: label || 'Proof image',
      reporterName: reporterName?.trim() || 'Anonymous reporter',
      incidentType: incidentType || 'general',
      notes: notes?.trim() || '',
      aadhaarLast4: /^\d{12}$/.test(cleanAadhaar || '') ? cleanAadhaar.slice(-4) : '',
    })

    // Auto-verify booth when proof is submitted!
    const booth = db.booths.findById(boothId)
    if (booth && booth.status !== 'verified') {
      const updatedBooth = db.booths.update(boothId, {
        status: 'verified',
        lastVerificationAt: new Date().toISOString()
      })

      const io = req.app.get('io')
      if (io) {
        io.emit('boothUpdate', updatedBooth)
        
        import('./stats.js').then(({ calculateStats }) => {
          const stats = calculateStats()
          io.emit('verificationStats', stats)
        }).catch(err => console.error('Error broadcasting stats update', err))
      }
    }

    res.status(201).json(newProof)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create proof', message: err.message })
  }
})

export default router
