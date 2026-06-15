import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.join(__dirname, 'db.json')

// Helper to calculate relative times
const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString()

// Seed booths: a realistic set of 40 booths across India
const initialBooths = [
  // Delhi
  { id: 'b1', name: 'Booth 42 — North Delhi', state: 'Delhi', district: 'North Delhi', address: 'MCD Primary School, Block A', lat: 28.7041, lng: 77.1025, status: 'verified', lastVerificationAt: hoursAgo(1), officerName: 'R. Sharma' },
  { id: 'b7', name: 'Booth 15 — New Delhi', state: 'Delhi', district: 'New Delhi', address: 'NDMC Community Center, Connaught Place', lat: 28.6304, lng: 77.2177, status: 'verified', lastVerificationAt: hoursAgo(2), officerName: 'S. Goel' },
  { id: 'b8', name: 'Booth 88 — South Delhi', state: 'Delhi', district: 'South Delhi', address: 'Govt Boys Sr. Sec. School, Saket', lat: 28.5276, lng: 77.2197, status: 'pending', lastVerificationAt: null, officerName: 'M. Gupta' },
  
  // Maharashtra
  { id: 'b2', name: 'Booth 18 — Mumbai Suburban', state: 'Maharashtra', district: 'Mumbai Suburban', address: 'Zilla Parishad School, Andheri', lat: 19.1136, lng: 72.8697, status: 'pending', lastVerificationAt: null, officerName: 'A. Patil' },
  { id: 'b9', name: 'Booth 05 — Mumbai South', state: 'Maharashtra', district: 'Mumbai South', address: 'Elphinstone Technical High School', lat: 18.9438, lng: 72.8317, status: 'verified', lastVerificationAt: hoursAgo(3), officerName: 'V. Deshmukh' },
  { id: 'b10', name: 'Booth 22 — Pune', state: 'Maharashtra', district: 'Pune', address: 'PMC School, Shivajinagar', lat: 18.5308, lng: 73.8475, status: 'verified', lastVerificationAt: hoursAgo(4), officerName: 'S. Joshi' },
  { id: 'b11', name: 'Booth 14 — Nagpur', state: 'Maharashtra', district: 'Nagpur', address: 'Zilla Parishad Hall, Sadar', lat: 21.1458, lng: 79.0882, status: 'offline', lastVerificationAt: hoursAgo(12), officerName: 'K. Kulkarni' },

  // Karnataka
  { id: 'b3', name: 'Booth 07 — Bengaluru Urban', state: 'Karnataka', district: 'Bengaluru Urban', address: 'Govt. PU College, Indiranagar', lat: 12.9716, lng: 77.5946, status: 'issue', lastVerificationAt: hoursAgo(2), officerName: 'K. Rao' },
  { id: 'b12', name: 'Booth 33 — Bengaluru South', state: 'Karnataka', district: 'Bengaluru South', address: 'RV Teachers College, Jayanagar', lat: 12.9307, lng: 77.5838, status: 'verified', lastVerificationAt: hoursAgo(0.5), officerName: 'P. Hegde' },
  { id: 'b13', name: 'Booth 50 — Mysore', state: 'Karnataka', district: 'Mysore', address: 'Maharaja Govt School, Mysore', lat: 12.3087, lng: 76.6529, status: 'pending', lastVerificationAt: null, officerName: 'H. Gowda' },

  // Telangana
  { id: 'b4', name: 'Booth 31 — Hyderabad', state: 'Telangana', district: 'Hyderabad', address: 'Municipal High School, Secunderabad', lat: 17.3850, lng: 78.4867, status: 'verified', lastVerificationAt: hoursAgo(0.2), officerName: 'V. Reddy' },
  { id: 'b14', name: 'Booth 09 — Cyberabad', state: 'Telangana', district: 'Rangareddy', address: 'Govt High School, Gachibowli', lat: 17.4483, lng: 78.3741, status: 'verified', lastVerificationAt: hoursAgo(1.5), officerName: 'S. Naidu' },

  // West Bengal
  { id: 'b5', name: 'Booth 55 — Kolkata', state: 'West Bengal', district: 'Kolkata', address: 'Ward Office Polling Station', lat: 22.5726, lng: 88.3639, status: 'offline', lastVerificationAt: hoursAgo(24), officerName: 'S. Banerjee' },
  { id: 'b15', name: 'Booth 12 — Howrah', state: 'West Bengal', district: 'Howrah', address: 'Howrah Girls High School', lat: 22.5958, lng: 88.2636, status: 'pending', lastVerificationAt: null, officerName: 'B. Sen' },
  { id: 'b16', name: 'Booth 40 — Darjeeling', state: 'West Bengal', district: 'Darjeeling', address: 'Municipal Hall, Hill Cart Road', lat: 27.0410, lng: 88.2627, status: 'verified', lastVerificationAt: hoursAgo(5), officerName: 'T. Sherpa' },

  // Tamil Nadu
  { id: 'b6', name: 'Booth 12 — Chennai', state: 'Tamil Nadu', district: 'Chennai', address: 'Corporation Middle School', lat: 13.0827, lng: 80.2707, status: 'verified', lastVerificationAt: hoursAgo(1.1), officerName: 'L. Kumar' },
  { id: 'b17', name: 'Booth 24 — Coimbatore', state: 'Tamil Nadu', district: 'Coimbatore', address: 'Govt Hr Sec School, R.S. Puram', lat: 11.0168, lng: 76.9558, status: 'verified', lastVerificationAt: hoursAgo(2.5), officerName: 'M. Selvam' },
  { id: 'b18', name: 'Booth 45 — Madurai', state: 'Tamil Nadu', district: 'Madurai', address: 'Municipal Primary School', lat: 9.9252, lng: 78.1198, status: 'pending', lastVerificationAt: null, officerName: 'K. Raja' },

  // Uttar Pradesh
  { id: 'b19', name: 'Booth 01 — Lucknow', state: 'Uttar Pradesh', district: 'Lucknow', address: 'Lohia Public School, Hazratganj', lat: 26.8467, lng: 80.9462, status: 'verified', lastVerificationAt: hoursAgo(0.8), officerName: 'A. Mishra' },
  { id: 'b20', name: 'Booth 104 — Varanasi', state: 'Uttar Pradesh', district: 'Varanasi', address: 'Sanskrit Vidyalaya, Cantonment', lat: 25.3176, lng: 82.9739, status: 'issue', lastVerificationAt: hoursAgo(3), officerName: 'H. Pandey' },
  { id: 'b21', name: 'Booth 48 — Kanpur', state: 'Uttar Pradesh', district: 'Kanpur', address: 'Panchayat Bhavan, Kalyanpur', lat: 26.4499, lng: 80.3319, status: 'pending', lastVerificationAt: null, officerName: 'R. Yadav' },
  { id: 'b22', name: 'Booth 62 — Agra', state: 'Uttar Pradesh', district: 'Agra', address: 'Govt School Near Taj Complex', lat: 27.1767, lng: 78.0081, status: 'verified', lastVerificationAt: hoursAgo(6), officerName: 'S. Singh' },

  // Bihar
  { id: 'b23', name: 'Booth 10 — Patna', state: 'Bihar', district: 'Patna', address: 'Rajendra Nagar High School', lat: 25.5941, lng: 85.1376, status: 'verified', lastVerificationAt: hoursAgo(1.2), officerName: 'P. Sinha' },
  { id: 'b24', name: 'Booth 36 — Gaya', state: 'Bihar', district: 'Gaya', address: 'Zilla School, Gaya', lat: 24.7955, lng: 84.9994, status: 'pending', lastVerificationAt: null, officerName: 'R. Kumar' },

  // Madhya Pradesh
  { id: 'b25', name: 'Booth 29 — Bhopal', state: 'Madhya Pradesh', district: 'Bhopal', address: 'Model School, T.T. Nagar', lat: 23.2599, lng: 77.4126, status: 'verified', lastVerificationAt: hoursAgo(2.1), officerName: 'V. Chouhan' },
  { id: 'b26', name: 'Booth 75 — Indore', state: 'Madhya Pradesh', district: 'Indore', address: 'SGSITS Campus Hall', lat: 22.7196, lng: 75.8577, status: 'pending', lastVerificationAt: null, officerName: 'N. Sharma' },

  // Rajasthan
  { id: 'b27', name: 'Booth 03 — Jaipur', state: 'Rajasthan', district: 'Jaipur', address: 'Govt Girls College, C-Scheme', lat: 26.9124, lng: 75.7873, status: 'verified', lastVerificationAt: hoursAgo(1.8), officerName: 'D. Rathore' },
  { id: 'b28', name: 'Booth 51 — Jodhpur', state: 'Rajasthan', district: 'Jodhpur', address: 'Panchayat School, Mandore', lat: 26.2389, lng: 73.0243, status: 'offline', lastVerificationAt: hoursAgo(36), officerName: 'S. Gehlot' },

  // Gujarat
  { id: 'b29', name: 'Booth 11 — Ahmedabad', state: 'Gujarat', district: 'Ahmedabad', address: 'Municipal School, Satellite', lat: 23.0225, lng: 72.5714, status: 'verified', lastVerificationAt: hoursAgo(0.9), officerName: 'J. Patel' },
  { id: 'b30', name: 'Booth 19 — Surat', state: 'Gujarat', district: 'Surat', address: 'Navyug School Hall, Adajan', lat: 21.1702, lng: 72.8311, status: 'pending', lastVerificationAt: null, officerName: 'M. Mehta' },

  // Andhra Pradesh
  { id: 'b31', name: 'Booth 08 — Vijayawada', state: 'Andhra Pradesh', district: 'Krishna', address: 'Z.P. High School, Patamata', lat: 16.5062, lng: 80.6480, status: 'verified', lastVerificationAt: hoursAgo(2.2), officerName: 'T. Naidu' },
  { id: 'b32', name: 'Booth 25 — Visakhapatnam', state: 'Andhra Pradesh', district: 'Visakhapatnam', address: 'AU Science Block Polling Stn', lat: 17.6868, lng: 83.2185, status: 'pending', lastVerificationAt: null, officerName: 'C. Rao' },

  // Kerala
  { id: 'b33', name: 'Booth 14 — Trivandrum', state: 'Kerala', district: 'Trivandrum', address: 'Cotton Hill Girls School', lat: 8.5241, lng: 76.9366, status: 'verified', lastVerificationAt: hoursAgo(1.6), officerName: 'S. Nair' },
  { id: 'b34', name: 'Booth 06 — Kochi', state: 'Kerala', district: 'Ernakulam', address: 'Govt School, Ernakulam North', lat: 9.9816, lng: 76.2999, status: 'verified', lastVerificationAt: hoursAgo(0.4), officerName: 'J. Joseph' },

  // Punjab
  { id: 'b35', name: 'Booth 02 — Amritsar', state: 'Punjab', district: 'Amritsar', address: 'Khalsa College School Hall', lat: 31.6340, lng: 74.8723, status: 'verified', lastVerificationAt: hoursAgo(3.1), officerName: 'H. Singh' },

  // Haryana
  { id: 'b36', name: 'Booth 17 — Gurugram', state: 'Haryana', district: 'Gurugram', address: 'HUDA Gymkhana Club, Sector 29', lat: 28.4595, lng: 77.0266, status: 'pending', lastVerificationAt: null, officerName: 'S. Yadav' },

  // Odisha
  { id: 'b37', name: 'Booth 05 — Bhubaneswar', state: 'Odisha', district: 'Khurda', address: 'Capital High School, Unit 3', lat: 20.2961, lng: 85.8245, status: 'verified', lastVerificationAt: hoursAgo(4.2), officerName: 'M. Mohanty' },

  // Assam
  { id: 'b38', name: 'Booth 12 — Guwahati', state: 'Assam', district: 'Kamrup', address: 'Cotton College Hall, Panbazar', lat: 26.1445, lng: 91.7362, status: 'verified', lastVerificationAt: hoursAgo(2.7), officerName: 'D. Baruah' },

  // Jammu & Kashmir
  { id: 'b39', name: 'Booth 04 — Srinagar', state: 'Jammu & Kashmir', district: 'Srinagar', address: 'Govt Higher Secondary, Lal Chowk', lat: 34.0837, lng: 74.7973, status: 'pending', lastVerificationAt: null, officerName: 'F. Ahmad' },

  // Goa
  { id: 'b40', name: 'Booth 01 — Panaji', state: 'Goa', district: 'North Goa', address: 'Municipal School Hall, Miramar', lat: 15.4909, lng: 73.8278, status: 'verified', lastVerificationAt: hoursAgo(5.5), officerName: 'A. Fernandes' }
]

