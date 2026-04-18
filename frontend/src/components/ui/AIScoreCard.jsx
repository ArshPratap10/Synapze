import { HeroCard } from './HeroCard'
import { MetricPill } from './MetricPill'

export function AIScoreCard({ score, reason, recommendation }) {
  return (
    <HeroCard
      title={`Daily score: ${score}/100`}
      description={reason}
      actions={<MetricPill tone="accent">Non-medical guidance</MetricPill>}
    >
      <p className="score-note">{recommendation}</p>
    </HeroCard>
  )
}

