import express from 'express'
import db from '../db/index.js'

const router = express.Router()

// Get all booths
router.get('/', (req, res) => {
  try {
    const booths = db.booths.find()
    res.json(booths)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booths', message: err.message })
  }
})

// Get booth by ID
router.get('/:id', (req, res) => {
  try {
    const booth = db.booths.findById(req.params.id)
    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' })
    }
    res.json(booth)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch booth', message: err.message })
  }
})

// Update booth status (useful for simulation or API updates)
router.put('/:id', (req, res) => {
  try {
    const { status, officerName, lastVerificationAt, address } = req.body
    
    const updates = {}
    if (status !== undefined) updates.status = status
    if (officerName !== undefined) updates.officerName = officerName
    if (lastVerificationAt !== undefined) updates.lastVerificationAt = lastVerificationAt
    if (address !== undefined) updates.address = address

    const updatedBooth = db.booths.update(req.params.id, updates)
    if (!updatedBooth) {
      return res.status(404).json({ error: 'Booth not found' })
    }

    // Emit socket update in the main server after route handles
    const io = req.app.get('io')
    if (io) {
      io.emit('boothUpdate', updatedBooth)
      
      // Also broadcast updated verification statistics
      import('./stats.js').then(({ calculateStats }) => {
        const stats = calculateStats()
        io.emit('verificationStats', stats)
      }).catch(err => console.error('Error broadcasting stats update', err))
    }

    res.json(updatedBooth)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update booth', message: err.message })
  }
})

export default router
