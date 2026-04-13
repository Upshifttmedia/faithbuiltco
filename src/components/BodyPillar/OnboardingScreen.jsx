/**
 * BodyPillar/OnboardingScreen
 *
 * Three-screen onboarding sequence:
 *   1. Track — how do you train?
 *   2. Split — weekly structure
 *   3. Gym mode — (gym track only) library vs custom log
 *
 * Calls saveOnboarding(track, gymMode, split) then onComplete().
 */
import { useState } from 'react'

const GOLD  = '#C9A84C'
const BC    = "'Barlow Condensed', sans-serif"
const SERIF = "'Georgia', 'Times New Roman', serif"
const BONE  = '#E8E0D4'
const CARD  = '#161616'
const DIM   = '#666'

const CSS = `
  @keyframes body-slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

// ── Data ─────────────────────────────────────────────────────────────────────

const TRACKS = [
  { value: 'bodyweight', emoji: '🏠', label: 'Bodyweight', body: 'Home, hotel, anywhere. No equipment needed.' },
  { value: 'outdoor',    emoji: '🌲', label: 'Outdoor / Calisthenics', body: 'Parks, trails, and pull-up bars.' },
  { value: 'gym',        emoji: '🏋️', label: 'Gym', body: 'You lift weights. We program around it.' },
]

const SPLITS = [
  { value: 'ppl',         label: 'Push / Pull / Legs', body: 'Six days of structure. One day to breathe.' },
  { value: 'upper_lower', label: 'Upper / Lower',       body: 'Four days. High frequency on every muscle group.' },
  { value: 'full_body',   label: 'Full Body',           body: 'Three focused sessions each week.' },
  { value: 'daily',       label: 'Daily Focus',         body: "Each day we pick the work. You just show up." },
]

const GYM_MODES = [
  { value: 'library', label: 'Browse workout library', body: "We suggest today's session. You execute it." },
  { value: 'custom',  label: 'Log your own',           body: 'You have a program. We help you track it.' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingScreen({ saveOnboarding, onComplete, onCancel }) {
  const [step,    setStep]    = useState(1)   // 1 | 2 | 3
  const [track,   setTrack]   = useState(null)
  const [split,   setSplit]   = useState(null)
  const [gymMode, setGymMode] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState(null)

  const totalSteps = track === 'gym' ? 3 : 2

  async function handleNext() {
    if (step === 1) {
      if (!track) return
      setStep(2)
    } else if (step === 2) {
      if (!split) return
      if (track === 'gym') {
        setStep(3)
      } else {
        await submit('library')
      }
    } else if (step === 3) {
      if (!gymMode) return
      await submit(gymMode)
    }
  }

  async function submit(mode) {
    setSaving(true)
    setError(null)
    const { error: err } = await saveOnboarding(track, mode, split)
    setSaving(false)
    if (err) { setError('Something went wrong. Try again.'); return }
    onComplete()
  }

  function handleBack() {
    if (step === 1) { onCancel(); return }
    setStep(s => s - 1)
  }

  // Derive current selection and can-proceed
  const canProceed =
    (step === 1 && !!track) ||
    (step === 2 && !!split) ||
    (step === 3 && !!gymMode)

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0D0D0D',
      zIndex: 110,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 'max(48px, env(safe-area-inset-top))',
        paddingLeft: 20, paddingRight: 20, paddingBottom: 0,
        flexShrink: 0,
      }}>
        <button
          onClick={handleBack}
          style={{
            background: 'none', border: 'none',
            color: DIM, fontSize: 22, cursor: 'pointer', padding: '4px 8px',
            lineHeight: 1,
          }}
        >
          {step === 1 ? '✕' : '←'}
        </button>
        <p style={{
          fontFamily: BC, fontWeight: 700, fontSize: 11,
          letterSpacing: '4px', color: GOLD, textTransform: 'uppercase',
          margin: 0,
        }}>
          Body Pillar
        </p>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 5, paddingRight: 4 }}>
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i < step ? GOLD : '#2a2a2a',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '32px 24px 48px',
        display: 'flex', flexDirection: 'column',
        animation: 'body-slide-up 0.3s ease',
        maxWidth: 480, width: '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>

        {/* ── Step 1: Track ──────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <h2 style={headingStyle}>How do you<br />train?</h2>
            <p style={subStyle}>Pick the environment that fits your life right now.</p>
            {TRACKS.map(t => (
              <OptionCard
                key={t.value}
                active={track === t.value}
                onSelect={() => setTrack(t.value)}
                emoji={t.emoji}
                label={t.label}
                body={t.body}
              />
            ))}
          </>
        )}

        {/* ── Step 2: Split ──────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <h2 style={headingStyle}>What's your<br />weekly structure?</h2>
            <p style={subStyle}>
              {track === 'outdoor'
                ? "We'll map your outdoor sessions around this rhythm."
                : 'Choose a split that matches your schedule.'}
            </p>
            {SPLITS.map(s => (
              <OptionCard
                key={s.value}
                active={split === s.value}
                onSelect={() => setSplit(s.value)}
                label={s.label}
                body={s.body}
              />
            ))}
          </>
        )}

        {/* ── Step 3: Gym mode (gym only) ────────────────────────────── */}
        {step === 3 && (
          <>
            <h2 style={headingStyle}>How do you want<br />to use this?</h2>
            <p style={subStyle}>
              We can program your sessions, or stay out of your way and just
              help you track.
            </p>
            {GYM_MODES.map(m => (
              <OptionCard
                key={m.value}
                active={gymMode === m.value}
                onSelect={() => setGymMode(m.value)}
                label={m.label}
                body={m.body}
              />
            ))}
          </>
        )}

        {error && (
          <p style={{ color: '#e05252', fontSize: 13, textAlign: 'center', margin: '0 0 16px' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleNext}
          disabled={!canProceed || saving}
          style={{
            width: '100%',
            padding: '18px 0',
            background: canProceed && !saving ? GOLD : 'rgba(201,168,76,0.22)',
            border: 'none', borderRadius: 0,
            color: '#000',
            fontFamily: BC, fontWeight: 700, fontSize: 17,
            letterSpacing: '2px', textTransform: 'uppercase',
            cursor: canProceed && !saving ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s',
            marginTop: 8,
          }}
        >
          {saving ? 'Saving…' : step < totalSteps ? 'Next →' : 'Begin →'}
        </button>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OptionCard({ active, onSelect, emoji, label, body }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background:   active ? 'rgba(13,31,15,0.6)' : CARD,
        border:       `1px solid ${active ? GOLD : '#2a2a2a'}`,
        borderLeft:   `3px solid ${active ? GOLD : '#2a2a2a'}`,
        borderRadius: 0,
        padding:      '16px',
        marginBottom: 10,
        cursor:       'pointer',
        transition:   'border-color 0.2s, background 0.2s',
        display:      'flex',
        alignItems:   'flex-start',
        gap:          12,
      }}
    >
      {emoji && (
        <span style={{ fontSize: 22, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>
          {emoji}
        </span>
      )}
      <div>
        <p style={{
          fontFamily: BC, fontWeight: 700, fontSize: 17,
          color: active ? BONE : '#888',
          textTransform: 'uppercase', letterSpacing: '0.5px',
          margin: '0 0 4px',
          transition: 'color 0.2s',
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 13, color: DIM,
          margin: 0, lineHeight: 1.6,
        }}>
          {body}
        </p>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const headingStyle = {
  fontFamily:    BC,
  fontWeight:    800,
  fontSize:      32,
  color:         BONE,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  lineHeight:    1.15,
  margin:        '0 0 8px',
}

const subStyle = {
  fontFamily: SERIF,
  fontStyle:  'italic',
  fontSize:   14,
  color:      '#888',
  margin:     '0 0 28px',
  lineHeight: 1.6,
}
