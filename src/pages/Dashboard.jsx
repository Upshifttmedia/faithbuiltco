import { useAuth } from '../hooks/useAuth'
import { useStreak } from '../hooks/useStreak'
import { useHistory } from '../hooks/useHistory'
import WeekRow from '../components/Streak/WeekRow'
import MotivationalBanner from '../components/Dashboard/MotivationalBanner'
import ChallengeCard from '../components/Dashboard/ChallengeCard'
import CalendarGrid from '../components/Dashboard/CalendarGrid'

const EVENING_HOUR = 18  // show evening card after 6pm

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

// ✅ First name only — never fall back to email prefix
function getFirstName(user) {
  const name = (user?.user_metadata?.display_name ?? '').trim()
  if (name) return name.split(/\s+/)[0]
  return 'Friend'
}

// Pillar context shown on dashboard so users know what they're doing
const PILLAR_PREVIEWS = [
  { icon: '✦', label: 'Faith',       desc: 'Scripture and prayer' },
  { icon: '⚡', label: 'Body',        desc: 'Move your body 20+ minutes' },
  { icon: '◈', label: 'Mind',         desc: 'Remove distraction, raise standards' },
  { icon: '◆', label: 'Stewardship',  desc: 'Own your responsibilities' },
]

export default function Dashboard({ navigate, userId }) {
  const { user } = useAuth()
  const { streak } = useStreak(userId)
  const { days, calendarDays, loading } = useHistory(userId)

  const todayIsComplete = days.find(d => d.isToday)?.isComplete ?? false
  const displayName    = getFirstName(user)
  const showEveningCard = new Date().getHours() >= EVENING_HOUR

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">FaithBuilt</span>
        </div>
      </header>

      <main className="main-content">
        {/* Daily motivational banner */}
        <MotivationalBanner />

        {/* Greeting */}
        <div className="dashboard-greeting">
          <p className="greeting-sub">Back in the grind,</p>
          <h1 className="greeting-name">{displayName}</h1>
          <p className="greeting-date">{todayLabel}</p>
        </div>

        {/* Today's Challenge */}
        <ChallengeCard />

        {/* Streak Callout */}
        <div className="streak-callout">
          <div className="streak-callout-left">
            <span className="streak-callout-flame">🔥</span>
            <div>
              <div className="streak-callout-number">{streak.current_streak}</div>
              <div className="streak-callout-label">
                day streak
                {streak.grace_active && (
                  <span className="grace-shield" title="Grace day active — streak protected">🛡</span>
                )}
              </div>
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
                <p className="cta-complete-title">Today you showed up.</p>
                <p className="cta-complete-sub">All pillars aligned.</p>
              </div>
              <button className="btn-outline" onClick={() => navigate('checkin')}>
                Review
              </button>
            </div>
          ) : (
            <button className="btn-primary btn-cta" onClick={() => navigate('checkin')}>
              Enter Your Morning →
            </button>
          )}
        </div>

        {/* Evening Reflection card — visible after 6pm */}
        {showEveningCard && (
          <button
            className="evening-card"
            onClick={() => navigate('evening')}
          >
            <div className="evening-card-left">
              <span className="evening-card-icon">◈</span>
              <div>
                <p className="evening-card-title">Evening Reflection</p>
                <p className="evening-card-sub">Close the day strong.</p>
              </div>
            </div>
            <span className="evening-card-arrow">›</span>
          </button>
        )}

        {/* Four Pillar context cards */}
        <div className="pillar-previews">
          <p className="section-heading">Today's Pillars</p>
          <div className="pillar-preview-grid">
            {PILLAR_PREVIEWS.map(p => (
              <div
                key={p.label}
                className="pillar-preview-card"
                onClick={() => navigate('checkin')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && navigate('checkin')}
              >
                <span className="pillar-preview-icon">{p.icon}</span>
                <div className="pillar-preview-text">
                  <p className="pillar-preview-label">{p.label}</p>
                  <p className="pillar-preview-desc">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 30-Day Calendar */}
        {!loading && <CalendarGrid calendarDays={calendarDays} />}

      </main>
    </div>
  )
}
