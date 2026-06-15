import { io } from 'socket.io-client'

/**
 * Socket.IO singleton for live booth updates, alerts, and aggregate stats.
 * URL must be set via VITE_SOCKET_URL (same origin as API server in dev).
 */
const url = import.meta.env.VITE_SOCKET_URL

if (!url && import.meta.env.DEV) {
  console.warn('[VoteVerify] VITE_SOCKET_URL is not set; live updates disabled.')
}

/** @type {import('socket.io-client').Socket | null} */
export const socket = url
  ? io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      transports: ['websocket', 'polling'],
    })
  : null

export default socket
