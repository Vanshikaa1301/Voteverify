import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { fetchBooths } from '../api/booth.api'
import Topbar from '../components/layout/Topbar'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import BoothModal from '../components/booths/BoothModal'
import socket from '../socket/socket'

/** Approximate geographic center of India for initial map view */
const INDIA_CENTER = [22.5, 79.0]
const DEFAULT_ZOOM = 5

const STATUS_COLOR = {
  verified: '#2DD4BF',
  pending: '#fbbf24',
  issue: '#f87171',
  offline: '#64748b',
}

function mergeBoothUpdate(list, update) {
  if (!update?.id) return list
  const idx = list.findIndex((b) => b.id === update.id)
  if (idx === -1) return [update, ...list]
  const next = [...list]
  next[idx] = { ...next[idx], ...update }
  return next
}

export default function BoothMap() {
  const [booths, setBooths] = useState([])
  const [fromMock, setFromMock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadBooths = useCallback(async () => {
    const res = await fetchBooths()
    const raw = res.data
    const list = Array.isArray(raw) ? raw : raw?.booths || raw?.items || []
    setBooths(list)
    setFromMock(res.fromMock)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadBooths()
  }, [loadBooths])

  useEffect(() => {
    if (!socket) return undefined
    const onBoothUpdate = (payload) => {
      setBooths((prev) => mergeBoothUpdate(prev, payload))
    }
    socket.on('boothUpdate', onBoothUpdate)
    return () => socket.off('boothUpdate', onBoothUpdate)
  }, [])

  const mappable = useMemo(
    () => booths.filter((b) => typeof b.lat === 'number' && typeof b.lng === 'number'),
    [booths],
  )

  const openBooth = (booth) => {
    setSelected(booth)
    setModalOpen(true)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title="Booth map"
        subtitle="Live booth status · pan and zoom across India"
        mockMode={fromMock}
      />
      <main className="relative flex min-h-0 flex-1 flex-col p-4 md:p-6">
        {loading ? <Loader label="Loading booth coordinates…" /> : null}
        {!loading && mappable.length === 0 ? (
          <EmptyState
            title="No mappable booths"
            description="Booth records need latitude and longitude to appear on the map."
          />
        ) : null}
        {!loading && mappable.length > 0 ? (
          <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-vv-border shadow-card">
            <MapContainer
              center={INDIA_CENTER}
              zoom={DEFAULT_ZOOM}
              className="h-full min-h-[420px] w-full"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {mappable.map((booth) => (
                <CircleMarker
                  key={booth.id}
                  center={[booth.lat, booth.lng]}
                  radius={9}
                  pathOptions={{
                    color: STATUS_COLOR[booth.status] || '#94a3b8',
                    fillColor: STATUS_COLOR[booth.status] || '#94a3b8',
                    fillOpacity: 0.85,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => openBooth(booth),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                    <span className="text-xs font-medium text-slate-800">{booth.name}</span>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
            <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-3 rounded-lg border border-vv-border bg-vv-surface/95 px-3 py-2 text-xs text-vv-text backdrop-blur-sm">
              {Object.entries(STATUS_COLOR).map(([k, c]) => (
                <span key={k} className="flex items-center gap-1.5 capitalize">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                  {k}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </main>
      <BoothModal booth={selected} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
