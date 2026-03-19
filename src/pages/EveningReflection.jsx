import { useState } from 'react'
import { useEveningReflection } from '../hooks/useEveningReflection'
import { useCommitment } from '../hooks/useCommitment'

const PILLAR_META = [
  { key: 'faith_text',       icon: '\u2726', label: 'Faith' },
  { key: 'body_text',        icon: '\u26A1', label: 'Body' },
  { key: 'mind_text',        icon: '\u25C8', label: 'Mind' },
  { key: 'stewardship_text', icon: '\u25C6', label: 'Stewardship' },
]

const SHOWED_UP_OPTIONS = [
  { key: 'yes',      label: 'Yes \u2014 fully',         icon: '\u2726' },
  { key: 'mostly',   label: 'Mostly \u2014 I\'ll build on it', icon: '\u25C8' },
  { key: 'tomorrow', label: 'Tomorrow I rise.',          icon: '\u25C6' },
]

export default function EveningReflection({ navigate, userId }) {
  const { reflection, reflected, saveReflection } = useEveningReflection(userId)
  const { commitment } = useCommitment(userId)
  const [journal,  setJournal]  = useState(reflection?.journal_text ?? '')
  const [showedUp, setShowedUp] = useState(reflection?.showed_up   ?? null)
  const [saved,    setSaved]    = useState(reflected)
  const [saving,   setSaving]   = useState(false)

  async function handleSave() {
    if (!showedUp) return
    setSaving(true)
    await saveReflection({ journalText: journal, showedUp })
    setSaving(false)
    setSaved(true)
  }

  if (saved) {
    return (
      <div className="app-shell">
        <header className="top-bar">
          <div className="brand">
            <span className="brand-mark">✦</span>
            <span className="brand-name">Evening</span>
          </div>
        </header>
        <main className="main-content">
          <div className="evening-saved">
            <div className="evening-saved-mark">✦</div>
            <h2 className="evening-saved-title">Reflection saved.</h2>
            <p className="evening-saved-sub">
              {showedUp === 'yes'
                ? 'You showed up. That matters more than you know.'
                : showedUp === 'mostly'
                ? "You built something today. Growth lives in the gap. Keep going."
                : "Grace lives here. Rest. Rise tomorrow stronger."}
            </p>
            <button className="btn-primary" onClick={() => navigate('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    )
  }

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
        <h2 className="evening-heading">Who showed up today?</h2>
        <p className="evening-sub">
          Hold the mirror. Did you become who you committed to be this morning?
        </p>

        {/* This morning's commitments */}
        {commitment && (
          <div className="evening-commitments">
            <p className="evening-section-label">This morning you committed to:</p>
            {PILLAR_META.map(p => {
              const val = commitment[p.key]
              if (!val) return null
              return (
                <div key={p.key} className="evening-commit-row">
                  <span className="evening-commit-icon">{p.icon}</span>
                  <p className="evening-commit-text">Today I will {val}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Free-write journal */}
        <div className="evening-journal-wrap">
          <p className="evening-section-label">What did today reveal about you?</p>
          <textarea
            className="evening-textarea"
            value={journal}
            onChange={e => setJournal(e.target.value)}
            placeholder="Write freely. This is yours alone."
            rows={5}
          />
        </div>

        {/* Did you show up? */}
        <div className="evening-showed-up">
          <p className="evening-section-label">Did you show up today?</p>
          <div className="showed-up-options">
            {SHOWED_UP_OPTIONS.map(opt => (
              <button
                key={opt.key}
                className={`showed-up-btn${showedUp === opt.key ? ' showed-up-btn--active' : ''}`}
                onClick={() => setShowedUp(opt.key)}
              >
                <span className="showed-up-icon">{opt.icon}</span>
                <span className="showed-up-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={!showedUp || saving}
        >
          {saving ? 'Saving\u2026' : 'Save Reflection'}
        </button>
      </main>
    </div>
  )
}
