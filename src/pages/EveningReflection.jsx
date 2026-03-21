/**
 * EveningReflection — screen-by-screen evening flow.
 *
 * Step 0  : Opening
 * Steps 1-4 : One pillar at a time (Faith, Body, Mind, Stewardship)
 * Step 5  : Carry-forward textarea
 * Post-save phases: 'milestone' → 'full' | 'partial' | 'missed'
 *
 * DB note: daily_commits needs a carry_forward text column.
 *   ALTER TABLE daily_commits ADD COLUMN IF NOT EXISTS carry_forward text;
 */
import { useState, useEffect } from 'react'
import { useDailyCommit } from '../hooks/useDailyCommit'
import { useStreak }      from '../hooks/useStreak'
import { useAuth }        from '../hooks/useAuth'

const PILLARS = [
  { key: 'faith',       icon: '✦', label: 'Faith' },
  { key: 'body',        icon: '⚡', label: 'Body' },
  { key: 'mind',        icon: '◈', label: 'Mind' },
  { key: 'stewardship', icon: '◆', label: 'Stewardship' },
]

const MILESTONE_COPY = {
  7:  { icon: '🔥', line1: '7 days.',   line2: 'A week of discipline.',    line3: 'You are not the same man.' },
  14: { icon: '⚡', line1: '14 days.',  line2: 'Two weeks.',               line3: 'The habit is forming.' },
  21: { icon: '◆', line1: '21 days.',  line2: 'Three weeks.',             line3: 'This is becoming who you are.' },
  30: { icon: '✦', line1: '30 days.',  line2: 'A month of showing up.',   line3: 'This is character.' },
}

const CSS = `
  @keyframes er-fade {
    from { opacity:0; transform:translateY(12px) }
    to   { opacity:1; transform:translateY(0) }
  }
  @keyframes er-pulse {
    0%,100% { transform:scale(1) }
    50%     { transform:scale(1.1) }
  }
  @keyframes er-pop {
    0%   { transform:scale(0.5); opacity:0 }
    70%  { transform:scale(1.1) }
    100% { transform:scale(1);   opacity:1 }
  }
  @keyframes er-glow {
    0%,100% { text-shadow: 0 0 0 transparent }
    50%     { text-shadow: 0 0 32px rgba(201,168,76,0.75) }
  }
`

const GOLD = '#C9A84C'
const BG   = '#0a0a0a'

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

// ── Shared style objects ──────────────────────────────────────────────
const sScreen = {
  position: 'fixed', inset: 0,
  background: BG,
  display: 'flex', flexDirection: 'column',
  zIndex: 100,
}
const sCenter = {
  flex: 1,
  display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  padding: '0 32px', textAlign: 'center',
  overflowY: 'auto',
}
const sBottom = {
  padding: '0 24px 48px',
  display: 'flex', flexDirection: 'column',
  gap: 12,
  flexShrink: 0,
}
const sBtnGold = {
  width: '100%', background: GOLD, border: 'none',
  borderRadius: 12, padding: '16px 0',
  color: '#000', fontSize: 16, fontWeight: 700,
  cursor: 'pointer', letterSpacing: 0.3,
}
const sBtnDark = {
  width: '100%', background: 'transparent',
  border: `1px solid ${GOLD}`,
  borderRadius: 12, padding: '16px 0',
  color: '#888', fontSize: 16, fontWeight: 600,
  cursor: 'pointer',
}
const sBtnBack = {
  background: 'none', border: 'none',
  color: '#555', fontSize: 15,
  cursor: 'pointer', padding: 0,
}

// ─────────────────────────────────────────────────────────────────────

