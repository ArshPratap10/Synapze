export function PrimaryButton({ children, className = '', variant = 'primary', ...props }) {
  const classes = ['button', variant === 'ghost' ? 'button-ghost' : 'button-primary', className]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

