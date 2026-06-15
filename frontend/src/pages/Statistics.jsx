import { useCallback, useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchStats } from '../api/booth.api'
import Topbar from '../components/layout/Topbar'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'

const PIE_COLORS = ['var(--vv-accent)', '#fbbf24', '#f87171', '#64748b', '#818cf8', '#a78bfa']
const nf = new Intl.NumberFormat('en-IN')

export default function Statistics() {
  const [stats, setStats] = useState(null)
  const [fromMock, setFromMock] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadStats = useCallback(async () => {
    const res = await fetchStats()
    setStats(res.data)
    setFromMock(res.fromMock)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const byStatus = stats?.byStatus || stats?.statusBreakdown || []
  const byState = stats?.byState || stats?.stateBreakdown || []

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title="Statistics"
        subtitle="Distribution and regional load from /api/stats"
        mockMode={fromMock}
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        {loading ? <Loader label="Loading charts…" /> : null}
        {!loading && stats ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-xl border border-vv-border bg-vv-surface p-5 shadow-card">
              <h2 className="text-base font-semibold text-vv-heading">Verification by status</h2>
              <p className="mt-1 text-sm text-vv-muted">Pie chart · share of booths per state machine</p>
              {byStatus.length === 0 ? (
                <div className="mt-8">
                  <EmptyState title="No status breakdown" />
                </div>
              ) : (
                <div className="mt-4 h-80 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={56}
                        outerRadius={100}
                        paddingAngle={2}
                      >
                        {byStatus.map((_, i) => (
                          <Cell key={String(i)} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--vv-surface)',
                          border: '1px solid var(--vv-border)',
                          borderRadius: 8,
                        }}
                        formatter={(value) => nf.format(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-vv-border bg-vv-surface p-5 shadow-card">
              <h2 className="text-base font-semibold text-vv-heading">Top states by volume</h2>
              <p className="mt-1 text-sm text-vv-muted">Bar chart · abbreviated state codes from API</p>
              {byState.length === 0 ? (
                <div className="mt-8">
                  <EmptyState title="No regional breakdown" />
                </div>
              ) : (
                <div className="mt-4 h-80 w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={byState} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid stroke="var(--vv-border)" strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fill: 'var(--vv-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--vv-border)' }} />
                      <YAxis tick={{ fill: 'var(--vv-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--vv-border)' }} tickFormatter={(v) => nf.format(v)} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--vv-surface)',
                          border: '1px solid var(--vv-border)',
                          borderRadius: 8,
                        }}
                        formatter={(value) => [nf.format(value), 'Booths']}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="var(--vv-accent)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>
        ) : null}
        {!loading && !stats ? (
          <EmptyState title="No statistics" description="Unable to load chart data." />
        ) : null}
      </main>
    </div>
  )
}
