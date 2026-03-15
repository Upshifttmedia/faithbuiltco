import { useAuth } from '../hooks/useAuth'
import { useStreak } from '../hooks/useStreak'
import { useHistory } from '../hooks/useHistory'
import WeekRow from '../components/Streak/WeekRow'

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

export default function Dashboard({ navigate, userId }) {
  const { user } = useAuth()
  const { streak } = useStreak(userId)
  const { days, loading } = useHistory(userId)

  const todayIsComplete = days.find(d => d.isToday)?.isComplete ?? false
  const displayName = user?.email?.split('@')[0] ?? 'Friend'

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">FaithBuilt</span>
        </div>
      </header>

      <main className="main-content">
        {/* Greeting */}
        <div className="dashboard-greeting">
          <p className="greeting-sub">Good to see you,</p>
          <h1 className="greeting-name">{displayName}</h1>
          <p className="greeting-date">{todayLabel}</p>
        </div>

        {/* Streak Callout */}
        <div className="streak-callout">
          <div className="streak-callout-left">
            <span className="streak-callout-flame">🔥</span>
            <div>
              <div className="streak-callout-number">{streak.current_streak}</div>
              <div className="streak-callout-label">day streak</div>
            </div>
          </div>
          <div className="streak-callout-right">
            <div className="streak-best-num">{streak.longest_streak}</div>
            <div className="streak-best-label">best</div>
          </div>
        </div>

        {/* 7-Day Week Row */}
        <div className="week-section">
          <p className="week-section-label">Last 7 Days</p>
          {loading ? (
            <div className="week-row-skeleton" />
          ) : (
            <WeekRow days={days} />
          )}
        </div>

        {/* CTA */}
        <div className="dashboard-cta">
          {todayIsComplete ? (
            <div className="cta-complete">
              <span className="cta-complete-icon">✓</span>
              <div>
                <p className="cta-complete-title">Today is done!</p>
                <p className="cta-complete-sub">All pillars complete. Well done.</p>
              </div>
              <button className="btn-outline" onClick={() => navigate('checkin')}>
                Review
              </button>
            </div>
          ) : (
            <button className="btn-primary btn-cta" onClick={() => navigate('checkin')}>
              Begin Today's Check-In →
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
