/**
 * Offline / fallback dataset when the API is unreachable.
 * Shapes mirror the expected Express API responses.
 */

export const mockBooths = [
  {
    id: 'b1',
    name: 'Booth 42 — North Delhi',
    state: 'Delhi',
    district: 'North Delhi',
    address: 'MCD Primary School, Block A',
    lat: 28.7041,
    lng: 77.1025,
    status: 'verified',
    lastVerificationAt: new Date().toISOString(),
    officerName: 'R. Sharma',
  },
  {
    id: 'b2',
    name: 'Booth 18 — Mumbai Suburban',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    address: 'Zilla Parishad School, Andheri',
    lat: 19.1136,
    lng: 72.8697,
    status: 'pending',
    lastVerificationAt: null,
    officerName: 'A. Patil',
  },
  {
    id: 'b3',
    name: 'Booth 07 — Bengaluru Urban',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    address: 'Govt. PU College, Indiranagar',
    lat: 12.9716,
    lng: 77.5946,
    status: 'issue',
    lastVerificationAt: new Date(Date.now() - 3600000).toISOString(),
    officerName: 'K. Rao',
  },
  {
    id: 'b4',
    name: 'Booth 31 — Hyderabad',
    state: 'Telangana',
    district: 'Hyderabad',
    address: 'Municipal High School, Secunderabad',
    lat: 17.385,
    lng: 78.4867,
    status: 'verified',
    lastVerificationAt: new Date().toISOString(),
    officerName: 'V. Reddy',
  },
  {
    id: 'b5',
    name: 'Booth 55 — Kolkata',
    state: 'West Bengal',
    district: 'Kolkata',
    address: 'Ward Office Polling Station',
    lat: 22.5726,
    lng: 88.3639,
    status: 'offline',
    lastVerificationAt: new Date(Date.now() - 86400000).toISOString(),
    officerName: 'S. Banerjee',
  },
  {
    id: 'b6',
    name: 'Booth 12 — Chennai',
    state: 'Tamil Nadu',
    district: 'Chennai',
    address: 'Corporation Middle School',
    lat: 13.0827,
    lng: 80.2707,
    status: 'verified',
    lastVerificationAt: new Date().toISOString(),
    officerName: 'L. Kumar',
  },
]

export const mockAlerts = [
  {
    id: 'a1',
    severity: 'high',
    type: 'verification_mismatch',
    message: 'Seal photograph hash mismatch at Booth 07 — Bengaluru Urban',
    boothId: 'b3',
    boothName: 'Booth 07 — Bengaluru Urban',
    createdAt: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'a2',
    severity: 'medium',
    type: 'late_sync',
    message: 'Booth 18 has not synced in 15 minutes',
    boothId: 'b2',
    boothName: 'Booth 18 — Mumbai Suburban',
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
]

export const mockProofs = [
  {
    id: 'p1',
    boothId: 'b1',
    imageUrl: 'https://picsum.photos/seed/vv1/400/300',
    capturedAt: new Date().toISOString(),
    label: 'Seal — front',
  },
  {
    id: 'p2',
    boothId: 'b4',
    imageUrl: 'https://picsum.photos/seed/vv2/400/300',
    capturedAt: new Date().toISOString(),
    label: 'EVM bay',
  },
  {
    id: 'p3',
    boothId: 'b6',
    imageUrl: 'https://picsum.photos/seed/vv3/400/300',
    capturedAt: new Date().toISOString(),
    label: 'Queue overview',
  },
]

const hoursAgo = (h) => new Date(Date.now() - h * 3600000).toISOString()

export const mockStats = {
  totalBooths: 912_384,
  verifiedBooths: 687_102,
  pendingBooths: 198_400,
  alertsOpen: 42,
  verificationRate: 75.3,
  verificationTrend: [
    { time: hoursAgo(6), verified: 620000 },
    { time: hoursAgo(5), verified: 635000 },
    { time: hoursAgo(4), verified: 648000 },
    { time: hoursAgo(3), verified: 660000 },
    { time: hoursAgo(2), verified: 672000 },
    { time: hoursAgo(1), verified: 681000 },
    { time: new Date().toISOString(), verified: 687102 },
  ],
  byStatus: [
    { name: 'Verified', value: 687102 },
    { name: 'Pending', value: 198400 },
    { name: 'Issue', value: 12400 },
    { name: 'Offline', value: 14482 },
  ],
  byState: [
    { name: 'UP', value: 98000 },
    { name: 'MH', value: 76000 },
    { name: 'BR', value: 62000 },
    { name: 'WB', value: 54000 },
    { name: 'MP', value: 51000 },
    { name: 'TN', value: 48000 },
    { name: 'RJ', value: 42000 },
    { name: 'KA', value: 39000 },
  ],
}
