/**
 * BodyPillar/WorkoutCard
 *
 * Displays today's suggested workout with an AI-generated brief.
 * The exercise list renders immediately; the AI brief shows a skeleton
 * pulse while loading so it never blocks the main content.
 *
 * Props:
 *   workout    — workout object from workoutLibrary
 *   aiBrief    — generated brief string (null while loading)
 *   aiLoading  — bool
 *   aiError    — string | null
 *   onAccept   — () => void  called after acceptWorkout resolves
 *   onSwap     — () => void  swaps workout + re-triggers AI brief
 *   swapUsed   — bool        disables the swap button after one use
 *   accepting  — bool        loading state for accept button
 */
import { useEffect } from 'react'

const GOLD  = '#C9A84C'
const BC    = "'Barlow Condensed', sans-serif"
const SERIF = "'Georgia', 'Times New Roman', serif"
const BONE  = '#E8E0D4'
const CARD  = '#161616'
const DIM   = '#444'
const MUTED = '#666'

const CSS = `
  @keyframes body-card-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes brief-pulse {
    0%, 100% { opacity: 0.3; }
    50%       { opacity: 0.6; }
  }
`

const TRACK_LABEL = { bodyweight: 'Bodyweight', outdoor: 'Outdoor', gym: 'Gym' }
const FOCUS_LABEL = {
  push: 'Push', pull: 'Pull', legs: 'Legs',
  upper: 'Upper', lower: 'Lower', full: 'Full Body',
  cardio: 'Cardio', rest: 'Rest',
}

export default function WorkoutCard({
  workout,
  aiBrief,
  aiLoading,
  aiError,
  onAccept,
  onSwap,
  swapUsed  = false,
  accepting = false,
}) {
  if (!workout) return null

  return (
    <div style={{
      position:   'fixed', inset: 0,
      background: '#0D0D0D',
      zIndex:     110,
      display:    'flex', flexDirection: 'column',
      overflowY:  'auto',
    }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{
        paddingTop:    'max(48px, env(safe-area-inset-top))',
        paddingLeft:   20,
        paddingRight:  20,
        paddingBottom: 0,
        flexShrink:    0,
        borderBottom:  '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: 14,
        }}>
          <p style={{
            fontFamily: BC, fontWeight: 700, fontSize: 11,
            letterSpacing: '4px', color: GOLD, textTransform: 'uppercase',
            margin: 0,
          }}>
            Today's Work
          </p>
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{
        flex:    1,
        padding: '24px 20px 120px',
        animation: 'body-card-in 0.3s ease',
      }}>

        {/* Workout title row */}
        <h2 style={{
          fontFamily:    BC,
          fontWeight:    700,
          fontSize:      28,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color:         BONE,
          margin:        '0 0 6px',
          lineHeight:    1,
        }}>
          {workout.type}
        </h2>

        {/* Track + duration badges */}
        <div style={{
          display:      'flex',
          gap:          10,
          alignItems:   'center',
          marginBottom: 16,
        }}>
          <Badge>{TRACK_LABEL[workout.track]}</Badge>
          <Badge>{FOCUS_LABEL[workout.focus] ?? workout.focus}</Badge>
          <Badge>~{workout.duration} min</Badge>
        </div>

        {/* AI brief — skeleton while loading */}
        <div style={{
          background:    CARD,
          border:        `1px solid ${DIM}`,
          borderLeft:    `3px solid ${GOLD}`,
          borderRadius:  0,
          padding:       '14px 16px',
          marginBottom:  24,
          minHeight:     64,
        }}>
          {aiLoading ? (
            <SkeletonBrief />
          ) : aiError ? (
            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.7,
            }}>
              Today calls for focused work. Execute the session as written.
            </p>
          ) : aiBrief ? (
            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 14, color: '#C8BEA8', margin: 0, lineHeight: 1.75,
            }}>
              {aiBrief}
            </p>
          ) : null}
        </div>

        {/* Exercise list */}
        <div style={{
          background:    CARD,
          border:        '1px solid #2a2a2a',
          borderRadius:  0,
        }}>
          {workout.exercises.map((ex, i) => (
            <div key={i}>
              <div style={{ padding: '16px 16px 14px' }}>
                {/* Name + set/rep */}
                <div style={{
                  display:       'flex',
                  justifyContent:'space-between',
                  alignItems:    'flex-start',
                  marginBottom:  4,
                }}>
                  <p style={{
                    fontFamily: BC, fontWeight: 700, fontSize: 16,
                    color: BONE, margin: 0, textTransform: 'uppercase',
                    letterSpacing: '0.04em', flex: 1,
                  }}>
                    {ex.name}
                  </p>
                  <p style={{
                    fontFamily: BC, fontWeight: 700, fontSize: 13,
                    color: GOLD, margin: '2px 0 0 12px',
                    letterSpacing: '0.04em', whiteSpace: 'nowrap',
                  }}>
                    {ex.sets} × {ex.reps}
                  </p>
                </div>

                {/* Rest + cue */}
                <div style={{
                  display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4,
                }}>
                  {ex.rest !== '-' && (
                    <span style={{
                      fontFamily: BC, fontSize: 11, fontWeight: 700,
                      color: MUTED, letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                      {ex.rest} rest
                    </span>
                  )}
                </div>

                <p style={{
                  fontFamily: SERIF, fontStyle: 'italic',
                  fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.6,
                }}>
                  {ex.cue}
                </p>
              </div>

              {i < workout.exercises.length - 1 && (
                <div style={{ height: 1, background: '#222', margin: '0 16px' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fixed footer buttons */}
      <div style={{
        position:      'fixed',
        bottom:        0, left: 0, right: 0,
        zIndex:        10,
        paddingBottom: 'env(safe-area-inset-bottom)',
        background:    '#0D0D0D',
        borderTop:     '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={onAccept}
          disabled={accepting}
          style={{
            width:         '100%',
            height:        56,
            background:    accepting ? '#9a7a2e' : GOLD,
            color:         '#0D0D0D',
            border:        'none',
            borderRadius:  0,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      17,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        accepting ? 'default' : 'pointer',
            transition:    'background 0.15s',
          }}
        >
          {accepting ? 'Committing…' : 'Accept & Commit'}
        </button>

        <button
          onClick={onSwap}
          disabled={swapUsed || accepting}
          style={{
            width:         '100%',
            padding:       '14px 0',
            background:    'none',
            border:        'none',
            color:         swapUsed ? '#333' : MUTED,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      13,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            cursor:        swapUsed || accepting ? 'default' : 'pointer',
          }}
        >
          {swapUsed ? 'Showing alternative' : 'Give me something different'}
        </button>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ children }) {
  return (
    <span style={{
      fontFamily:    BC,
      fontWeight:    700,
      fontSize:      11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color:         MUTED,
      background:    '#1a1a1a',
      border:        '1px solid #2a2a2a',
      padding:       '3px 8px',
    }}>
      {children}
    </span>
  )
}

function SkeletonBrief() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {[80, 95, 60].map((w, i) => (
        <div key={i} style={{
          height:      12,
          width:       `${w}%`,
          background:  '#2a2a2a',
          borderRadius: 2,
          animation:   `brief-pulse 1.5s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  )
}
