import { useAuth } from '../hooks/useAuth'
import { useStreak } from '../hooks/useStreak'
import { useHistory } from '../hooks/useHistory'

export default function Profile({ navigate }) {
  const { user, signOut } = useAuth()
  const { streak } = useStreak(user?.id)
  const { totalCompleted, loading } = useHistory(user?.id)

  const displayName = user?.email?.split('@')[0] ?? 'Friend'
  const initials = displayName.slice(0, 2).toUpperCase()

  async function handleSignOut() {
    await signOut()
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">Profile</span>
        </div>
      </header>

      <main className="main-content">
        {/* Avatar + Name */}
        <div className="profile-hero">
          <div className="profile-avatar">{initials}</div>
          <h2 className="profile-name">{displayName}</h2>
          <p className="profile-email">{user?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats">
          <div className="stat-card">
            <div className="stat-number">{loading ? '—' : totalCompleted}</div>
            <div className="stat-label">Days Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{streak.current_streak}</div>
            <div className="stat-label">Current Streak</div>
          </div>
          <div className="stat-card stat-card--wide">
            <div className="stat-number">{streak.longest_streak}</div>
            <div className="stat-label">Longest Streak</div>
          </div>
        </div>

        {/* Pillars section */}
        <div className="profile-section">
          <p className="profile-section-title">Your 4 Pillars</p>
          <div className="profile-pillars">
            {[
              { icon: '✦', name: 'Faith',       tasks: 'Morning Prayer · Scripture' },
              { icon: '⚡', name: 'Body',        tasks: 'Exercise · Healthy Eating' },
              { icon: '◈', name: 'Mind',         tasks: 'Reading · Gratitude' },
              { icon: '◆', name: 'Stewardship',  tasks: 'Financial Review · Service' },
            ].map(p => (
              <div key={p.name} className="profile-pillar-row">
                <span className="profile-pillar-icon">{p.icon}</span>
                <div>
                  <p className="profile-pillar-name">{p.name}</p>
                  <p className="profile-pillar-tasks">{p.tasks}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <button className="btn-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </main>
    </div>
  )
}
