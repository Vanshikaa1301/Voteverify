import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
dotenv.config()

// Import routes & modules
import boothsRouter from './routes/booths.js'
import alertsRouter from './routes/alerts.js'
import proofsRouter from './routes/proofs.js'
import statsRouter from './routes/stats.js'
import authRouter from './routes/auth.js'
import votesRouter from './routes/votes.js'
import { readDb } from './db/index.js'
import { startSimulator } from './simulation/simulator.js'

const app = express()
const server = http.createServer(app)

const PORT = process.env.PORT || 5000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

// Enable CORS
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
)

app.use(express.json())

// Ensure database is initialized
console.log('[VoteVerify Backend] Checking/Initializing Database...')
readDb()

// Bind Socket.IO with CORS mapping
const io = new Server(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
})

// Share socket instance to express routes
app.set('io', io)

// API routes
app.use('/api/booths', boothsRouter)
app.use('/api/alerts', alertsRouter)
app.use('/api/proofs', proofsRouter)
app.use('/api/stats', statsRouter)
app.use('/api/auth', authRouter)
app.use('/api/votes', votesRouter)

// Base root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'VoteVerify Production Backend API',
    uptime: process.uptime(),
    documentation: 'See API endpoints under /api/booths, /api/alerts, /api/proofs, /api/stats',
  })
})

// Handle Socket.IO connections
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`)
  })
})

// Start telemetry simulation
startSimulator(io)

// Start Server
server.listen(PORT, () => {
  console.log(`[VoteVerify Backend] Server listening on port ${PORT}`)
  console.log(`[VoteVerify Backend] API endpoints: http://localhost:${PORT}/api`)
})
