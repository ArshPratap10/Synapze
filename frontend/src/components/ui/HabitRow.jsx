import { Pencil, Trash2 } from 'lucide-react'

export function HabitRow({ habit, recurrenceLabel, onToggle, onEdit, onDelete }) {
  return (
    <div className="habit-item">
      <label className="habit-main">
        <span>
          <strong className="habit-name">{habit.name}</strong>
          {habit.category ? <small className="habit-meta">{habit.category}</small> : null}
          <small className="habit-meta">{recurrenceLabel}</small>
        </span>
        <input type="checkbox" checked={habit.completed} onChange={() => onToggle(habit.id)} />
      </label>
      <div className="habit-actions">
        <button
          type="button"
          className="icon-button"
          aria-label={`Edit ${habit.name}`}
          onClick={() => onEdit(habit)}
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          className="icon-button icon-button-danger"
          aria-label={`Delete ${habit.name}`}
          onClick={() => onDelete(habit.id)}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
