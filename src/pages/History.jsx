import { useHistory } from '../hooks/useHistory'
import { useAuth } from '../hooks/useAuth'

const PILLAR_LABELS = ['Faith', 'Body', 'Mind', 'Stewardship']
const PILLAR_ICONS = ['✦', '⚡', '◈', '◆']

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function History() {
  const { user } = useAuth()
  const { days, loading } = useHistory(user?.id)

  // Reverse so most recent is first
  const sortedDays = [...days].reverse()

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">History</span>
        </div>
      </header>

      <main className="main-content">
        <p className="section-heading" style={{ marginBottom: 4 }}>Last 7 Days</p>

        {loading ? (
          <div className="history-skeleton">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="history-skeleton-row" />
            ))}
          </div>
        ) : (
          <div className="history-list">
            {sortedDays.map(day => (
              <div
                key={day.date}
                className={`history-card ${day.isComplete ? 'history-card--done' : ''} ${day.isToday ? 'history-card--today' : ''}`}
              >
                <div className="history-card-left">
                  <div className="history-status-ring">
                    {day.isComplete
                      ? <span className="history-check">✓</span>
                      : <span className="history-dash">—</span>
                    }
                  </div>
                  <div>
                    <p className="history-date-label">
                      {day.isToday ? 'Today' : formatDate(day.date)}
                    </p>
                    <p className="history-status-text">
                      {day.isComplete ? 'All pillars completed' : 'Not yet complete'}
                    </p>
                  </div>
                </div>

                {day.isComplete && (
                  <div className="history-pillars">
                    {PILLAR_ICONS.map((icon, i) => (
                      <span key={i} className="history-pillar-icon" title={PILLAR_LABELS[i]}>
                        {icon}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