const initialAlerts = [
  {
    id: 'a1',
    severity: 'high',
    type: 'verification_mismatch',
    message: 'Seal photograph hash mismatch at Booth 07 — Bengaluru Urban',
    boothId: 'b3',
    boothName: 'Booth 07 — Bengaluru Urban',
    createdAt: hoursAgo(0.1),
  },
  {
    id: 'a2',
    severity: 'high',
    type: 'verification_mismatch',
    message: 'EVM status code mismatch at Booth 104 — Varanasi',
    boothId: 'b20',
    boothName: 'Booth 104 — Varanasi',
    createdAt: hoursAgo(1.5),
  },
  {
    id: 'a3',
    severity: 'medium',
    type: 'late_sync',
    message: 'Booth 18 has not synced in 15 minutes',
    boothId: 'b2',
    boothName: 'Booth 18 — Mumbai Suburban',
    createdAt: hoursAgo(0.5),
  },
]

const initialProofs = [
  {
    id: 'p1',
    boothId: 'b1',
    imageUrl: 'https://picsum.photos/seed/vv1/400/300',
    capturedAt: hoursAgo(1),
    label: 'Seal — front',
  },
  {
    id: 'p2',
    boothId: 'b4',
    imageUrl: 'https://picsum.photos/seed/vv2/400/300',
    capturedAt: hoursAgo(0.2),
    label: 'EVM bay',
  },
  {
    id: 'p3',
    boothId: 'b6',
    imageUrl: 'https://picsum.photos/seed/vv3/400/300',
    capturedAt: hoursAgo(1.1),
    label: 'Queue overview',
  },
  {
    id: 'p4',
    boothId: 'b7',
    imageUrl: 'https://picsum.photos/seed/vv4/400/300',
    capturedAt: hoursAgo(2),
    label: 'Control Unit Seal',
  },
]

