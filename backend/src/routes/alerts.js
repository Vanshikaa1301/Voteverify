import express from 'express'
import db from '../db/index.js'

const router = express.Router()

// Get all alerts
router.get('/', (req, res) => {
  try {
    const alerts = db.alerts.find()
    res.json(alerts)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts', message: err.message })
  }
})

// Create new alert
router.post('/', (req, res) => {
  try {
    const { severity, type, message, boothId, boothName } = req.body
    
    if (!severity || !type || !message) {
      return res.status(400).json({ error: 'Severity, type, and message are required' })
    }

    const newAlert = db.alerts.create({
      severity,
      type,
      message,
      boothId: boothId || null,
      boothName: boothName || null,
    })

    const io = req.app.get('io')
    if (io) {
      io.emit('newAlert', newAlert)
      
      // Emit stats update as alertsOpen changed
      import('./stats.js').then(({ calculateStats }) => {
        const stats = calculateStats()
        io.emit('verificationStats', stats)
      }).catch(err => console.error('Error broadcasting stats update', err))
    }

    res.status(201).json(newAlert)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create alert', message: err.message })
  }
})

export default router
