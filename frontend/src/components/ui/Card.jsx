export function Card({ children, className = '', tone = 'default', as: Component = 'article' }) {
  const classes = ['card', tone !== 'default' ? `card-${tone}` : '', className]
    .filter(Boolean)
    .join(' ')

  return <Component className={classes}>{children}</Component>
}

