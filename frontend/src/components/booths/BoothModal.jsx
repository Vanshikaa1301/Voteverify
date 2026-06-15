import Modal from '../common/Modal'

const statusLabel = {
  verified: 'Verified',
  pending: 'Pending',
  issue: 'Issue',
  offline: 'Offline',
}

const statusColor = {
  verified: 'text-vv-accent',
  pending: 'text-amber-600 dark:text-amber-400',
  issue: 'text-red-600 dark:text-red-400',
  offline: 'text-slate-500',
}

export default function BoothModal({ booth, open, onClose }) {
  if (!booth) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={booth.name}
      footer={
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-vv-border px-4 py-2 text-sm text-vv-text hover:bg-vv-surface-muted"
        >
          Close
        </button>
      }
    >
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-vv-muted">Status</dt>
          <dd className={`font-medium ${statusColor[booth.status] || 'text-vv-heading'}`}>
            {statusLabel[booth.status] || booth.status}
          </dd>
        </div>
        <div>
          <dt className="text-vv-muted">State / District</dt>
          <dd className="text-vv-text">
            {booth.state} — {booth.district}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-vv-muted">Address</dt>
          <dd className="text-vv-text">{booth.address || '—'}</dd>
        </div>
        <div>
          <dt className="text-vv-muted">Presiding officer</dt>
          <dd className="text-vv-text">{booth.officerName || '—'}</dd>
        </div>
        <div>
          <dt className="text-vv-muted">Last verification</dt>
          <dd className="text-vv-text">
            {booth.lastVerificationAt
              ? new Date(booth.lastVerificationAt).toLocaleString('en-IN')
              : '—'}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-vv-muted">Coordinates</dt>
          <dd className="font-mono text-xs text-vv-text">
            {booth.lat?.toFixed(4)}, {booth.lng?.toFixed(4)}
          </dd>
        </div>
      </dl>
    </Modal>
  )
}
