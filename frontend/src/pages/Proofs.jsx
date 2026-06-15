import { useCallback, useEffect, useState } from 'react'
import apiClient from '../api/axios'
import { fetchProofs } from '../api/booth.api'
import Topbar from '../components/layout/Topbar'
import Loader from '../components/common/Loader'
import EmptyState from '../components/common/EmptyState'

const initialForm = {
  boothId: '',
  reporterName: '',
  aadhaar: '',
  incidentType: 'vote_mismatch',
  label: '',
  imageUrl: '',
  notes: '',
}

export default function Proofs() {
  const [proofs, setProofs] = useState([])
  const [form, setForm] = useState(initialForm)
  const [fromMock, setFromMock] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const loadProofs = useCallback(async () => {
    const res = await fetchProofs()
    const raw = res.data
    const list = Array.isArray(raw) ? raw : raw?.proofs || raw?.items || []
    setProofs(list)
    setFromMock(res.fromMock)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProofs()
  }, [loadProofs])

  const updateForm = (field, value) => {
    const nextValue = field === 'aadhaar' ? value.replace(/\D/g, '').slice(0, 12) : value
    setForm((prev) => ({ ...prev, [field]: nextValue }))
  }

  const submitProof = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')
    try {
      const { data } = await apiClient.post('/proofs', form)
      setProofs((prev) => [data, ...prev])
      setForm(initialForm)
      setMessage('Live proof submitted and added to admin evidence gallery.')
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to submit proof.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title="Live Proof Evidence"
        subtitle="Upload proof if voting time irregularity or mismatch occurs"
        mockMode={fromMock}
      />
      <main className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">
        <section className="rounded-xl border border-vv-border bg-vv-surface p-5 shadow-card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-vv-heading">Submit Voting Issue Proof</h2>
            <p className="mt-1 text-sm text-vv-muted">
              Add a live photo/video URL with booth details so admins can verify the problem statement evidence.
            </p>
          </div>

          {message ? (
            <div className="mb-4 rounded-xl border border-vv-border bg-vv-bg p-3 text-sm text-vv-heading">
              {message}
            </div>
          ) : null}

          <form onSubmit={submitProof} className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-vv-heading">Booth ID</label>
              <input
                required
                placeholder="b1"
                value={form.boothId}
                onChange={(e) => updateForm('boothId', e.target.value)}
                className="w-full rounded-xl border border-vv-border bg-vv-bg px-4 py-3 text-vv-heading focus:border-vv-accent focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-vv-heading">Issue Type</label>
              <select
                value={form.incidentType}
                onChange={(e) => updateForm('incidentType', e.target.value)}
                className="w-full rounded-xl border border-vv-border bg-vv-bg px-4 py-3 text-vv-heading focus:border-vv-accent focus:outline-none"
              >
                <option value="vote_mismatch">Vote mismatch</option>
                <option value="duplicate_attempt">Duplicate attempt</option>
                <option value="machine_fault">Machine fault</option>
                <option value="queue_dispute">Queue dispute</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-vv-heading">Reporter Name</label>
              <input
                placeholder="Person submitting proof"
                value={form.reporterName}
                onChange={(e) => updateForm('reporterName', e.target.value)}
                className="w-full rounded-xl border border-vv-border bg-vv-bg px-4 py-3 text-vv-heading focus:border-vv-accent focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-vv-heading">Linked Aadhaar</label>
              <input
                placeholder="Optional 12-digit Aadhaar"
                value={form.aadhaar}
                onChange={(e) => updateForm('aadhaar', e.target.value)}
                className="w-full rounded-xl border border-vv-border bg-vv-bg px-4 py-3 font-mono text-vv-heading focus:border-vv-accent focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-vv-heading">Evidence Label</label>
              <input
                required
                placeholder="Live proof photo"
                value={form.label}
                onChange={(e) => updateForm('label', e.target.value)}
                className="w-full rounded-xl border border-vv-border bg-vv-bg px-4 py-3 text-vv-heading focus:border-vv-accent focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-vv-heading">Photo/Video URL</label>
              <input
                required
                type="url"
                placeholder="https://..."
                value={form.imageUrl}
                onChange={(e) => updateForm('imageUrl', e.target.value)}
                className="w-full rounded-xl border border-vv-border bg-vv-bg px-4 py-3 text-vv-heading focus:border-vv-accent focus:outline-none"
              />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-sm font-semibold text-vv-heading">Notes</label>
              <textarea
                rows={3}
                placeholder="What happened during voting?"
                value={form.notes}
                onChange={(e) => updateForm('notes', e.target.value)}
                className="w-full resize-none rounded-xl border border-vv-border bg-vv-bg px-4 py-3 text-vv-heading focus:border-vv-accent focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-vv-accent px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-vv-accent-dim disabled:opacity-50 lg:col-span-2"
            >
              {submitting ? 'Submitting Proof...' : 'Submit Live Proof'}
            </button>
          </form>
        </section>

        {loading ? <Loader label="Loading proof gallery..." /> : null}
        {!loading && proofs.length === 0 ? (
          <EmptyState title="No proofs yet" description="Submitted live evidence will populate this grid." />
        ) : null}
        {!loading && proofs.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {proofs.map((p) => (
              <li
                key={p.id}
                className="group overflow-hidden rounded-xl border border-vv-border bg-vv-surface shadow-card transition hover:border-vv-accent/40"
              >
                <a
                  href={p.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-vv-accent"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-vv-surface-muted">
                    <img
                      src={p.imageUrl}
                      alt={p.label || `Proof ${p.id}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm font-medium text-vv-heading">{p.label || 'Proof'}</p>
                    <p className="text-xs text-vv-muted">
                      Booth {p.boothId || '-'}
                      {p.capturedAt ? ` - ${new Date(p.capturedAt).toLocaleString('en-IN')}` : ''}
                    </p>
                    {p.incidentType ? <p className="text-xs font-semibold text-vv-accent">{p.incidentType.replace(/_/g, ' ')}</p> : null}
                    {p.reporterName ? <p className="text-xs text-vv-muted">Reporter: {p.reporterName}</p> : null}
                    {p.aadhaarLast4 ? <p className="font-mono text-xs text-vv-muted">Aadhaar ****-****-{p.aadhaarLast4}</p> : null}
                    {p.notes ? <p className="line-clamp-2 text-xs text-vv-muted">{p.notes}</p> : null}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </div>
  )
}
