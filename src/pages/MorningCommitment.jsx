import { useState, useEffect, useRef } from 'react'
import { useCommitment } from '../hooks/useCommitment'
import { useStreak } from '../hooks/useStreak'

// One verse per day of week (0 = Sunday … 6 = Saturday)
const DAILY_VERSES = [
  { text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', ref: 'Proverbs 3:5\u20136' },
  { text: 'Do not merely listen to the word, and so deceive yourselves. Do what it says.', ref: 'James 1:22' },
  { text: 'No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace for those who have been trained by it.', ref: 'Hebrews 12:11' },
  { text: 'Whoever walks in integrity walks securely, but whoever takes crooked paths will be found out.', ref: 'Proverbs 10:9' },
  { text: 'Each one should carry their own load.', ref: 'Galatians 6:5' },
  { text: 'Be very careful, then, how you live \u2014 not as unwise but as wise, making the most of every opportunity, because the days are evil.', ref: 'Ephesians 5:15\u201316' },
  { text: 'As iron sharpens iron, so one person sharpens another.', ref: 'Proverbs 27:17' },
]

const PILLAR_FIELDS = [
  {
    key: 'faith',
    label: 'Faith',
    icon: '\u2726',
    placeholder: 'pray before I pick up my phone and open Scripture for 20 minutes.',
  },
  {
    key: 'body',
    label: 'Body',
    icon: '\u26A1',
    placeholder: 'move my body for 30 minutes and fuel it with intention.',
  },
  {
    key: 'mind',
    label: 'Mind',
    icon: '\u25C8',
    placeholder: 'read 20 pages and remove one distraction from my environment.',
  },
  {
    key: 'stewardship',
    label: 'Stewardship',
    icon: '\u25C6',
    placeholder: 'review my finances and serve someone without an agenda.',
  },
]

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})
const todayVerse = DAILY_VERSES[new Date().getDay()]

export default function MorningCommitment({ navigate, userId, identityStatement, onAllComplete }) {
  const { commitment, committed, loading, saveCommitment } = useCommitment(userId)
  const { streak, updateStreak } = useStreak(userId)
  const [texts, setTexts] = useState({ faith: '', body: '', mind: '', stewardship: '' })
  const [phase, setPhase] = useState('form')  // 'form' | 'celebrating'
  const [saving, setSaving] = useState(false)
  const firedRef = useRef(false)

  const identity = identityStatement || 'I am a man of faith, discipline, and character.'

  // If already committed today, pre-fill and jump to celebration view
  useEffect(() => {
    if (!loading && committed && commitment) {
      setTexts({
        faith:       commitment.faith_text       ?? '',
        body:        commitment.body_text        ?? '',
        mind:        commitment.mind_text        ?? '',
        stewardship: commitment.stewardship_text ?? '',
      })
      setPhase('celebrating')
    }
  }, [loading, committed]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCommit() {
    setSaving(true)
    await saveCommitment(texts)
    await updateStreak(true)
    if (!firedRef.current) {
      firedRef.current = true
      onAllComplete?.()
    }
    setSaving(false)
    setPhase('celebrating')
  }

  if (loading) {
    return <div className="loader-screen"><div className="loader-icon">✦</div></div>
  }

  // ── Celebration / review state ──────────────────────────────────────
  if (phase === 'celebrating') {
    return (
      <div className="mc-celebrate">
        <div className="mc-celebrate-top">
          <div className="mc-celebrate-mark">✦</div>
          <p className="mc-celebrate-heading">Committed.</p>
          <p className="mc-celebrate-sub">Show up as who God made you.</p>

          {streak.current_streak > 0 && (
            <div className="mc-celebrate-streak">
              <span>🔥</span>
              <span className="mc-streak-num">{streak.current_streak}</span>
              <span className="mc-streak-label">day streak</span>
            </div>
          )}
        </div>

        {/* Today's verse */}
        <div className="mc-verse-card">
          <p className="mc-verse-text">&ldquo;{todayVerse.text}&rdquo;</p>
          <p className="mc-verse-ref">&mdash; {todayVerse.ref}</p>
        </div>

        {/* Review of commitments */}
        <div className="mc-review">
          <p className="mc-review-heading">Your commitments for today</p>
          {PILLAR_FIELDS.map(p => {
            const val = texts[p.key]
            if (!val) return null
            return (
              <div key={p.key} className="mc-review-row">
                <span className="mc-review-icon">{p.icon}</span>
                <div>
                  <p className="mc-review-label">{p.label}</p>
                  <p className="mc-review-text">Today I will {val}</p>
                </div>
              </div>
            )
          })}
        </div>

        <button className="btn-primary mc-back-btn" onClick={() => navigate('dashboard')}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  // ── Commitment form ─────────────────────────────────────────────────
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

        {/* Identity statement */}
        <div className="mc-identity">
          <p className="mc-identity-text">{identity}</p>
        </div>

        <p className="mc-subheading">Show up as who God made you.</p>

        {/* 4 commitment fields */}
        <div className="mc-fields">
          {PILLAR_FIELDS.map(p => (
            <div key={p.key} className="mc-field">
              <div className="mc-field-header">
                <span className="mc-field-icon">{p.icon}</span>
                <span className="mc-field-label">{p.label}</span>
              </div>
              <textarea
                className="mc-field-textarea"
                value={texts[p.key]}
                onChange={e => setTexts(prev => ({ ...prev, [p.key]: e.target.value }))}
                placeholder={`Today I will ${p.placeholder}`}
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
          {saving ? 'Committing\u2026' : 'I commit to this day.'}
        </button>
      </main>
    </div>
  )
}
