/**
 * EveningReflection — screen-by-screen evening flow.
 *
 * Step 0  : Opening ("The day is almost done.")
 * Steps 1-4 : One pillar at a time (Faith, Body, Mind, Stewardship)
 * Step 5  : Carry-forward textarea
 * Post-save phases: 'milestone' → 'full' | 'partial' | 'missed'
 *
 * Animation: key={step} on the INNER content div so React unmounts/remounts
 * it on every step change, re-triggering the fade-in.
 *
 * DB: daily_commits needs carry_forward text column.
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

// ── Daily rotating encouragement quotes (index = day of week, 0=Sun) ──
const QUOTES = {
  faith: [
    "Prayer is not preparation for the battle. It is the battle.",
    "The man who kneels before God can stand before anyone.",
    "Faith without discipline is just a feeling.",
    "Your morning with God sets the tone for everything that follows.",
    "Scripture is not content to consume. It's a mirror to look into.",
    "The quiet moments with God are where character is built.",
    "Showing up for God daily is how you become who He made you to be.",
  ],
  body: [
    "Your body is the instrument your purpose moves through. Keep it sharp.",
    "Discipline in the body builds discipline in everything else.",
    "The way you treat your body is a statement about what you believe.",
    "Hard days in the body build soft character. Push through.",
    "You don't have to feel like it. You just have to do it.",
    "The temple requires maintenance. Show up for it.",
    "Every rep, every mile, every healthy choice is an act of stewardship.",
  ],
  mind: [
    "What you feed your mind becomes what you see in the world.",
    "The disciplined mind is the most powerful weapon you own.",
    "Read. Think. Reflect. The man who stops learning stops growing.",
    "Protect your focus like it's your most valuable resource. It is.",
    "Gratitude is not weakness. It's the foundation of a clear mind.",
    "Remove what distracts. Add what sharpens.",
    "The battle is won or lost in the mind before it ever reaches the field.",
  ],
  stewardship: [
    "How you handle what you have determines what you'll be trusted with.",
    "Serving without an agenda is the highest form of leadership.",
    "Your responsibilities are not a burden. They are your calling.",
    "The faithful steward doesn't wait to be asked. He acts.",
    "Money, time, relationships — steward them all with intention.",
    "What you do with what God gave you is your answer to Him.",
    "Small faithfulness in daily things leads to great trust in eternal ones.",
  ],
}

const MILESTONE_COPY = {
  7:  { line1: '7 days.',   line2: 'A week of discipline.',    line3: 'You are not the same man.' },
  14: { line1: '14 days.',  line2: 'Two weeks.',               line3: 'The habit is forming.' },
  21: { line1: '21 days.',  line2: 'Three weeks.',             line3: 'This is becoming who you are.' },
  30: { line1: '30 days.',  line2: 'A month of showing up.',   line3: 'This is character.' },
}

// ── Cross image shared styles ─────────────────────────────────────────
// brightness(10) makes the dark PNG appear white-gold on a dark background.
const crossWalking = {
  width: 80, height: 80, display: 'block', objectFit: 'contain',
  marginBottom: 24,
  animation: 'walkForward 1.2s ease-in-out infinite',
}
const crossPulse = {
  width: 80, height: 80, display: 'block', objectFit: 'contain',
  marginBottom: 24,
  animation: 'standingPulse 2s ease-in-out infinite',
}
const crossHeavy = {
  width: 80, height: 80, display: 'block', objectFit: 'contain',
  marginBottom: 24,
  animation: 'heavyBow 3s ease-in-out infinite',
}
const crossMilestone = {
  width: 60, height: 60, display: 'block', objectFit: 'contain',
  marginBottom: 24,
  animation: 'walkForward 1.2s ease-in-out infinite',
}

const CSS = `
  @keyframes er-fade {
    from { opacity:0; transform:translateY(14px) }
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
  @keyframes er-grace-fade {
    0%   { opacity: 0; transform: translateY(6px) }
    20%  { opacity: 1; transform: translateY(0) }
    80%  { opacity: 1; transform: translateY(0) }
    100% { opacity: 0; transform: translateY(-4px) }
  }

  /* Full day — walking forward with gold glow */
  @keyframes walkForward {
    0%   { transform: translateX(0px) translateY(0px) rotate(0deg);
           filter: brightness(10) drop-shadow(0 0 4px #C9A84C); }
    25%  { transform: translateX(3px) translateY(-2px) rotate(2deg);
           filter: brightness(10) drop-shadow(0 0 12px #C9A84C); }
    50%  { transform: translateX(6px) translateY(0px) rotate(0deg);
           filter: brightness(10) drop-shadow(0 0 4px #C9A84C); }
    75%  { transform: translateX(3px) translateY(-2px) rotate(-2deg);
           filter: brightness(10) drop-shadow(0 0 12px #C9A84C); }
    100% { transform: translateX(0px) translateY(0px) rotate(0deg);
           filter: brightness(10) drop-shadow(0 0 4px #C9A84C); }
  }

  /* Partial day — standing still with gentle pulse */
  @keyframes standingPulse {
    0%   { transform: scale(1);
           filter: brightness(10) drop-shadow(0 0 4px #C9A84C); }
    50%  { transform: scale(1.05);
           filter: brightness(10) drop-shadow(0 0 12px #C9A84C); }
    100% { transform: scale(1);
           filter: brightness(10) drop-shadow(0 0 4px #C9A84C); }
  }

  /* Missed day — heavy/bowed with dim glow */
  @keyframes heavyBow {
    0%   { transform: rotate(0deg) translateY(0px);
           filter: brightness(5) drop-shadow(0 0 2px #888); }
    40%  { transform: rotate(-8deg) translateY(3px);
           filter: brightness(3) drop-shadow(0 0 0px #888); }
    60%  { transform: rotate(-8deg) translateY(3px);
           filter: brightness(3) drop-shadow(0 0 0px #888); }
    100% { transform: rotate(0deg) translateY(0px);
           filter: brightness(5) drop-shadow(0 0 2px #888); }
  }
`

const GOLD = '#C9A84C'
const BG   = '#0a0a0a'

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})
const DAY_INDEX = new Date().getDay() // 0 (Sun) – 6 (Sat)

// ── Shared styles ─────────────────────────────────────────────────────
const sScreen  = { position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column', zIndex: 100 }
const sOverlay = { ...sScreen, animation: 'er-fade 0.35s ease both' }
const sBottom  = { padding: '0 24px 100px', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }
const sBtnGold = { width: '100%', background: GOLD, border: 'none', borderRadius: 12, padding: '16px 0', color: '#000', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3 }
const sBtnDark = { width: '100%', background: 'transparent', border: `1px solid ${GOLD}`, borderRadius: 12, padding: '16px 0', color: '#888', fontSize: 16, fontWeight: 600, cursor: 'pointer' }
const sBtnBack = { background: 'none', border: 'none', color: '#555', fontSize: 15, cursor: 'pointer', padding: 0 }
const sCenter  = { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center', overflowY: 'auto' }

// ─────────────────────────────────────────────────────────────────────

export default function EveningReflection({ navigate, userId }) {
  const { commit, loading, saveEvening } = useDailyCommit(userId)
  const { updateStreakFromEvening }       = useStreak(userId)
  const { profile }                       = useAuth()

  const displayName = profile?.display_name || 'Builder'

  // ── Form state ──────────────────────────────────────────────────────
  const [step, setStep]             = useState(0)
  const [selections, setSelections] = useState({ faith: null, body: null, mind: null, stewardship: null })
  const [carryText, setCarry]       = useState('')
  const [saving, setSaving]         = useState(false)
  const [showGrace, setShowGrace]   = useState(false) // brief grace message after "I fell short"

  // ── Post-save state ─────────────────────────────────────────────────
  const [phase, setPhase]            = useState(null)
  const [milestoneDay, setMilestone] = useState(null)
  const [celebData, setCelebData]    = useState({ newStreak: 0, resultType: 'full' })
  const [dispStreak, setDispStreak]  = useState(0)

  // Reset grace message when step changes
  useEffect(() => { setShowGrace(false) }, [step])

  // Count-up animation for full celebration
  useEffect(() => {
    if (phase !== 'full') return
    setDispStreak(Math.max(0, celebData.newStreak - 1))
    const t = setTimeout(() => setDispStreak(celebData.newStreak), 350)
    return () => clearTimeout(t)
  }, [phase, celebData.newStreak])

  // ── Lock-in handler ──────────────────────────────────────────────────
  // Always call as () => handleLockIn() or () => handleLockIn('') —
  // never as onClick={handleLockIn} (that passes the SyntheticEvent).
  async function handleLockIn(carryOverride) {
    setSaving(true)
    const carry = carryOverride !== undefined ? carryOverride : carryText

    const finalConfirms = {}
    for (const p of PILLARS) {
      finalConfirms[p.key] = !!commit?.[`${p.key}_confirmed`] || selections[p.key] === true
    }
    const confirmedCount = Object.values(finalConfirms).filter(Boolean).length

    try {
      await saveEvening(finalConfirms, typeof carry === 'string' ? carry.trim() : '')
      const result = await updateStreakFromEvening(confirmedCount)

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
    } catch (err) {
      console.error('[FaithBuilt] handleLockIn error:', err)
    } finally {
      setSaving(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading) {
    return <div className="loader-screen"><div className="loader-icon">✦</div></div>
  }

  // ── Already completed ────────────────────────────────────────────────
  if (commit?.evening_done && !phase) {
    return (
      <div style={sOverlay}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <div style={{ fontSize: 52, color: GOLD, marginBottom: 24, animation: 'er-pulse 2s ease infinite' }}>✦</div>
          <h2 style={{ color: GOLD, fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>Day locked in.</h2>
          <p style={{ color: '#666', fontSize: 16, margin: 0 }}>You already closed the loop tonight. Rest well.</p>
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
      <div style={sOverlay}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <div style={{ fontSize: 48, marginBottom: 24 }}>◆</div>
          <h2 style={{ color: '#fff', fontSize: 26, fontWeight: 800, margin: '0 0 12px' }}>No morning commit found.</h2>
          <p style={{ color: '#666', fontSize: 16, margin: 0 }}>Start your day with a morning commitment first.</p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => navigate('checkin')}>Begin Your Morning</button>
        </div>
      </div>
    )
  }

  // ── Milestone screen — cross walking forward ─────────────────────────
  if (phase === 'milestone') {
    const m = MILESTONE_COPY[milestoneDay] ?? {}
    return (
      <div style={sOverlay}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <img src="/pickupyourcross.png" alt="Pick up your cross" style={crossMilestone} />
          <h1 style={{ color: GOLD, fontSize: 42, fontWeight: 900, margin: '0 0 14px' }}>{m.line1}</h1>
          <p style={{ color: '#aaa', fontSize: 18, margin: '0 0 6px' }}>{m.line2}</p>
          <p style={{ color: '#aaa', fontSize: 18, margin: 0 }}>{m.line3}</p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => setPhase(celebData.resultType)}>Keep going →</button>
        </div>
      </div>
    )
  }

  // ── Full day celebration — walking forward ───────────────────────────
  if (phase === 'full') {
    return (
      <div style={sOverlay}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <img
            src="/pickupyourcross.png"
            alt="Pick up your cross"
            style={crossWalking}
          />
          <span style={{
            fontSize: 96, fontWeight: 900, color: GOLD,
            lineHeight: 1, display: 'block', marginBottom: 8,
            transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.45s ease',
            transform: dispStreak >= celebData.newStreak ? 'scale(1)' : 'scale(0.6)',
            opacity:   dispStreak >= celebData.newStreak ? 1 : 0.3,
            animation: dispStreak >= celebData.newStreak ? 'er-glow 2s ease 0.5s infinite' : 'none',
          }}>
            {dispStreak}
          </span>
          <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>
            Day {celebData.newStreak}. Locked in.
          </p>
          <p style={{ color: '#888', fontSize: 16, margin: '0 0 4px' }}>You kept your word, {displayName}.</p>
          <p style={{ color: '#888', fontSize: 16, margin: 0 }}>That's who you are.</p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => navigate('dashboard')}>See my streak →</button>
        </div>
      </div>
    )
  }

  // ── Partial day celebration — standing still, gentle pulse ───────────
  if (phase === 'partial') {
    return (
      <div style={sOverlay}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <img
            src="/pickupyourcross.png"
            alt="Pick up your cross"
            style={crossPulse}
          />
          <h1 style={{ color: GOLD, fontSize: 36, fontWeight: 900, margin: '0 0 16px' }}>You showed up.</h1>
          <p style={{ color: '#aaa', fontSize: 18, margin: '0 0 6px' }}>3 out of 4.</p>
          <p style={{ color: '#aaa', fontSize: 18, margin: '0 0 6px' }}>Grace covers the rest.</p>
          <p style={{ color: '#666', fontSize: 16, margin: 0 }}>Tomorrow, give it all.</p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => navigate('dashboard')}>Tomorrow I go all in.</button>
        </div>
      </div>
    )
  }

  // ── Missed day — heavy/bowed ─────────────────────────────────────────
  if (phase === 'missed') {
    return (
      <div style={sOverlay}>
        <style>{CSS}</style>
        <div style={sCenter}>
          <img
            src="/pickupyourcross.png"
            alt="Pick up your cross"
            style={crossHeavy}
          />
          <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 900, margin: '0 0 16px' }}>Drift ends now.</h1>
          <p style={{ color: '#888', fontSize: 18, margin: '0 0 8px' }}>Tomorrow is Day 1 again.</p>
          <p style={{ color: '#888', fontSize: 16, margin: 0 }}>The man you're becoming doesn't stay down.</p>
        </div>
        <div style={sBottom}>
          <button style={sBtnGold} onClick={() => navigate('dashboard')}>I'll be back tomorrow.</button>
        </div>
      </div>
    )
  }

  // ── Step screens (0–5) ───────────────────────────────────────────────
  const pillar      = step >= 1 && step <= 4 ? PILLARS[step - 1] : null
  const commitment  = pillar ? (commit?.[`${pillar.key}_commitment`] ?? '') : ''
  const isConfirmed = pillar ? !!commit?.[`${pillar.key}_confirmed`]        : false
  const quote       = pillar ? QUOTES[pillar.key][DAY_INDEX]                : ''

  function advance() { setStep(s => Math.min(s + 1, 5)) }
  function goBack()  { setStep(s => Math.max(s - 1, 0)) }

  function handleFellShort(key) {
    setSelections(prev => ({ ...prev, [key]: false }))
    setShowGrace(true)
    // Grace message shows for 1.5s then auto-advances
    setTimeout(() => {
      setShowGrace(false)
      advance()
    }, 1500)
  }

  return (
    // Stable outer shell — never remounts on step change
    <div style={sScreen}>
      <style>{CSS}</style>

      {/* ── Header: back button + progress dots ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', flexShrink: 0, minHeight: 56,
      }}>
        <div style={{ minWidth: 48 }}>
          {step > 0 && (
            <button style={sBtnBack} onClick={goBack}>← Back</button>
          )}
        </div>

        {/* Progress dots for steps 1–4 */}
        {step >= 1 && step <= 4 && (
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            {PILLARS.map((_, i) => {
              const isCompleted = i + 1 < step
              const isCurrent   = i + 1 === step
              return (
                <div key={i} style={{
                  height: 8,
                  width: isCurrent ? 22 : 8,
                  borderRadius: 4,
                  background: isCompleted || isCurrent ? GOLD : '#2a2a2a',
                  opacity: isCompleted ? 0.55 : 1,
                  transition: 'width 0.3s ease, opacity 0.3s ease',
                }} />
              )
            })}
          </div>
        )}

        <div style={{ minWidth: 48 }} />
      </div>

      {/* ── Animated content — key={step} remounts on every step change ── */}
      <div
        key={step}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'er-fade 0.3s ease both', overflow: 'hidden' }}
      >

        {/* ═══════════════════════════════════════ */}
        {/* SCREEN 0 — Opening                    */}
        {/* ═══════════════════════════════════════ */}
        {step === 0 && (
          <div style={{ ...sCenter, paddingBottom: 120 }}>
            <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.35 }}>
              The day is almost done.
            </h1>
            <p style={{ color: '#666', fontSize: 16, margin: '0 0 14px', lineHeight: 1.65 }}>
              {displayName}, did you show up as<br />who you said you were?
            </p>
            <p style={{ color: GOLD, fontSize: 13, letterSpacing: 0.5, margin: '0 0 40px' }}>
              {todayLabel}
            </p>
            <button style={{ ...sBtnGold, maxWidth: 340 }} onClick={() => setStep(1)}>
              Let's find out →
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* SCREENS 1–4 — One pillar at a time    */}
        {/* ═══════════════════════════════════════ */}
        {step >= 1 && step <= 4 && pillar && (
          <div style={{ ...sCenter, paddingTop: 8, paddingBottom: 100 }}>

            {/* Pillar icon + name */}
            <div style={{ fontSize: 44, color: GOLD, marginBottom: 10 }}>{pillar.icon}</div>
            <h2 style={{ color: GOLD, fontSize: 36, fontWeight: 900, margin: '0 0 28px', letterSpacing: 1 }}>
              {pillar.label}
            </h2>

            {/* Commitment label */}
            <p style={{ color: '#555', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, margin: '0 0 10px' }}>
              This is what you committed to.
            </p>

            {/* Morning commitment text */}
            <p style={{ color: GOLD, fontSize: 18, fontStyle: 'italic', margin: '0 0 20px', lineHeight: 1.65, minHeight: 54, width: '100%' }}>
              {commitment
                ? <>"{commitment}"</>
                : <span style={{ color: '#444', fontStyle: 'normal', fontSize: 15 }}>No commitment recorded.</span>
              }
            </p>

            {/* Daily rotating encouragement quote */}
            <p style={{ color: GOLD, fontSize: 13, fontStyle: 'italic', margin: '0 0 28px', lineHeight: 1.55, opacity: 0.75 }}>
              {quote}
            </p>

            {/* Already confirmed — show ✓ + Continue button, no auto-advance */}
            {isConfirmed ? (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: 56, color: GOLD, marginBottom: 10, animation: 'er-pop 0.5s ease both' }}>✓</div>
                <p style={{ color: '#aaa', fontSize: 16, margin: '0 0 4px' }}>You confirmed this earlier.</p>
                <p style={{ color: GOLD, fontSize: 15, fontWeight: 600, margin: '0 0 28px' }}>Well done.</p>
                <button
                  style={{ ...sBtnDark, maxWidth: 200, margin: '0 auto', padding: '12px 0', fontSize: 15 }}
                  onClick={advance}
                >
                  Continue →
                </button>
              </div>
            ) : (
              /* Not confirmed — show up / fell short */
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <button
                  style={sBtnGold}
                  onClick={() => {
                    setSelections(prev => ({ ...prev, [pillar.key]: true }))
                    setTimeout(advance, 220)
                  }}
                >
                  I showed up
                </button>
                <button
                  style={sBtnDark}
                  disabled={showGrace}
                  onClick={() => handleFellShort(pillar.key)}
                >
                  I fell short
                </button>

                {/* Grace message — fades in for 1.5s then advances */}
                {showGrace && (
                  <p style={{
                    color: '#888', fontSize: 13, fontStyle: 'italic',
                    textAlign: 'center', margin: '4px 0 0',
                    animation: 'er-grace-fade 1.5s ease forwards',
                  }}>
                    Grace is real. Tomorrow you rise.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* SCREEN 5 — Carry forward              */}
        {/* ═══════════════════════════════════════ */}
        {step === 5 && (
          <>
            <div style={{ ...sCenter, justifyContent: 'flex-start', paddingTop: 32, alignItems: 'stretch', textAlign: 'left', overflowY: 'auto' }}>
              <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 10px', textAlign: 'center' }}>
                What are you carrying into tomorrow?
              </h2>
              <p style={{ color: '#666', fontSize: 16, margin: '0 0 28px', textAlign: 'center' }}>
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
                }}
                onFocus={e => { e.target.style.borderColor = GOLD }}
                onBlur={e  => { e.target.style.borderColor = '#2a2a2a' }}
              />
            </div>
            <div style={sBottom}>
              <button
                style={{ ...sBtnGold, opacity: saving ? 0.6 : 1 }}
                disabled={saving}
                onClick={() => handleLockIn()}
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

      </div>{/* end animated content */}
    </div>
  )
}
