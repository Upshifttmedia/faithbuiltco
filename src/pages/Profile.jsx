import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useStreak } from '../hooks/useStreak'
import { useHistory } from '../hooks/useHistory'
import { useDailyCommit } from '../hooks/useDailyCommit'
import { supabase } from '../lib/supabase'
import { subscribeToPush, unsubscribeFromPush } from '../hooks/usePushNotifications'
import Toast          from '../components/Toast'
import { PillarIcon } from '../components/PillarIcon'

const GOLD = '#C9A84C'

// ── Notification Settings ────────────────────────────────────────────
// Handles the push toggle AND the morning/evening time pickers in one
// place so enabled state can gate the time picker display.
function NotificationSettings({ userId }) {
  const [enabled,     setEnabled]     = useState(false)
  const [toggling,    setToggling]    = useState(true)  // true = loading
  const [morningTime, setMorningTime] = useState('07:00')
  const [eveningTime, setEveningTime] = useState('20:00')
  const [saved,       setSaved]       = useState(false)
  const [toast,       setToast]       = useState(null)
  const saveTimer = useRef(null)

  // On mount: check browser push subscription AND fetch stored times
  useEffect(() => {
    async function init() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setToggling(false); return
      }
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (!sub) { setToggling(false); return }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setToggling(false); return }

        const { data } = await supabase
          .from('push_subscriptions')
          .select('morning_time, evening_time')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (data) {
          setEnabled(true)
          if (data.morning_time) setMorningTime(data.morning_time)
          if (data.evening_time) setEveningTime(data.evening_time)
        }
      } catch { /* silent — toggle stays off */ }
      setToggling(false)
    }
    init()
  }, [userId])

  async function handleToggle() {
    if (toggling) return
    setToggling(true)
    if (enabled) {
      const { data: { session } } = await supabase.auth.getSession()
      const { error } = await unsubscribeFromPush(session?.user?.id)
      if (error) {
        setToast({ message: "Couldn't disable notifications. Try again.", type: 'error' })
      } else {
        setEnabled(false)
      }
    } else {
      const { data: { session } } = await supabase.auth.getSession()
      const { subscription, error } = await subscribeToPush(session?.user?.id)
      if (error || !subscription) {
        setToast({ message: "Couldn't enable notifications. Try again.", type: 'error' })
      } else {
        setEnabled(true)
      }
    }
    setToggling(false)
  }

  async function handleTimeChange(field, value) {
    // Update local state immediately for responsive UI
    if (field === 'morning_time') setMorningTime(value)
    else setEveningTime(value)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase
      .from('push_subscriptions')
      .update({ [field]: value })
      .eq('user_id', session.user.id)

    // Show "Saved" for 2 s, debounced so rapid changes don't flash
    setSaved(true)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}

      {/* ── Toggle row ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, background: '#1a1a1a', borderRadius: 12,
      }}>
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Daily Reminders</div>
          <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
            Get a morning prompt and evening reflection nudge.
          </div>
        </div>
        <div
          onClick={handleToggle}
          style={{
            width: 51, height: 31, borderRadius: 15.5,
            background: enabled ? GOLD : '#333',
            position: 'relative',
            cursor: toggling ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            flexShrink: 0,
            opacity: toggling ? 0.6 : 1,
          }}
        >
          <div style={{
            position: 'absolute', top: 2,
            left: enabled ? 22 : 2,
            width: 27, height: 27, borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>

      {/* ── Time pickers — only visible when notifications are on ── */}
      {enabled && (
        <div style={{
          marginTop: 16,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <TimePicker
            label="Morning reminder"
            subtext="When should we call you to commit?"
            value={morningTime}
            onChange={v => handleTimeChange('morning_time', v)}
          />
          <TimePicker
            label="Evening reminder"
            subtext="When should we call you to reflect?"
            value={eveningTime}
            onChange={v => handleTimeChange('evening_time', v)}
          />

          {/* "Saved" confirmation — fades in, shown for 2 s */}
          <p style={{
            color: GOLD, fontSize: 13, textAlign: 'center',
            margin: '4px 0 0',
            opacity: saved ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}>
            Saved
          </p>
        </div>
      )}
    </div>
  )
}

// ── Time picker row ──────────────────────────────────────────────────
function TimePicker({ label, subtext, value, onChange }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 16px', background: '#1a1a1a', borderRadius: 12,
    }}>
      <div>
        <div style={{
          color: '#aaa', fontSize: 12,
          textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600,
        }}>
          {label}
        </div>
        <div style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
          {subtext}
        </div>
      </div>

      <input
        type="time"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: '#0d0d0d',
          color: '#fff',
          border: `1.5px solid ${focused ? GOLD : '#2a2a2a'}`,
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 15,
          fontWeight: 600,
          outline: 'none',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease',
          // Remove default time-input chrome styling
          colorScheme: 'dark',
          flexShrink: 0,
          minWidth: 100,
        }}
      />
    </div>
  )
}

