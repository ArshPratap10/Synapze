export function MetricPill({ children, tone = 'default' }) {
  const className = ['metric-pill', tone !== 'default' ? `metric-pill-${tone}` : '']
    .filter(Boolean)
    .join(' ')

  return <span className={className}>{children}</span>
}

