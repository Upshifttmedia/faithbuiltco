export default function TaskItem({ label, completed, onToggle }) {
  function handleToggle() {
    // Haptic feedback on supported devices
    if (navigator.vibrate) navigator.vibrate(12)
    onToggle()
  }

  return (
    <button
      className={`task-item ${completed ? 'task-item--done' : ''}`}
      onClick={handleToggle}
      aria-pressed={completed}
    >
      <span className="task-check" aria-hidden="true">
        {/* Wrap in a keyed span so React re-mounts it (re-triggers animation) each time */}
        {completed && <span key="check" className="task-check-mark">✓</span>}
      </span>
      <span className="task-label">{label}</span>
    </button>
  )
}
