import { Card } from './Card'
import { PrimaryButton } from './PrimaryButton'

export function ActivitySummaryCard({ title, description, value, onDecrease, onIncrease }) {
  return (
    <Card className="surface">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="controls">
        <button onClick={onDecrease} type="button">
          -
        </button>
        <strong>{value}</strong>
        <button onClick={onIncrease} type="button">
          +
        </button>
      </div>
      <div className="inline-actions">
        <PrimaryButton type="button" variant="ghost">
          Log activity
        </PrimaryButton>
      </div>
    </Card>
  )
}

