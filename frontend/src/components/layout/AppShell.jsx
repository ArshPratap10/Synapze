export function AppShell({ children, header, nav }) {
  return (
    <div className="app-shell">
      <div className="app-shell-inner">
        {header}
        <main className="screen-card">{children}</main>
      </div>
      {nav}
    </div>
  )
}

