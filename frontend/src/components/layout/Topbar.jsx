import { useEffect, useState } from 'react'
import socket from '../../socket/socket'
import ThemeToggle from '../landing/ThemeToggle'

export default function Topbar({ title, subtitle, mockMode }) {
  const [connected, setConnected] = useState(() => Boolean(socket?.connected))

  useEffect(() => {
    if (!socket) return undefined
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-vv-border bg-vv-surface/80 px-4 backdrop-blur-md md:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-vv-heading">{title}</h1>
        {subtitle ? <p className="truncate text-sm text-vv-muted">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        {mockMode ? (
          <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
            Demo data
          </span>
        ) : null}
        <div
          className="flex items-center gap-2 rounded-full border border-vv-border bg-vv-surface-muted px-2.5 py-1.5 sm:px-3"
          title={socket ? (connected ? 'Socket connected' : 'Reconnecting…') : 'Socket URL not configured'}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${connected ? 'bg-vv-accent shadow-[0_0_8px_var(--vv-accent)]' : 'animate-pulse bg-amber-500'}`}
            aria-hidden
          />
          <span className="hidden text-xs font-medium text-vv-text sm:inline">
            {!socket ? 'Live: off' : connected ? 'Live' : 'Reconnecting'}
          </span>
        </div>
      </div>
    </header>
  )
}