// ── Profile page ─────────────────────────────────────────────────────

export default function Profile({ navigate }) {
  const { user, signOut } = useAuth()
  const { streak } = useStreak(user?.id)
  const { totalCompleted, loading } = useHistory(user?.id)
  const { commit } = useDailyCommit(user?.id)

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'Friend'
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
            <div className="stat-label">Days Aligned</div>
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
              { icon: '✦', key: 'faith',       name: 'Faith',       fallback: 'Scripture and prayer' },
              { icon: '⚡', key: 'body',        name: 'Body',        fallback: 'Move your body today' },
              { icon: '◈', key: 'mind',         name: 'Mind',        fallback: 'Read and reflect' },
              { icon: '◆', key: 'stewardship',  name: 'Stewardship', fallback: 'Own your responsibilities' },
            ].map(p => {
              const todayText = commit?.[`${p.key}_commitment`]
              return (
                <div key={p.name} className="profile-pillar-row">
                  <span className="profile-pillar-icon"><PillarIcon pillar={p.key} size={18} color="#C9A84C" /></span>
                  <div>
                    <p className="profile-pillar-name">{p.name}</p>
                    <p
                      className="profile-pillar-tasks"
                      style={todayText ? { color: '#fff' } : undefined}
                    >
                      {todayText || p.fallback}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="profile-section">
          <p className="profile-section-title">Notifications</p>
          <NotificationSettings userId={user?.id} />
        </div>

        {/* Sign Out */}
        <button className="btn-signout" onClick={handleSignOut}>
          Sign Out
        </button>

        {/* Share Feedback */}
        <div style={{ marginTop: 24, marginBottom: 0 }}>
          <a
            href="mailto:joel@upshiftt.com?subject=FaithBuilt%20Feedback&body=Hey%20Joel%2C%0A%0AHere%27s%20my%20feedback%20on%20FaithBuilt%3A%0A%0AWhat%20I%20love%3A%0A%0AWhat%27s%20missing%20or%20confusing%3A%0A%0AWould%20I%20pay%20%244.99%2Fmonth%3A%0A%0AWould%20I%20invite%20a%20friend%3A"
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              background: '#1a1a1a',
              border: '1px solid #C9A84C',
              borderRadius: 8,
              padding: 16,
              color: '#C9A84C',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textAlign: 'center',
              textDecoration: 'none',
              marginBottom: 8,
            }}
          >
            Share Feedback 💬
          </a>
          <p style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontStyle: 'italic',
            fontSize: 11,
            color: '#666',
            textAlign: 'center',
            margin: '0 0 24px',
          }}>
            Your feedback shapes what gets built next.
          </p>
        </div>

        {/* About FaithBuilt */}
        <div style={{ marginTop: 0, paddingBottom: 32 }}>
          {/* Divider */}
          <div style={{
            height: 1,
            background: '#C9A84C',
            opacity: 0.25,
            marginBottom: 24,
          }} />

          {/* Label */}
          <p style={{
            color: '#C9A84C',
            fontSize: 11,
            fontVariant: 'small-caps',
            textTransform: 'uppercase',
            letterSpacing: 2,
            textAlign: 'center',
            margin: '0 0 16px',
          }}>
            About FaithBuilt
          </p>

          {/* Mission text */}
          <p style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            color: '#666',
            fontSize: 13,
            fontStyle: 'italic',
            lineHeight: 1.8,
            textAlign: 'center',
            maxWidth: 280,
            margin: '0 auto 12px',
          }}>
            FaithBuilt exists for one reason. Most men don't collapse in their faith.
            They drift. This is the system that ends the drift.
          </p>

          {/* Tagline */}
          <p style={{
            color: '#555',
            fontSize: 11,
            textAlign: 'center',
            letterSpacing: 1,
          }}>
            Faith. Discipline. Daily.
          </p>
        </div>
      </main>
    </div>
  )
}
