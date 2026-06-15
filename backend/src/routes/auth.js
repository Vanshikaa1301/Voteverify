import express from 'express'
import crypto from 'crypto'
import db from '../db/index.js'

const router = express.Router()

// Helper to hash password with salt
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
}

// Sign Up Route
router.post('/signup', (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existingUser = db.users.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash password
    const salt = crypto.randomBytes(16).toString('hex')
    const passwordHash = hashPassword(password, salt)

    const newUser = db.users.create({
      name,
      email,
      salt,
      passwordHash,
    })

    // Create a mock token (e.g. SHA256 string for simplicity, avoiding external jsonwebtoken compilation)
    const token = crypto.createHash('sha256').update(`${newUser.id}-${Date.now()}`).digest('hex')

    res.status(201).json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
      token,
    })
  } catch (err) {
    res.status(500).json({ error: 'Sign up failed', message: err.message })
  }
})

// Sign In Route
router.post('/signin', (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = db.users.findByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Verify password hash
    const targetHash = hashPassword(password, user.salt)
    if (targetHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Create a mock token
    const token = crypto.createHash('sha256').update(`${user.id}-${Date.now()}`).digest('hex')

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    })
  } catch (err) {
    res.status(500).json({ error: 'Sign in failed', message: err.message })
  }
})

export default router
