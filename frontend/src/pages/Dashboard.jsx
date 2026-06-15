import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  Cell,
} from 'recharts'
import apiClient from '../api/axios'
import { fetchStats } from '../api/booth.api'
import Topbar from '../components/layout/Topbar'
import StatCard from '../components/common/StatCard'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'
import socket from '../socket/socket'

const nf = new Intl.NumberFormat('en-IN')
const pct = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 })

function useDebouncedFn(fn, ms) {
  const t = useRef(null)
  return useCallback(
    (...args) => {
      if (t.current) clearTimeout(t.current)
      t.current = setTimeout(() => {
        t.current = null
        fn(...args)
      }, ms)
    },
    [fn, ms],
  )
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const CANDIDATE_COLORS = ['#4f46e5', '#10b981', '#f59e0b']

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [fromMock, setFromMock] = useState(false)
  const [loading, setLoading] = useState(true)

  // Live CR Election state
  const [election, setElection] = useState(null)
  const [recentVotes, setRecentVotes] = useState([])

  const loadStats = useCallback(async () => {
    const res = await fetchStats()
    setStats(res.data)
    setFromMock(res.fromMock)
    setLoading(false)
  }, [])

  const loadElection = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/votes')
      setElection(data)
      setRecentVotes(data.recentVotes || [])
    } catch (err) {
      console.warn('Election data unavailable', err)
    }
  }, [])

  const debouncedReload = useDebouncedFn(loadStats, 1200)

  useEffect(() => {
    loadStats()
    loadElection()
  }, [loadStats, loadElection])

  useEffect(() => {
    if (!socket) return undefined
    const onVerificationStats = (payload) => {
      if (payload && typeof payload === 'object') {
        setStats((prev) => ({ ...prev, ...payload }))
      }
    }
    const onBoothUpdate = () => debouncedReload()

    // Live election vote events
    const onNewVote = (vote) => {
      setRecentVotes((prev) => [vote, ...prev].slice(0, 8))
    }
    const onElectionStats = (data) => {
      setElection((prev) => ({ ...prev, ...data }))
      setRecentVotes(data.recentVotes || [])
    }

    socket.on('verificationStats', onVerificationStats)
    socket.on('boothUpdate', onBoothUpdate)
    socket.on('newVote', onNewVote)
    socket.on('electionStats', onElectionStats)
    return () => {
      socket.off('verificationStats', onVerificationStats)
      socket.off('boothUpdate', onBoothUpdate)
      socket.off('newVote', onNewVote)
      socket.off('electionStats', onElectionStats)
    }
  }, [debouncedReload])

  const chartData = useMemo(() => {
    const trend = stats?.verificationTrend || stats?.trend
    if (!Array.isArray(trend)) return []
    return trend.map((row) => ({
      ...row,
      label: row.time ? new Date(row.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
      value: row.verified ?? row.count ?? row.value ?? 0,
    }))
  }, [stats])

  const electionBarData = useMemo(() => {
    if (!election?.byCandidate) return []
    return election.byCandidate.map((c) => ({
      name: c.name.split(' ')[0],
      votes: c.votes,
      percentage: c.percentage,
    }))
  }, [election])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title="Dashboard"
        subtitle="National verification overview · live telemetry"
        mockMode={fromMock}
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        {loading ? <Loader label="Loading national statistics…" /> : null}
        {!loading && stats ? (
          <>
            <motion.div 
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={fadeUpVariant}>
                <StatCard
                  title="Total booths"
                  value={nf.format(stats.totalBooths ?? 0)}
                  subtitle="Registered polling stations"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
              </motion.div>
              <motion.div variants={fadeUpVariant}>
                <StatCard
                  title="Verified"
                  value={nf.format(stats.verifiedBooths ?? 0)}
                  subtitle="Completed verification"
                  trend={2.1}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                />
              </motion.div>
              <motion.div variants={fadeUpVariant}>
                <StatCard
                  title="Pending"
                  value={nf.format(stats.pendingBooths ?? 0)}
                  subtitle="Awaiting verification"
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </motion.div>
              <motion.div variants={fadeUpVariant}>
                <StatCard
                  title="Open alerts"
                  value={nf.format(stats.alertsOpen ?? 0)}
                  subtitle={`Rate: ${pct.format(stats.verificationRate ?? 0)}%`}
                  icon={
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                />
              </motion.div>
            </motion.div>

            {/* Live CR Election Results Panel */}
            {election && (
              <motion.div
                initial="hidden" animate="visible" variants={fadeUpVariant}
                transition={{ delay: 0.2 }}
                className="grid gap-4 xl:grid-cols-2"
              >
                {/* Bar Chart */}
                <section className="rounded-xl border border-vv-border bg-vv-surface p-5 shadow-card">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-semibold text-vv-heading">🗳️ Live CR Election Results</h2>
                    <span className="rounded-full bg-vv-accent/10 px-2.5 py-0.5 text-xs font-bold text-vv-accent ring-1 ring-vv-accent/30">
                      {election.totalVotes} votes
                    </span>
                  </div>
                  <p className="text-sm text-vv-muted mb-4">Updates in real-time as votes are cast via Aadhaar verification</p>
                  {election.totalVotes === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-vv-muted">
                      <svg className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-sm">No votes yet. Go to <strong>Live CR Voting</strong> to cast the first vote!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {election.byCandidate.map((c, i) => (
                        <div key={c.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-vv-heading">{c.name}</span>
                            <span className="text-vv-muted">{c.votes} votes · {c.percentage}%</span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-vv-bg overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${c.percentage}%` }}
                              transition={{ duration: 0.6, ease: 'easeOut' }}
                              className="h-full rounded-full"
                              style={{ background: CANDIDATE_COLORS[i % CANDIDATE_COLORS.length] }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Recent Votes Ticker */}
                <section className="rounded-xl border border-vv-border bg-vv-surface p-5 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-vv-heading">Live Vote Ticker</h2>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
                      <span className="text-xs text-vv-muted">Live</span>
                    </span>
                  </div>
                  {recentVotes.length === 0 ? (
                    <p className="text-sm text-vv-muted text-center py-10">Waiting for votes…</p>
                  ) : (
                    <ul className="space-y-2 max-h-52 overflow-y-auto">
                      {recentVotes.map((v) => (
                        <motion.li
                          key={v.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="grid gap-2 rounded-lg border border-vv-border bg-vv-bg px-3 py-2 sm:grid-cols-[1fr_0.8fr_0.9fr_0.9fr_auto]"
                        >
                          <span className="text-xs font-semibold text-vv-heading">
                            {v.voterName || 'Registered voter'}
                          </span>
                          <span className="font-mono text-xs text-vv-muted">****-****-{v.aadhaarLast4}</span>
                          <span className="text-xs text-vv-muted">
                            Mob {v.voterMobileLast4 ? `XXXXXX${v.voterMobileLast4}` : 'not linked'}
                          </span>
                          <span className="text-xs font-semibold text-vv-heading">{v.candidateName}</span>
                          <span className="text-[11px] text-vv-muted">
                            {new Date(v.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </section>
              </motion.div>
            )}

            <motion.section 
              initial="hidden"
              animate="visible"
              variants={fadeUpVariant}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-vv-border bg-vv-surface p-5 shadow-card"
            >
              <h2 className="text-base font-semibold text-vv-heading">Verification trend</h2>
              <p className="mt-1 text-sm text-vv-muted">Cumulative verified booths (live stream merges with REST)</p>
              {chartData.length === 0 ? (
                <div className="mt-8">
                  <EmptyState title="No trend data" description="The stats API did not return a time series." />
                </div>
              ) : (
                <div className="mt-6 h-72 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="var(--vv-border)" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: 'var(--vv-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--vv-border)' }} />
                      <YAxis tick={{ fill: 'var(--vv-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--vv-border)' }} tickFormatter={(v) => nf.format(v)} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--vv-surface)',
                          border: '1px solid var(--vv-border)',
                          borderRadius: 8,
                        }}
                        labelStyle={{ color: 'var(--vv-muted)' }}
                        formatter={(value) => [nf.format(value), 'Verified']}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="var(--vv-accent)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--vv-accent)', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.section>
          </>
        ) : null}
        {!loading && !stats ? (
          <EmptyState title="No statistics" description="Unable to load dashboard metrics." />
        ) : null}
      </main>
    </div>
  )
}
