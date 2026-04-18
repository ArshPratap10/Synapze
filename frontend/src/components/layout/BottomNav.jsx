export function BottomNav({ items, activeTab, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map((item) => (
        <button
          key={item.id}
          className={activeTab === item.id ? 'tab active' : 'tab'}
          onClick={() => onChange(item.id)}
          type="button"
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

