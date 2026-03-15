export default function TaskItem({ label, completed, onToggle }) {
  return (
    <button
      className={`task-item ${completed ? 'task-item--done' : ''}`}
      onClick={onToggle}
      aria-pressed={completed}
    >
      <span className="task-check">
        {completed ? '✓' : ''}
      </span>
      <span className="task-label">{label}</span>
    </button>
  )
}
