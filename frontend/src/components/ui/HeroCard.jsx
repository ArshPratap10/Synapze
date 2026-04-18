import { Card } from './Card'

export function HeroCard({ title, description, actions, children }) {
  return (
    <Card className="hero-card" tone="hero">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {children}
      {actions ? <div className="hero-actions">{actions}</div> : null}
    </Card>
  )
}

