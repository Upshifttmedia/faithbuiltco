import { useState, useEffect } from 'react'
import { useDailyCommit } from '../hooks/useDailyCommit'
import Toast               from '../components/Toast'
import { PillarIcon }      from '../components/PillarIcon'

// ── Rotating hint texts (7 per pillar, indexed by day of week 0-6) ──
const HINTS = {
  faith: [
    'Today I will pray before I pick up my phone.',
    'Today I will open Scripture for 20 minutes.',
    'Today I will thank God for three specific things.',
    'Today I will memorize one verse.',
    'Today I will pray for someone else by name.',
    'Today I will fast from something and pray instead.',
    'Today I will journal what God has been teaching me.',
  ],
  body: [
    'Today I will move my body for 30 minutes.',
    'Today I will fuel my body with intention.',
    'Today I will sleep 7+ hours tonight.',
    'Today I will drink enough water.',
    'Today I will say no to something that weakens me.',
    'Today I will push past the point I want to stop.',
    'Today I will treat my body like the temple it is.',
  ],
  mind: [
    'Today I will read 20 pages.',
    'Today I will remove one distraction from my environment.',
    'Today I will learn something new.',
    'Today I will practice gratitude in writing.',
    'Today I will protect my focus for 2 hours.',
    'Today I will listen more than I speak.',
    'Today I will reflect before I react.',
  ],
  stewardship: [
    'Today I will review my finances.',
    'Today I will serve someone without an agenda.',
    'Today I will honor my word to someone.',
    'Today I will invest in my future self.',
    'Today I will be present with the people around me.',
    'Today I will own my responsibilities fully.',
    'Today I will do one thing that Future Me will thank me for.',
  ],
}

const PILLARS = [
  { key: 'faith',       icon: '✦', label: 'Faith' },
  { key: 'body',        icon: '⚡', label: 'Body' },
  { key: 'mind',        icon: '◈', label: 'Mind' },
  { key: 'stewardship', icon: '◆', label: 'Stewardship' },
]

const DOW = new Date().getDay() // 0 = Sun … 6 = Sat

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

export default function MorningCommitment({ navigate, userId, identityStatement, onAllComplete }) {
  const { commit, loading, saveMorning } = useDailyCommit(userId)

  const identity = identityStatement || 'I am a man of faith, discipline, and character.'

  const [texts, setTexts]        = useState({ faith: '', body: '', mind: '', stewardship: '' })
  const [phase, setPhase]        = useState('form')  // 'form' | 'committed'
  const [justCommitted, setJust] = useState(false)   // true only when commit happened this session
  const [saving, setSaving]      = useState(false)
  const [toast, setToast]        = useState(null)

  // Pre-fill & jump to committed view if already done today
  useEffect(() => {
    if (loading || !commit?.morning_done) return
    setTexts({
      faith:       commit.faith_commitment       ?? '',
      body:        commit.body_commitment        ?? '',
      mind:        commit.mind_commitment        ?? '',
      stewardship: commit.stewardship_commitment ?? '',
    })
    setPhase('committed')
  }, [loading, commit])  // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss the "Committed." splash after 2 s — only for this session's commit
  useEffect(() => {
    if (!justCommitted || phase !== 'committed') return
    const t = setTimeout(() => navigate('dashboard'), 2000)
    return () => clearTimeout(t)
  }, [justCommitted, phase, navigate])

  async function handleCommit() {
    setSaving(true)
    const { error } = await saveMorning(texts)
    setSaving(false)
    if (error) {
      setToast({ message: "Couldn't save your commitment. Check your connection and try again.", type: 'error' })
      return
    }
    onAllComplete?.()
    setJust(true)
    setPhase('committed')
  }

  if (loading) {
    return <div className="loader-screen"><div className="loader-icon">✦</div></div>
  }

  // ── "Committed." full-screen splash (auto-dismisses after 2 s) ──────
  if (phase === 'committed' && justCommitted) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#070707',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}>
        <style>{`@keyframes mc-fade-in { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
        <div style={{ fontSize: 56, marginBottom: 24, animation: 'mc-fade-in 0.4s ease' }}>✦</div>
        <h1 style={{
          fontSize: 40, fontWeight: 800, letterSpacing: 3,
          color: '#C9A84C', margin: 0,
          animation: 'mc-fade-in 0.4s ease 0.1s both',
        }}>
          Committed.
        </h1>
        <p style={{
          color: '#888', fontSize: 16, marginTop: 16,
          textAlign: 'center', padding: '0 40px', lineHeight: 1.6,
          animation: 'mc-fade-in 0.4s ease 0.2s both',
        }}>
          Now go be who you said you are.
        </p>
      </div>
    )
  }

  // ── Already committed — static review (no auto-dismiss) ─────────────
  if (phase === 'committed') {
    return (
      <div className="app-shell">
        <header className="top-bar">
          <button className="back-btn" onClick={() => navigate('dashboard')} aria-label="Back">
            ← Back
          </button>
          <div className="brand"><span className="brand-mark">✦</span></div>
        </header>
        <main className="main-content">
          <p className="mc-date">{todayLabel}</p>
          <div className="mc-celebrate-top" style={{ paddingBottom: 8 }}>
            <div className="mc-celebrate-mark">✦</div>
            <p className="mc-celebrate-heading">Committed.</p>
            <p className="mc-celebrate-sub">You already showed up this morning.</p>
          </div>
          <div className="mc-review" style={{ marginTop: 24 }}>
            <p className="mc-review-heading">Your commitments for today</p>
            {PILLARS.map(p => {
              const val = texts[p.key]
              if (!val) return null
              return (
                <div key={p.key} className="mc-review-row">
                  <span className="mc-review-icon"><PillarIcon pillar={p.key} size={20} color="#C9A84C" /></span>
                  <div>
                    <p className="mc-review-label">{p.label}</p>
                    <p className="mc-review-text">{val}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="btn-primary mc-back-btn" onClick={() => navigate('dashboard')}>
            Back to Dashboard
          </button>
        </main>
      </div>
    )
  }

  // ── Commitment form ──────────────────────────────────────────────────
  return (
    <div className="app-shell" style={{ background: `linear-gradient(rgba(0,0,0,0.80), rgba(0,0,0,0.80)), url('/bg-morning.jpg') center / cover no-repeat` }}>
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
      <header className="top-bar">
        <button className="back-btn" onClick={() => navigate('dashboard')} aria-label="Back">
          ← Back
        </button>
        <div className="brand"><span className="brand-mark">✦</span></div>
      </header>

      <main className="main-content">
        <p className="mc-date">{todayLabel}</p>

        <div className="mc-identity">
          <p className="mc-identity-text">{identity}</p>
        </div>

        <p className="mc-subheading">Show up as who God made you.</p>

        <div className="mc-fields">
          {PILLARS.map(p => (
            <div key={p.key} className="mc-field">
              <div className="mc-field-header">
                <span className="mc-field-icon"><PillarIcon pillar={p.key} size={20} color="#C9A84C" /></span>
                <span className="mc-field-label">{p.label}</span>
              </div>
              <textarea
                className="mc-field-textarea"
                value={texts[p.key]}
                onChange={e => setTexts(prev => ({ ...prev, [p.key]: e.target.value }))}
                placeholder={HINTS[p.key][DOW]}
                rows={2}
              />
            </div>
          ))}
        </div>

        <button
          className="btn-primary mc-commit-btn"
          onClick={handleCommit}
          disabled={saving}
        >
          {saving ? 'Committing…' : 'I commit to this day.'}
        </button>
      </main>
    </div>
  )
}
