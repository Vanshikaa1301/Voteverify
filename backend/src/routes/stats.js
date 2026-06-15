import express from 'express'
import db from '../db/index.js'

const router = express.Router()

const STATE_ABBR = {
  'Uttar Pradesh': 'UP',
  'Maharashtra': 'MH',
  'Bihar': 'BR',
  'West Bengal': 'WB',
  'Madhya Pradesh': 'MP',
  'Tamil Nadu': 'TN',
  'Rajasthan': 'RJ',
  'Karnataka': 'KA',
  'Delhi': 'DL',
  'Telangana': 'TS',
  'Andhra Pradesh': 'AP',
  'Kerala': 'KL',
  'Punjab': 'PB',
  'Haryana': 'HR',
  'Odisha': 'OR',
  'Assam': 'AS',
  'Jammu & Kashmir': 'JK',
  'Goa': 'GA',
  'Gujarat': 'GJ'
}

export function calculateStats() {
  const booths = db.booths.find()
  const alerts = db.alerts.find()

  const totalBooths = booths.length
  const verifiedBooths = booths.filter((b) => b.status === 'verified').length
  const pendingBooths = booths.filter((b) => b.status === 'pending').length
  const alertsOpen = alerts.length
  const verificationRate = totalBooths > 0 ? parseFloat(((verifiedBooths / totalBooths) * 100).toFixed(1)) : 0

  // byStatus breakdown
  const byStatus = [
    { name: 'Verified', value: verifiedBooths },
    { name: 'Pending', value: pendingBooths },
    { name: 'Issue', value: booths.filter((b) => b.status === 'issue').length },
    { name: 'Offline', value: booths.filter((b) => b.status === 'offline').length },
  ]

  // byState breakdown
  const stateCounts = {}
  booths.forEach((b) => {
    const abbr = STATE_ABBR[b.state] || b.state.slice(0, 2).toUpperCase()
    stateCounts[abbr] = (stateCounts[abbr] || 0) + 1
  })
  const byState = Object.entries(stateCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Limit to top 8 states like mockData

  // 7-point Verification Trend (last 6 hours)
  const trend = []
  const now = Date.now()
  for (let i = 6; i >= 0; i--) {
    const timePoint = now - i * 3600000 // h hours ago
    const timeIso = new Date(timePoint).toISOString()
    
    // Count booths verified at or before this timePoint
    const verifiedAtPoint = booths.filter((b) => {
      if (b.status !== 'verified') return false
      if (!b.lastVerificationAt) return true // assume verified initially if timestamp missing
      return new Date(b.lastVerificationAt).getTime() <= timePoint
    }).length

    trend.push({
      time: timeIso,
      verified: verifiedAtPoint
    })
  }

  return {
    totalBooths,
    verifiedBooths,
    pendingBooths,
    alertsOpen,
    verificationRate,
    verificationTrend: trend,
    byStatus,
    byState
  }
}

router.get('/', (req, res) => {
  try {
    const stats = calculateStats()
    res.json(stats)
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate stats', message: err.message })
  }
})

export default router
