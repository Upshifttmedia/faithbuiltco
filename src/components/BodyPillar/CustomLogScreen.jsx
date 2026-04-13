/**
 * BodyPillar/CustomLogScreen
 *
 * For gym users with gym_mode === 'custom'.
 * Lets the user log their own workout (type + exercises + duration)
 * then calls acceptWorkout() with the custom data.
 *
 * Props:
 *   acceptWorkout — async (workout) => { error }
 *   onComplete    — () => void  called after successful save
 *   onCancel      — () => void
 */
import { useState } from 'react'

const GOLD  = '#C9A84C'
const BC    = "'Barlow Condensed', sans-serif"
const SERIF = "'Georgia', 'Times New Roman', serif"
const BONE  = '#E8E0D4'
const CARD  = '#161616'
const DIM   = '#666'

const MAX_EXERCISES = 8

const blankExercise = () => ({ name: '', sets: '', reps: '' })

export default function CustomLogScreen({ acceptWorkout, onComplete, onCancel }) {
  const [workoutType, setWorkoutType] = useState('')
  const [exercises,   setExercises]   = useState([blankExercise()])
  const [duration,    setDuration]    = useState('')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState(null)

  function updateExercise(i, field, value) {
    setExercises(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  function addExercise() {
    if (exercises.length >= MAX_EXERCISES) return
    setExercises(prev => [...prev, blankExercise()])
  }

  function removeExercise(i) {
    if (exercises.length <= 1) return
    setExercises(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!workoutType.trim()) { setError('Enter a workout name.'); return }

    const validExercises = exercises
      .filter(e => e.name.trim())
      .map(e => ({
        name: e.name.trim(),
        sets: Number(e.sets) || 3,
        reps: e.reps.trim() || '10',
        rest: '-',
        cue:  '',
      }))

    if (!validExercises.length) { setError('Add at least one exercise.'); return }

    setSaving(true)
    setError(null)

    const workout = {
      id:       'custom',
      type:     workoutType.trim(),
      track:    'gym',
      focus:    'full',
      duration: Number(duration) || null,
      exercises: validExercises,
    }

    const { error: err } = await acceptWorkout(workout)
    setSaving(false)
    if (err) { setError('Could not save. Check your connection.'); return }
    onComplete()
  }

  const canSave = workoutType.trim() && exercises.some(e => e.name.trim())

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
          Log Workout
        </p>
        <div style={{ width: 40 }} />
      </div>

      {/* Form body */}
      <div style={{
        flex:    1,
        padding: '24px 20px 120px',
        maxWidth: 480, width: '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>

        {/* Workout name */}
        <label style={labelStyle}>Workout name</label>
        <input
          type="text"
          placeholder="e.g. Back & Biceps"
          value={workoutType}
          onChange={e => setWorkoutType(e.target.value)}
          style={{ ...inputStyle, marginBottom: 24 }}
        />

        {/* Exercises */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 10,
        }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Exercises</label>
          <span style={{
            fontFamily: BC, fontSize: 11, color: '#444',
            letterSpacing: '0.1em',
          }}>
            {exercises.length}/{MAX_EXERCISES}
          </span>
        </div>

        <div style={{
          background:   CARD,
          border:       '1px solid #2a2a2a',
          borderRadius: 0,
          marginBottom: 24,
        }}>
          {exercises.map((ex, i) => (
            <div key={i}>
              <div style={{ padding: '14px 14px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: 3 }}>
                  <input
                    type="text"
                    placeholder={`Exercise ${i + 1}`}
                    value={ex.name}
                    onChange={e => updateExercise(i, 'name', e.target.value)}
                    style={{ ...inputStyle, fontSize: 14 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    placeholder="Sets"
                    min={1} max={20}
                    value={ex.sets}
                    onChange={e => updateExercise(i, 'sets', e.target.value)}
                    style={{ ...inputStyle, fontSize: 14, textAlign: 'center' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    placeholder="Reps"
                    value={ex.reps}
                    onChange={e => updateExercise(i, 'reps', e.target.value)}
                    style={{ ...inputStyle, fontSize: 14, textAlign: 'center' }}
                  />
                </div>
                {exercises.length > 1 && (
                  <button
                    onClick={() => removeExercise(i)}
                    style={{
                      background: 'none', border: 'none',
                      color: '#444', fontSize: 18, cursor: 'pointer',
                      padding: '8px 4px', lineHeight: 1, flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              {i < exercises.length - 1 && (
                <div style={{ height: 1, background: '#222' }} />
              )}
            </div>
          ))}
        </div>

        {exercises.length < MAX_EXERCISES && (
          <button
            onClick={addExercise}
            style={{
              width:         '100%',
              padding:       '12px 0',
              background:    'none',
              border:        '1px dashed #2a2a2a',
              borderRadius:  0,
              color:         '#444',
              fontFamily:    BC,
              fontWeight:    700,
              fontSize:      13,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor:        'pointer',
              marginBottom:  24,
            }}
          >
            + Add Exercise
          </button>
        )}

        {/* Duration */}
        <label style={labelStyle}>Estimated duration (minutes)</label>
        <input
          type="number"
          placeholder="e.g. 60"
          min={5} max={180}
          value={duration}
          onChange={e => setDuration(e.target.value)}
          style={{ ...inputStyle, width: 120, marginBottom: 32 }}
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
          disabled={!canSave || saving}
          style={{
            width:         '100%',
            height:        56,
            background:    canSave && !saving ? GOLD : 'rgba(201,168,76,0.22)',
            color:         '#0D0D0D',
            border:        'none',
            borderRadius:  0,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      17,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        canSave && !saving ? 'pointer' : 'not-allowed',
            transition:    'background 0.15s',
          }}
        >
          {saving ? 'Saving…' : 'Confirm & Commit'}
        </button>
      </div>
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const labelStyle = {
  display:       'block',
  fontFamily:    BC,
  fontWeight:    700,
  fontSize:      11,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color:         '#888',
  marginBottom:  8,
}

const inputStyle = {
  display:      'block',
  width:        '100%',
  background:   '#111',
  border:       '1px solid #2a2a2a',
  borderRadius: 0,
  color:        BONE,
  fontFamily:   SERIF,
  fontStyle:    'italic',
  fontSize:     15,
  padding:      '10px 12px',
  outline:      'none',
  boxSizing:    'border-box',
  colorScheme:  'dark',
}