// Database structure
const defaultDb = {
  booths: initialBooths,
  alerts: initialAlerts,
  proofs: initialProofs,
  users: [],
  voters: [],
  votes: [],
}

// Read database from file
export function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(defaultDb)
      return defaultDb
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading JSON DB, falling back to default', err)
    return defaultDb
  }
}

// Write database to file
export function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (err) {
    console.error('Error writing JSON DB', err)
    return false
  }
}

// DB Instance methods
export const db = {
  booths: {
    find: () => {
      const data = readDb()
      return data.booths
    },
    findById: (id) => {
      const data = readDb()
      return data.booths.find((b) => b.id === id)
    },
    update: (id, updates) => {
      const data = readDb()
      const idx = data.booths.findIndex((b) => b.id === id)
      if (idx === -1) return null
      data.booths[idx] = { ...data.booths[idx], ...updates }
      writeDb(data)
      return data.booths[idx]
    },
  },
  alerts: {
    find: () => {
      const data = readDb()
      return data.alerts
    },
    create: (alert) => {
      const data = readDb()
      const newAlert = {
        id: 'a' + (data.alerts.length + 1) + Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString(),
        ...alert,
      }
      data.alerts.unshift(newAlert) // Latest first
      writeDb(data)
      return newAlert
    },
  },
  proofs: {
    find: () => {
      const data = readDb()
      return data.proofs
    },
    create: (proof) => {
      const data = readDb()
      const newProof = {
        id: 'p' + (data.proofs.length + 1) + Math.floor(Math.random() * 1000),
        capturedAt: new Date().toISOString(),
        ...proof,
      }
      data.proofs.unshift(newProof) // Latest first
      writeDb(data)
      return newProof
    },
  },
  users: {
    find: () => {
      const data = readDb()
      return data.users || []
    },
    findByEmail: (email) => {
      const data = readDb()
      const users = data.users || []
      return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    },
    create: (user) => {
      const data = readDb()
      if (!data.users) data.users = []
      const newUser = {
        id: 'u' + (data.users.length + 1) + Math.floor(Math.random() * 1000),
        createdAt: new Date().toISOString(),
        ...user,
      }
      data.users.push(newUser)
      writeDb(data)
      return newUser
    },
  },
  voters: {
    find: () => {
      const data = readDb()
      return data.voters || []
    },
    findByAadhaar: (aadhaar) => {
      const data = readDb()
      const voters = data.voters || []
      const hashedAadhaar = crypto.createHash('sha256').update(aadhaar).digest('hex')
      return voters.find((v) => v.hashedAadhaar === hashedAadhaar)
    },
    createOrUpdate: (voter) => {
      const data = readDb()
      if (!data.voters) data.voters = []

      const hashedAadhaar = crypto.createHash('sha256').update(voter.aadhaar).digest('hex')
      const existingIndex = data.voters.findIndex((v) => v.hashedAadhaar === hashedAadhaar)
      const voterRecord = {
        id: existingIndex >= 0 ? data.voters[existingIndex].id : 'vr' + (data.voters.length + 1) + Math.floor(Math.random() * 1000),
        createdAt: existingIndex >= 0 ? data.voters[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: voter.name,
        mobile: voter.mobile,
        hashedAadhaar,
        aadhaarLast4: voter.aadhaar.slice(-4),
        faceDescriptor: voter.faceDescriptor,
        status: 'verified',
      }

      if (existingIndex >= 0) {
        data.voters[existingIndex] = voterRecord
      } else {
        data.voters.push(voterRecord)
      }

      writeDb(data)
      return voterRecord
    },
  },
  votes: {
    find: () => {
      const data = readDb()
      return data.votes || []
    },
    hasVoted: (aadhaar) => {
      const data = readDb()
      const votes = data.votes || []
      const hashedAadhaar = crypto.createHash('sha256').update(aadhaar).digest('hex')
      return votes.some((v) => v.hashedAadhaar === hashedAadhaar)
    },
    create: (vote) => {
      const data = readDb()
      if (!data.votes) data.votes = []
      
      const hashedAadhaar = crypto.createHash('sha256').update(vote.aadhaar).digest('hex')
      const newVote = {
        id: 'v' + (data.votes.length + 1) + Math.floor(Math.random() * 1000),
        hashedAadhaar,
        aadhaarLast4: vote.aadhaar.slice(-4),
        voterId: vote.voterId,
        voterName: vote.voterName,
        voterMobileLast4: vote.voterMobileLast4,
        candidateId: vote.candidateId,
        timestamp: new Date().toISOString(),
      }
      
      data.votes.push(newVote)
      writeDb(data)
      return newVote
    },
  },
}

export default db
