import { useCallback, useEffect, useState } from 'react'
import { fetchAlerts } from '../api/booth.api'
import Topbar from '../components/layout/Topbar'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import AlertCard from '../components/alerts/AlertCard'
import socket from '../socket/socket'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [fromMock, setFromMock] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadAlerts = useCallback(async () => {
    const res = await fetchAlerts()
    const raw = res.data
    const list = Array.isArray(raw) ? raw : raw?.alerts || raw?.items || []
    setAlerts(list)
    setFromMock(res.fromMock)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  useEffect(() => {
    if (!socket) return undefined
    const onNewAlert = (payload) => {
      if (!payload?.id) return
      setAlerts((prev) => {
        if (prev.some((a) => a.id === payload.id)) return prev
        return [payload, ...prev]
      })
    }
    socket.on('newAlert', onNewAlert)
    return () => socket.off('newAlert', onNewAlert)
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title="Alerts"
        subtitle="National incident feed · REST + Socket.IO"
        mockMode={fromMock}
      />
      <main className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        {loading ? <Loader label="Loading alerts…" /> : null}
        {!loading && alerts.length === 0 ? (
          <EmptyState
            title="No active alerts"
            description="When the monitoring stack raises incidents, they will appear here in real time."
          />
        ) : null}
        {!loading && alerts.length > 0 ? (
          <ul className="flex flex-col gap-3" aria-live="polite">
            {alerts.map((a) => (
              <li key={a.id}>
                <AlertCard alert={a} />
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  )
}
