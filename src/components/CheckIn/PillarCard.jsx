import { useState, useEffect } from 'react'
import TaskItem from './TaskItem'
import { usePillarNote } from '../../hooks/usePillarNote'

export default function PillarCard({ pillar, completions, onToggle, userId }) {
  const completedCount = pillar.tasks.filter(t => completions[t.key] === true).length
  const allDone        = completedCount === pillar.tasks.length

  // Start collapsed; auto-open when a task is first checked
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (completedCount > 0 && !isOpen) setIsOpen(true)
  }, [completedCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const { note, onChange, saving } = usePillarNote(userId, pillar.key)

  return (
    <div className={`pillar-card${allDone ? ' pillar-card--done' : ''}${isOpen ? ' pillar-card--open' : ''}`}>

      {/* Tappable header — always visible */}
      <button
        className="pillar-header pillar-header--btn"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
      >
        <div className="pillar-icon">{pillar.icon}</div>
        <div className="pillar-info">
          <h3 className="pillar-name">{pillar.label}</h3>
          <span className="pillar-progress">
            {completedCount}/{pillar.tasks.length}
          </span>
        </div>
        <div className="pillar-header-right">
          {allDone
            ? <div className="pillar-badge">✓</div>
            : <div className={`pillar-chevron${isOpen ? ' pillar-chevron--open' : ''}`}>›</div>
          }
        </div>
      </button>

      {/* Progress bar — always visible */}
      <div className="pillar-progress-bar">
        <div
          className="pillar-progress-fill"
          style={{ width: `${(completedCount / pillar.tasks.length) * 100}%` }}
        />
      </div>

      {/* Expandable body — grid-row collapse trick requires a single child */}
      <div className={`pillar-body${isOpen ? ' pillar-body--open' : ''}`}>
        <div className="pillar-body-inner">
          <div className="task-list">
            {pillar.tasks.map(task => (
              <TaskItem
                key={task.key}
                label={task.label}
                completed={completions[task.key] === true}
                onToggle={() => onToggle(pillar.key, task.key)}
              />
            ))}
          </div>

          <div className="pillar-note-wrap">
            <textarea
              className="pillar-note"
              placeholder={`Notes for ${pillar.label}…`}
              value={note}
              onChange={e => onChange(e.target.value)}
              rows={2}
            />
            {saving && <span className="pillar-note-saving">saving…</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
