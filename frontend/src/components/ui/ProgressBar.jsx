export function ProgressBar({ label, value, max = 100, tone = 'mint' }) {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div className="progress-bar-block">
      <div className="progress-bar-header">
        <span>{label}</span>
        <strong>{Math.round(percentage)}%</strong>
      </div>
      <div className="progress-track" aria-hidden="true">
        <span className={`progress-fill progress-fill-${tone}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

