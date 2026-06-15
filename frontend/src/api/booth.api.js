import apiClient from './axios'
import {
  mockAlerts,
  mockBooths,
  mockProofs,
  mockStats,
} from '../data/mockData'

/**
 * Wraps API calls and falls back to mock data on network or 5xx errors
 * so the national dashboard remains usable during outages or local dev.
 */
async function withFallback(request, mockData) {
  try {
    const { data } = await request()
    return { data, fromMock: false, error: null }
  } catch (err) {
    console.warn('[VoteVerify] API request failed, using mock data.', err?.message || err)
    return { data: mockData, fromMock: true, error: err }
  }
}

export function fetchBooths() {
  return withFallback(() => apiClient.get('/booths'), mockBooths)
}

export function fetchBoothById(id) {
  return withFallback(
    () => apiClient.get(`/booths/${id}`),
    mockBooths.find((b) => b.id === id) || mockBooths[0],
  )
}

export function fetchAlerts() {
  return withFallback(() => apiClient.get('/alerts'), mockAlerts)
}

export function fetchProofs() {
  return withFallback(() => apiClient.get('/proofs'), mockProofs)
}

export function fetchStats() {
  return withFallback(() => apiClient.get('/stats'), mockStats)
}
