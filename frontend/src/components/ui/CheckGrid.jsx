export function CheckGrid({ items }) {
  return (
    <div className="week-grid">
      {items.map((item, index) => (
        <div key={`${item.day}-${index}`} className="day-cell">
          <small>{item.day}</small>
          <span className={item.done ? 'dot done' : 'dot'} />
        </div>
      ))}
    </div>
  )
}

