import TaskItem from './TaskItem'

export default function PillarCard({ pillar, completions, onToggle }) {
  const completedCount = pillar.tasks.filter(t => completions[t.key]).length
  const allDone = completedCount === pillar.tasks.length

  return (
    <div className={`pillar-card ${allDone ? 'pillar-card--done' : ''}`}>
      <div className="pillar-header">
        <div className="pillar-icon">{pillar.icon}</div>
        <div className="pillar-info">
          <h3 className="pillar-name">{pillar.label}</h3>
          <span className="pillar-progress">
            {completedCount}/{pillar.tasks.length}
          </span>
        </div>
        {allDone && <div className="pillar-badge">✓</div>}
      </div>

      <div className="pillar-progress-bar">
        <div
          className="pillar-progress-fill"
          style={{ width: `${(completedCount / pillar.tasks.length) * 100}%` }}
        />
      </div>

      <div className="task-list">
        {pillar.tasks.map(task => (
          <TaskItem
            key={task.key}
            label={task.label}
            completed={!!completions[task.key]}
            onToggle={() => onToggle(pillar.key, task.key)}
          />
        ))}
      </div>
    </div>
  )
}
