import axios from 'axios'

/**
 * Central HTTP client. Base URL comes from Vite env (build-time).
 * Deployments set VITE_API_BASE_URL to the public API origin + /api.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL

if (!baseURL && import.meta.env.DEV) {
  console.warn('[VoteVerify] VITE_API_BASE_URL is not set; API calls may fail.')
}

export const apiClient = axios.create({
  baseURL: baseURL || '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

export default apiClient
