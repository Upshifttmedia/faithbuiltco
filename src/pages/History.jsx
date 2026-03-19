import { useHistory } from '../hooks/useHistory'
import { useAuth } from '../hooks/useAuth'

const TOTAL_PILLARS = 4
const PILLAR_ICONS  = ['✦', '⚡', '◈', '◆']
const PILLAR_LABELS = ['Faith', 'Body', 'Mind', 'Stewardship']

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function History() {
  const { user } = useAuth()
  const { days, loading } = useHistory(user?.id)

  // Reverse so most recent day is first
  const sortedDays = [...days].reverse()

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">Your Journey</span>
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
            {sortedDays.map(day => {
              const pc    = day.pillarsComplete ?? 0
              const done  = day.isComplete
              const none  = pc === 0 && !day.isToday
              const label = done
                ? 'Fully aligned'
                : pc > 0
                  ? `${pc} / ${TOTAL_PILLARS} pillars`
                  : day.isToday ? 'In progress' : 'Drifted'

              return (
                <div
                  key={day.date}
                  className={[
                    'history-card',
                    done ? 'history-card--done' : '',
                    pc > 0 && !done ? 'history-card--partial' : '',
                    day.isToday ? 'history-card--today' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <div className="history-card-left">
                    <div className={`history-status-ring${done ? ' history-status-ring--done' : ''}`}>
                      {done
                        ? <span className="history-check">✓</span>
                        : pc > 0
                          ? <span className="history-partial">{pc}</span>
                          : <span className="history-dash">—</span>
                      }
                    </div>
                    <div>
                      <p className="history-date-label">
                        {day.isToday ? 'Today' : formatDate(day.date)}
                      </p>
                      <p className="history-status-text">{label}</p>
                    </div>
                  </div>

                  {/* Pillar icons — filled for complete days, dimmed for partial */}
                  {(done || pc > 0) && (
                    <div className="history-pillars">
                      {PILLAR_ICONS.map((icon, i) => (
                        <span
                          key={i}
                          className={`history-pillar-icon${done ? '' : ' history-pillar-icon--dim'}`}
                          title={PILLAR_LABELS[i]}
                        >
                          {icon}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
