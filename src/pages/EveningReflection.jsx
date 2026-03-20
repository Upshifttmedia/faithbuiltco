import { useState } from 'react'
import { useDailyCommit } from '../hooks/useDailyCommit'
import { useStreak } from '../hooks/useStreak'
import { useAuth } from '../hooks/useAuth'

const PILLARS = [
  { key: 'faith',       icon: '✦', label: 'Faith' },
  { key: 'body',        icon: '⚡', label: 'Body' },
  { key: 'mind',        icon: '◈', label: 'Mind' },
  { key: 'stewardship', icon: '◆', label: 'Stewardship' },
]

const MILESTONE_COPY = {
  7:  { icon: '🔥', days: '7 days.',  body: 'A week of discipline. You are not the same man.' },
  14: { icon: '⚡', days: '14 days.', body: 'Two weeks. The habit is forming.' },
  21: { icon: '◆', days: '21 days.', body: 'Three weeks. This is becoming who you are.' },
  30: { icon: '✦', days: '30 days.', body: 'A month of showing up. This is character.\nYou\'ve unlocked the 30-Day Alignment Reset.' },
}

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

// Full-screen overlay shared by all celebration/milestone screens
function Overlay({ children, style = {} }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#060606',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100, padding: '0 32px', textAlign: 'center',
      ...style,
    }}>
      <style>{`
        @keyframes er-fade { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes er-pulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.15) } }
      `}</style>
      {children}
    </div>
  )
}

