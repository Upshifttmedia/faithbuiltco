/**
 * BodyPillar/EveningLogScreen
 *
 * Shown in the evening reflection for users who accepted a workout
 * that morning. Asks whether they completed it, how long it took,
 * how it felt, and an optional note.
 *
 * Props:
 *   todayLog        — body_logs row from useBodyStudy (has workout_type)
 *   completeWorkout — async (duration, feeling, notes) => { error }
 *   onSave          — () => void  called after successful save
 *   onCancel        — () => void
 */
import { useState } from 'react'

const GOLD  = '#C9A84C'
const BC    = "'Barlow Condensed', sans-serif"
const SERIF = "'Georgia', 'Times New Roman', serif"
const BONE  = '#E8E0D4'
const CARD  = '#161616'
const DIM   = '#666'

const FEELINGS = [
  { value: 'strong', emoji: '💪', label: 'Strong' },
  { value: 'solid',  emoji: '✓',  label: 'Solid'  },
  { value: 'tough',  emoji: '🔥', label: 'Tough'  },
]

export default function EveningLogScreen({ todayLog, completeWorkout, onSave, onCancel }) {
  const [completed, setCompleted] = useState(null)   // true | false | null
  const [duration,  setDuration]  = useState(30)
  const [feeling,   setFeeling]   = useState(null)
  const [notes,     setNotes]     = useState('')
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState(null)

  const workoutType = todayLog?.workout_type ?? 'Today's Workout'

  async function handleSave() {
    if (completed === null) { setError('Did you complete the workout?'); return }

    setSaving(true)
    setError(null)

    const { error: err } = await completeWorkout(
      completed ? duration  : null,
      completed ? feeling   : 'skipped',
      notes.trim() || null,
    )

    setSaving(false)
    if (err) { setError('Could not save. Check your connection.'); return }
    onSave()
  }

  return (
    <div style={{
      position:   'fixed', inset: 0,
      background: '#0D0D0D',
      zIndex:     110,
      display:    'flex', flexDirection: 'column',
      overflowY:  'auto',
    }}>
      {/* Header */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        paddingTop:     'max(48px, env(safe-area-inset-top))',
        paddingLeft:    20,
        paddingRight:   20,
        paddingBottom:  14,
        flexShrink:     0,
        borderBottom:   '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: 'none',
            color: DIM, fontSize: 22, cursor: 'pointer', padding: '4px 8px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
        <p style={{
          fontFamily: BC, fontWeight: 700, fontSize: 11,
          letterSpacing: '4px', color: GOLD, textTransform: 'uppercase', margin: 0,
        }}>
          Body Pillar
        </p>
        <div style={{ width: 40 }} />
      </div>

      {/* Body */}
      <div style={{
        flex:    1,
        padding: '28px 20px 120px',
        maxWidth: 480, width: '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>

        {/* Workout reference */}
        <p style={{
          fontFamily: BC, fontWeight: 700, fontSize: 11,
          color: DIM, letterSpacing: '0.15em', textTransform: 'uppercase',
          margin: '0 0 4px',
        }}>
          This morning
        </p>
        <h2 style={{
          fontFamily: BC, fontWeight: 800, fontSize: 28,
          color: BONE, textTransform: 'uppercase',
          letterSpacing: '0.06em', margin: '0 0 28px', lineHeight: 1,
        }}>
          {workoutType}
        </h2>

        {/* Did you complete it? */}
        <p style={sectionLabel}>How did it go?</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <ToggleButton
            active={completed === true}
            onSelect={() => setCompleted(true)}
            label="I did it"
          />
          <ToggleButton
            active={completed === false}
            onSelect={() => setCompleted(false)}
            label="Didn't happen"
          />
        </div>

        {/* Completed flow */}
        {completed === true && (
          <>
            {/* Duration slider */}
            <p style={sectionLabel}>Duration</p>
            <div style={{
              background:   CARD,
              border:       '1px solid #2a2a2a',
              borderRadius: 0,
              padding:      '16px',
              marginBottom: 24,
            }}>
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'baseline',
                marginBottom:   12,
              }}>
                <span style={{
                  fontFamily: SERIF, fontStyle: 'italic', fontSize: 13, color: DIM,
                }}>
                  Duration
                </span>
                <span style={{
                  fontFamily: BC, fontWeight: 700, fontSize: 20, color: GOLD,
                }}>
                  {duration} min
                </span>
              </div>
              <input
                type="range"
                min={10} max={120} step={5}
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                style={{
                  width:       '100%',
                  accentColor: GOLD,
                  cursor:      'pointer',
                }}
              />
              <div style={{
                display:        'flex',
                justifyContent: 'space-between',
                marginTop:      4,
              }}>
                <span style={sliderLabel}>10m</span>
                <span style={sliderLabel}>120m</span>
              </div>
            </div>

            {/* Feeling */}
            <p style={sectionLabel}>How it felt</p>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {FEELINGS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFeeling(f.value)}
                  style={{
                    flex:          1,
                    padding:       '14px 8px',
                    background:    feeling === f.value ? 'rgba(201,168,76,0.1)' : CARD,
                    border:        `1px solid ${feeling === f.value ? GOLD : '#2a2a2a'}`,
                    borderRadius:  0,
                    color:         feeling === f.value ? GOLD : DIM,
                    fontFamily:    BC,
                    fontWeight:    700,
                    fontSize:      13,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor:        'pointer',
                    transition:    'border-color 0.2s, background 0.2s, color 0.2s',
                    display:       'flex',
                    flexDirection: 'column',
                    alignItems:    'center',
                    gap:           6,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{f.emoji}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Note — always shown */}
        <p style={sectionLabel}>Note (optional)</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder={
            completed === false
              ? 'What got in the way?'
              : 'Anything worth recording…'
          }
          rows={3}
          style={{
            width:        '100%',
            boxSizing:    'border-box',
            background:   '#111',
            border:       '1px solid #2a2a2a',
            borderRadius: 0,
            color:        BONE,
            fontFamily:   SERIF,
            fontStyle:    'italic',
            fontSize:     14,
            lineHeight:   1.6,
            padding:      '12px 14px',
            resize:       'none',
            outline:      'none',
            marginBottom: 24,
          }}
        />

        {error && (
          <p style={{ color: '#e05252', fontSize: 13, margin: '0 0 16px' }}>
            {error}
          </p>
        )}
      </div>

      {/* Fixed save button */}
      <div style={{
        position:      'fixed',
        bottom:        0, left: 0, right: 0,
        zIndex:        10,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background:    '#0D0D0D',
        borderTop:     '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={handleSave}
          disabled={completed === null || saving}
          style={{
            width:         '100%',
            height:        56,
            background:    completed !== null && !saving ? GOLD : 'rgba(201,168,76,0.22)',
            color:         '#0D0D0D',
            border:        'none',
            borderRadius:  0,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      17,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        completed !== null && !saving ? 'pointer' : 'not-allowed',
            transition:    'background 0.15s',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ToggleButton({ active, onSelect, label }) {
  return (
    <button
      onClick={onSelect}
      style={{
        flex:          1,
        padding:       '14px 0',
        background:    active ? 'rgba(201,168,76,0.1)' : '#161616',
        border:        `1px solid ${active ? GOLD : '#2a2a2a'}`,
        borderRadius:  0,
        color:         active ? GOLD : DIM,
        fontFamily:    BC,
        fontWeight:    700,
        fontSize:      14,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        cursor:        'pointer',
        transition:    'border-color 0.2s, background 0.2s, color 0.2s',
      }}
    >
      {label}
    </button>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const sectionLabel = {
  fontFamily:    BC,
  fontWeight:    700,
  fontSize:      11,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color:         '#888',
  margin:        '0 0 10px',
}

const sliderLabel = {
  fontFamily: BC,
  fontSize:   11,
  color:      DIM,
  letterSpacing: '0.06em',
}