export default function EveningReflection({ navigate, userId }) {
  const { commit, loading, saveEvening } = useDailyCommit(userId)
  const { updateStreakFromEvening }       = useStreak(userId)
  const { profile }                       = useAuth()

  const displayName = profile?.display_name || 'Builder'

  // ── Form state ──────────────────────────────────────────────────────
  const [step, setStep]             = useState(0)
  const [selections, setSelections] = useState({
    faith: null, body: null, mind: null, stewardship: null,
  })
  const [carryText, setCarry] = useState('')
  const [saving, setSaving]   = useState(false)

  // ── Post-save state ─────────────────────────────────────────────────
  const [phase, setPhase]           = useState(null) // 'milestone'|'full'|'partial'|'missed'
  const [milestoneDay, setMilestone] = useState(null)
  const [celebData, setCelebData]   = useState({ newStreak: 0, resultType: 'full' })
  const [dispStreak, setDispStreak] = useState(0)   // animated streak number

  // ── Auto-advance already-confirmed pillars after 2 s ────────────────
  useEffect(() => {
    if (step < 1 || step > 4 || !commit) return
    const p = PILLARS[step - 1]
    if (commit[`${p.key}_confirmed`]) {
      const t = setTimeout(() => setStep(s => s + 1), 2000)
      return () => clearTimeout(t)
    }
  }, [step, commit])

  // ── Count-up animation for full celebration ──────────────────────────
  useEffect(() => {
    if (phase !== 'full') return
    setDispStreak(Math.max(0, celebData.newStreak - 1))
    const t = setTimeout(() => setDispStreak(celebData.newStreak), 350)
    return () => clearTimeout(t)
  }, [phase, celebData.newStreak])

  // ── Lock-in handler ──────────────────────────────────────────────────
  async function handleLockIn(carryOverride) {
    setSaving(true)
    const carry = carryOverride !== undefined ? carryOverride : carryText

    const finalConfirms = {}
    for (const p of PILLARS) {
      finalConfirms[p.key] = !!commit[`${p.key}_confirmed`] || selections[p.key] === true
    }
    const confirmedCount = Object.values(finalConfirms).filter(Boolean).length

    await saveEvening(finalConfirms, carry.trim())
    const result = await updateStreakFromEvening(confirmedCount)
    setSaving(false)

    const resultType  = result?.resultType  ?? (confirmedCount >= 4 ? 'full' : confirmedCount === 3 ? 'partial' : 'missed')
    const newStreak   = result?.newStreak   ?? 0
    const isMilestone = result?.isMilestone ?? false

    setCelebData({ newStreak, resultType })

    if (isMilestone && MILESTONE_COPY[newStreak]) {
      setMilestone(newStreak)
      setPhase('milestone')
    } else {
      setPhase(resultType)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return <div className="loader-screen"><div className="loader-icon">✦</div></div>
  }

  // ── Already completed ────────────────────────────────────────────────
  if (commit?.evening_done && !phase) {
    return (
      <div key="already-done" style={sScreen}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <div style={{ fontSize: 52, color: GOLD, marginBottom: 24, animation: 'er-pulse 2s ease infinite' }}>✦</div>
          <h2 style={{ color: GOLD, fontSize: 28, fontWeight: 800, margin: '0 0 12px', animation: 'er-fade 0.4s ease both' }}>
            Day locked in.
          </h2>
          <p style={{ color: '#666', fontSize: 16, margin: '0 0 48px', animation: 'er-fade 0.4s ease 0.1s both' }}>
            You already closed the loop tonight. Rest well.
          </p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => navigate('dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  // ── No morning commit ────────────────────────────────────────────────
  if (!commit?.morning_done && !phase) {
    return (
      <div key="no-morning" style={sScreen}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>◆</div>
          <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 12px', animation: 'er-fade 0.4s ease both' }}>
            No morning commit found.
          </h2>
          <p style={{ color: '#666', fontSize: 16, margin: '0 0 48px', animation: 'er-fade 0.4s ease 0.1s both' }}>
            Start your day with a morning commitment first.
          </p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => navigate('checkin')}>Begin Your Morning</button>
        </div>
      </div>
    )
  }

  // ── Milestone screen ─────────────────────────────────────────────────
  if (phase === 'milestone') {
    const m = MILESTONE_COPY[milestoneDay] ?? {}
    return (
      <div key="milestone" style={sScreen}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <div style={{ fontSize: 80, marginBottom: 24, animation: 'er-pulse 1.5s ease infinite' }}>{m.icon}</div>
          <h1 style={{ color: GOLD, fontSize: 42, fontWeight: 900, margin: '0 0 14px', animation: 'er-fade 0.5s ease both' }}>
            {m.line1}
          </h1>
          <p style={{ color: '#aaa', fontSize: 18, margin: '0 0 6px', animation: 'er-fade 0.5s ease 0.1s both' }}>
            {m.line2}
          </p>
          <p style={{ color: '#aaa', fontSize: 18, margin: '0 0 0', animation: 'er-fade 0.5s ease 0.2s both' }}>
            {m.line3}
          </p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => setPhase(celebData.resultType)}>Keep going →</button>
        </div>
      </div>
    )
  }

  // ── Full day celebration ─────────────────────────────────────────────
  if (phase === 'full') {
    return (
      <div key="full" style={sScreen}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <span style={{
            fontSize: 96, fontWeight: 900, color: GOLD,
            lineHeight: 1, display: 'block', marginBottom: 8,
            transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease',
            transform:  dispStreak >= celebData.newStreak ? 'scale(1)' : 'scale(0.6)',
            opacity:    dispStreak >= celebData.newStreak ? 1 : 0.3,
            animation:  dispStreak >= celebData.newStreak ? 'er-glow 2s ease 0.5s infinite' : 'none',
          }}>
            {dispStreak}
          </span>
          <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 10px', animation: 'er-fade 0.4s ease 0.35s both' }}>
            Day {celebData.newStreak}. Locked in.
          </p>
          <p style={{ color: '#888', fontSize: 16, margin: '0 0 4px', animation: 'er-fade 0.4s ease 0.5s both' }}>
            You kept your word, {displayName}.
          </p>
          <p style={{ color: '#888', fontSize: 16, margin: 0, animation: 'er-fade 0.4s ease 0.6s both' }}>
            That's who you are.
          </p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => navigate('dashboard')}>See my streak →</button>
        </div>
      </div>
    )
  }

  // ── Partial day celebration ──────────────────────────────────────────
  if (phase === 'partial') {
    return (
      <div key="partial" style={sScreen}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <div style={{ fontSize: 64, marginBottom: 20, animation: 'er-pop 0.5s ease both' }}>◆</div>
          <h1 style={{ color: GOLD, fontSize: 36, fontWeight: 900, margin: '0 0 16px', animation: 'er-fade 0.4s ease 0.1s both' }}>
            You showed up.
          </h1>
          <p style={{ color: '#aaa', fontSize: 18, margin: '0 0 6px', animation: 'er-fade 0.4s ease 0.2s both' }}>3 out of 4.</p>
          <p style={{ color: '#aaa', fontSize: 18, margin: '0 0 6px', animation: 'er-fade 0.4s ease 0.3s both' }}>Grace covers the rest.</p>
          <p style={{ color: '#666', fontSize: 16, margin: 0,        animation: 'er-fade 0.4s ease 0.4s both' }}>Tomorrow, give it all.</p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => navigate('dashboard')}>Tomorrow I go all in.</button>
        </div>
      </div>
    )
  }

  // ── Missed day ───────────────────────────────────────────────────────
  if (phase === 'missed') {
    return (
      <div key="missed" style={sScreen}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <div style={{ fontSize: 64, marginBottom: 20, animation: 'er-pop 0.5s ease both' }}>◈</div>
          <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 900, margin: '0 0 16px', animation: 'er-fade 0.4s ease 0.1s both' }}>
            Drift ends now.
          </h1>
          <p style={{ color: '#888', fontSize: 18, margin: '0 0 8px', animation: 'er-fade 0.4s ease 0.2s both' }}>
            Tomorrow is Day 1 again.
          </p>
          <p style={{ color: '#888', fontSize: 16, margin: 0, animation: 'er-fade 0.4s ease 0.3s both' }}>
            The man you're becoming doesn't stay down.
          </p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => navigate('dashboard')}>I'll be back tomorrow.</button>
        </div>
      </div>
    )
  }

  // ── Step-based screens ───────────────────────────────────────────────
  // Derive current-pillar data for steps 1–4
  const pillar      = step >= 1 && step <= 4 ? PILLARS[step - 1] : null
  const commitment  = pillar ? (commit?.[`${pillar.key}_commitment`] ?? '') : ''
  const isConfirmed = pillar ? !!commit?.[`${pillar.key}_confirmed`]        : false
  const sel         = pillar ? selections[pillar.key]                        : null

  function advance() { setStep(s => Math.min(s + 1, 5)) }
  function goBack()  { setStep(s => Math.max(s - 1, 0)) }

  return (
    <div key={step} style={sScreen}>
      <style>{CSS}</style>

      {/* ── Header: back + progress ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '16px 20px', flexShrink: 0,
        position: 'relative', minHeight: 52,
      }}>
        {step > 0 && (
          <button style={sBtnBack} onClick={goBack}>← Back</button>
        )}
        {step >= 1 && step <= 4 && (
          <span style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            color: '#555', fontSize: 13,
          }}>
            {step} of 4
          </span>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 0 — Opening                                           */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {step === 0 && (
        <>
          <div style={sCenter}>
            <h1 style={{
              color: '#fff', fontSize: 28, fontWeight: 800,
              margin: '0 0 16px', lineHeight: 1.35,
              animation: 'er-fade 0.4s ease both',
            }}>
              The day is almost done.
            </h1>
            <p style={{
              color: '#666', fontSize: 16,
              margin: '0 0 14px', lineHeight: 1.65,
              animation: 'er-fade 0.4s ease 0.1s both',
            }}>
              {displayName}, did you show up as<br />who you said you were?
            </p>
            <p style={{
              color: GOLD, fontSize: 13, letterSpacing: 0.5,
              margin: 0,
              animation: 'er-fade 0.4s ease 0.2s both',
            }}>
              {todayLabel}
            </p>
          </div>
          <div style={sBottom}>
            <button style={sBtnGold} onClick={() => setStep(1)}>
              Let's find out →
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREENS 1–4 — Pillar review                                  */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {step >= 1 && step <= 4 && pillar && (
        <div style={{ ...sCenter, paddingTop: 16, paddingBottom: 24 }}>
          {/* Icon + name */}
          <div style={{ fontSize: 40, color: GOLD, marginBottom: 10, animation: 'er-fade 0.3s ease both' }}>
            {pillar.icon}
          </div>
          <h2 style={{
            color: GOLD, fontSize: 34, fontWeight: 900,
            margin: '0 0 32px', letterSpacing: 1,
            animation: 'er-fade 0.3s ease 0.05s both',
          }}>
            {pillar.label}
          </h2>

          {/* Commitment text */}
          <p style={{
            color: '#555', fontSize: 12,
            textTransform: 'uppercase', letterSpacing: 1.5,
            margin: '0 0 10px',
            animation: 'er-fade 0.3s ease 0.1s both',
          }}>
            This is what you committed to.
          </p>
          <p style={{
            color: GOLD, fontSize: 18, fontStyle: 'italic',
            margin: '0 0 36px', lineHeight: 1.65, minHeight: 54,
            animation: 'er-fade 0.3s ease 0.15s both',
          }}>
            {commitment
              ? <>"{commitment}"</>
              : <span style={{ color: '#444', fontStyle: 'normal', fontSize: 15 }}>No commitment recorded.</span>
            }
          </p>

          {/* Already confirmed — auto-advances; also shows Continue */}
          {isConfirmed ? (
            <div style={{ animation: 'er-fade 0.4s ease 0.2s both' }}>
              <div style={{ fontSize: 52, color: GOLD, marginBottom: 12, animation: 'er-pop 0.5s ease both' }}>✓</div>
              <p style={{ color: '#aaa', fontSize: 16, margin: '0 0 6px' }}>
                You confirmed this earlier.
              </p>
              <p style={{ color: GOLD, fontSize: 15, fontWeight: 600, margin: '0 0 28px' }}>
                Well done.
              </p>
              <button
                style={{ ...sBtnDark, maxWidth: 200, padding: '12px 0', fontSize: 15 }}
                onClick={advance}
              >
                Continue →
              </button>
            </div>
          ) : (
            /* Not yet confirmed — show I showed up / I fell short */
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, animation: 'er-fade 0.3s ease 0.2s both' }}>
              <button
                style={{ ...sBtnGold, background: sel === true ? '#e0b84e' : GOLD }}
                onClick={() => {
                  setSelections(prev => ({ ...prev, [pillar.key]: true }))
                  setTimeout(advance, 220)
                }}
              >
                I showed up
              </button>
              <button
                style={sBtnDark}
                onClick={() => {
                  setSelections(prev => ({ ...prev, [pillar.key]: false }))
                  setTimeout(advance, 220)
                }}
              >
                I fell short
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* SCREEN 5 — Carry forward                                     */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {step === 5 && (
        <>
          <div style={{
            ...sCenter,
            justifyContent: 'flex-start',
            paddingTop: 32,
            alignItems: 'stretch',
            textAlign: 'left',
          }}>
            <h2 style={{
              color: '#fff', fontSize: 24, fontWeight: 800,
              margin: '0 0 10px', textAlign: 'center',
              animation: 'er-fade 0.35s ease both',
            }}>
              What are you carrying into tomorrow?
            </h2>
            <p style={{
              color: '#666', fontSize: 16,
              margin: '0 0 28px', textAlign: 'center',
              animation: 'er-fade 0.35s ease 0.1s both',
            }}>
              A win, a lesson, or a word.
            </p>
            <textarea
              value={carryText}
              onChange={e => setCarry(e.target.value)}
              rows={6}
              placeholder="Something God showed me today..."
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#111', color: '#e0e0e0',
                border: '1.5px solid #2a2a2a',
                borderRadius: 12, padding: '14px 16px',
                fontSize: 16, lineHeight: 1.6,
                resize: 'none', outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s ease',
                animation: 'er-fade 0.35s ease 0.15s both',
              }}
              onFocus={e => { e.target.style.borderColor = GOLD }}
              onBlur={e  => { e.target.style.borderColor = '#2a2a2a' }}
            />
          </div>
          <div style={sBottom}>
            <button
              style={{ ...sBtnGold, opacity: saving ? 0.6 : 1 }}
              disabled={saving}
              onClick={handleLockIn}
            >
              {saving ? 'Locking in…' : 'Lock in today.'}
            </button>
            <button
              style={{ ...sBtnDark, fontSize: 14, padding: '12px 0', color: '#555', border: 'none' }}
              disabled={saving}
              onClick={() => handleLockIn('')}
            >
              Skip
            </button>
          </div>
        </>
      )}
    </div>
  )
}