export default function EveningReflection({ navigate, userId }) {
  const { commit, loading, saveEvening } = useDailyCommit(userId)
  const { updateStreakFromEvening }       = useStreak(userId)
  const { profile }                       = useAuth()

  const displayName = profile?.display_name || 'Builder'

  // Per-pillar evening selections: null = not chosen, true = showed up, false = not today
  const [selections, setSelections] = useState({ faith: null, body: null, mind: null, stewardship: null })
  const [carryText, setCarryText]   = useState('')
  const [saving, setSaving]         = useState(false)

  // phase: 'form' | 'milestone' | 'full' | 'partial' | 'missed'
  const [phase, setPhase]         = useState('done-check')
  const [milestoneDay, setMilestone] = useState(null)
  const [celebData, setCelebData]  = useState({ newStreak: 0, resultType: 'full' })

  // If already evening_done, skip to done view
  const alreadyDone = commit?.evening_done

  if (loading) {
    return <div className="loader-screen"><div className="loader-icon">✦</div></div>
  }

  // ── Already completed tonight ────────────────────────────────────────
  if (alreadyDone && phase === 'done-check') {
    return (
      <div className="app-shell">
        <header className="top-bar">
          <button className="back-btn" onClick={() => navigate('dashboard')}>← Back</button>
          <div className="brand"><span className="brand-mark">✦</span></div>
        </header>
        <main className="main-content">
          <div className="evening-saved">
            <div className="evening-saved-mark">✦</div>
            <h2 className="evening-saved-title">Day locked in.</h2>
            <p className="evening-saved-sub">You already closed the loop tonight. Rest well.</p>
            <button className="btn-primary" onClick={() => navigate('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── No morning commit ────────────────────────────────────────────────
  if (!commit?.morning_done && phase === 'done-check') {
    return (
      <div className="app-shell">
        <header className="top-bar">
          <button className="back-btn" onClick={() => navigate('dashboard')}>← Back</button>
          <div className="brand"><span className="brand-mark">✦</span></div>
        </header>
        <main className="main-content">
          <div className="evening-saved">
            <div className="evening-saved-mark">◆</div>
            <h2 className="evening-saved-title">No morning commit found.</h2>
            <p className="evening-saved-sub">Start your day with a morning commitment first.</p>
            <button className="btn-primary" onClick={() => navigate('checkin')}>
              Begin Your Morning
            </button>
          </div>
        </main>
      </div>
    )
  }

  // ── Milestone screen ─────────────────────────────────────────────────
  if (phase === 'milestone') {
    const m = MILESTONE_COPY[milestoneDay] || {}
    return (
      <Overlay>
        <div style={{ fontSize: 72, animation: 'er-pulse 1.5s ease infinite', marginBottom: 24 }}>
          {m.icon}
        </div>
        <h1 style={{ color: '#C9A84C', fontSize: 36, fontWeight: 800, margin: '0 0 16px', animation: 'er-fade 0.5s ease' }}>
          {m.days}
        </h1>
        <p style={{ color: '#aaa', fontSize: 18, lineHeight: 1.7, whiteSpace: 'pre-line', animation: 'er-fade 0.5s ease 0.1s both' }}>
          {m.body}
        </p>
        <button
          className="btn-primary"
          style={{ marginTop: 40 }}
          onClick={() => setPhase(celebData.resultType)}
        >
          Continue →
        </button>
      </Overlay>
    )
  }

  // ── Full day celebration ─────────────────────────────────────────────
  if (phase === 'full') {
    return (
      <Overlay>
        <div style={{ fontSize: 20, color: '#C9A84C', letterSpacing: 4, marginBottom: 16, animation: 'er-fade 0.4s ease' }}>
          🔥
        </div>
        <h1 style={{ color: '#C9A84C', fontSize: 52, fontWeight: 900, margin: '0 0 8px', animation: 'er-fade 0.4s ease 0.05s both' }}>
          {celebData.newStreak}
        </h1>
        <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, margin: '0 0 12px', animation: 'er-fade 0.4s ease 0.1s both' }}>
          Day {celebData.newStreak}. Locked in.
        </p>
        <p style={{ color: '#888', fontSize: 16, animation: 'er-fade 0.4s ease 0.15s both' }}>
          {displayName}, you kept your word today.
        </p>
        <button
          className="btn-primary"
          style={{ marginTop: 40 }}
          onClick={() => navigate('dashboard')}
        >
          See my streak
        </button>
      </Overlay>
    )
  }

  // ── Partial day celebration (3 pillars) ──────────────────────────────
  if (phase === 'partial') {
    return (
      <Overlay>
        <div style={{ fontSize: 48, marginBottom: 24, animation: 'er-fade 0.4s ease' }}>◆</div>
        <h1 style={{ color: '#C9A84C', fontSize: 36, fontWeight: 800, margin: '0 0 12px', animation: 'er-fade 0.4s ease 0.05s both' }}>
          You showed up.
        </h1>
        <p style={{ color: '#aaa', fontSize: 18, animation: 'er-fade 0.4s ease 0.1s both' }}>
          3 out of 4. Grace covers the rest.
        </p>
        <button
          className="btn-primary"
          style={{ marginTop: 40 }}
          onClick={() => navigate('dashboard')}
        >
          Tomorrow, give it all.
        </button>
      </Overlay>
    )
  }

  // ── Missed day ───────────────────────────────────────────────────────
  if (phase === 'missed') {
    return (
      <Overlay>
        <div style={{ fontSize: 48, marginBottom: 24, animation: 'er-fade 0.4s ease' }}>◈</div>
        <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 800, margin: '0 0 12px', animation: 'er-fade 0.4s ease 0.05s both' }}>
          Drift ends now.
        </h1>
        <p style={{ color: '#888', fontSize: 18, animation: 'er-fade 0.4s ease 0.1s both' }}>
          Tomorrow is Day 1 again. Show up.
        </p>
        <button
          className="btn-primary"
          style={{ marginTop: 40 }}
          onClick={() => navigate('dashboard')}
        >
          I'll be back tomorrow.
        </button>
      </Overlay>
    )
  }

  // ── Main form ────────────────────────────────────────────────────────

  async function handleLockIn() {
    setSaving(true)

    // Build final confirmed map — merge morning checkmarks + evening selections
    const finalConfirms = {}
    for (const p of PILLARS) {
      const alreadyConfirmed = !!commit[`${p.key}_confirmed`]
      const eveningChoice    = selections[p.key]
      finalConfirms[p.key] = alreadyConfirmed || eveningChoice === true
    }

    const confirmedCount = Object.values(finalConfirms).filter(Boolean).length

    await saveEvening(finalConfirms)
    const result = await updateStreakFromEvening(confirmedCount)

    setSaving(false)

    const resultType = result?.resultType ?? (confirmedCount >= 4 ? 'full' : confirmedCount === 3 ? 'partial' : 'missed')
    const newStreak  = result?.newStreak  ?? 0
    const isMilestone = result?.isMilestone ?? false

    setCelebData({ newStreak, resultType })

    if (isMilestone && MILESTONE_COPY[newStreak]) {
      setMilestone(newStreak)
      setPhase('milestone')
    } else {
      setPhase(resultType)
    }
  }

  // Determine whether all unconfirmed pillars have been addressed
  const unconfirmedPillars = PILLARS.filter(p => !commit[`${p.key}_confirmed`])
  const allAddressed = unconfirmedPillars.every(p => selections[p.key] !== null)

  return (
    <div className="app-shell">
      <header className="top-bar">
        <button className="back-btn" onClick={() => navigate('dashboard')} aria-label="Back">
          ← Back
        </button>
        <div className="brand"><span className="brand-mark">✦</span></div>
      </header>

      <main className="main-content">
        <p className="evening-label">Evening Reflection</p>
        <h2 className="evening-heading">How did you show up today?</h2>
        <p className="evening-sub">{todayLabel}</p>

        {/* Per-pillar review */}
        <div className="evening-commitments">
          {PILLARS.map(p => {
            const commitment = commit[`${p.key}_commitment`] ?? ''
            const alreadyDone = !!commit[`${p.key}_confirmed`]
            const sel = selections[p.key]

            return (
              <div
                key={p.key}
                style={{
                  background: alreadyDone || sel === true ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${alreadyDone || sel === true ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  marginBottom: 12,
                  transition: 'all 0.25s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 18, minWidth: 20, marginTop: 2 }}>{p.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 13, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {p.label}
                    </p>
                    {commitment ? (
                      <p style={{ margin: '0 0 10px', color: '#ccc', fontSize: 14, lineHeight: 1.5 }}>
                        {commitment}
                      </p>
                    ) : (
                      <p style={{ margin: '0 0 10px', color: '#555', fontSize: 14, fontStyle: 'italic' }}>
                        No commitment recorded.
                      </p>
                    )}

                    {alreadyDone ? (
                      <p style={{ color: '#4DD9C0', fontSize: 13, fontWeight: 600, margin: 0 }}>
                        ✅ Already confirmed
                      </p>
                    ) : (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setSelections(prev => ({ ...prev, [p.key]: true }))}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: `1px solid ${sel === true ? '#C9A84C' : 'rgba(255,255,255,0.12)'}`,
                            background: sel === true ? 'rgba(201,168,76,0.15)' : 'transparent',
                            color: sel === true ? '#C9A84C' : '#aaa',
                            fontSize: 13, fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          I showed up
                        </button>
                        <button
                          onClick={() => setSelections(prev => ({ ...prev, [p.key]: false }))}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: `1px solid ${sel === false ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
                            background: sel === false ? 'rgba(255,255,255,0.06)' : 'transparent',
                            color: sel === false ? '#888' : '#555',
                            fontSize: 13, fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          Not today
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Carry-forward journal */}
        <div className="evening-journal-wrap">
          <p className="evening-section-label">Anything to carry into tomorrow?</p>
          <textarea
            className="evening-textarea"
            value={carryText}
            onChange={e => setCarryText(e.target.value)}
            placeholder="A win, a lesson, or a word…"
            rows={3}
          />
        </div>

        <button
          className="btn-primary"
          onClick={handleLockIn}
          disabled={saving || !allAddressed}
          style={{ marginTop: 8 }}
        >
          {saving ? 'Locking in…' : 'Lock in today.'}
        </button>
      </main>
    </div>
  )
}
