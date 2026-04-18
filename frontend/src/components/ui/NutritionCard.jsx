import { Card } from './Card'
import { MetricPill } from './MetricPill'

export function NutritionCard({ title, description, nutrients, badge }) {
  return (
    <Card className="surface">
      <div className="card-heading-row">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        {badge ? <MetricPill tone="accent">{badge}</MetricPill> : null}
      </div>
      <div className="chips">
        {nutrients.map((item) => (
          <MetricPill key={item.label}>
            {item.label}: {item.value}
          </MetricPill>
        ))}
      </div>
    </Card>
  )
}

