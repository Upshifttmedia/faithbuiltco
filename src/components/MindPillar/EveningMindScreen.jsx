/**
 * MindPillar/EveningMindScreen
 *
 * Evening reflection for users who completed a Mind Brief that morning.
 * Shows their word/weapon for reference, asks how it went.
 *
 * Props:
 *   todayLog              — mind_logs row (word, battle, weapon_category, weapon)
 *   saveEveningReflection — async (reflection, wordHeld) => { error }
 *   onSave                — () => void  called on successful save
 *   onCancel              — () => void  dismiss without saving
 */
import { useState } from 'react'

const GOLD   = '#C9A84C'
const BC     = "'Barlow Condensed', sans-serif"
const SERIF  = "'Georgia', 'Times New Roman', serif"
const BONE   = '#E8E0D4'
const CARD   = '#0d1018'
const BORDER = '#1a2030'
const MUTED  = '#555'

const CATEGORY_EMOJIS = {
  verse:    '📖',
  prayer:   '🙏',
  reset:    '↺',
  question: '❓',
}

const CSS = `
  @keyframes evening-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .evening-textarea::placeholder {
    color: rgba(255,255,255,0.18);
    font-style: italic;
  }
  .evening-textarea:focus {
    border-color: #2a3a50 !important;
    outline: none;
  }
`

export default function EveningMindScreen({ todayLog, saveEveningReflection, onSave, onCancel }) {
  const [wordHeld,    setWordHeld]    = useState(null)    // true | false | null
  const [reflection,  setReflection]  = useState('')
  const [saving,      setSaving]      = useState(false)

  const canSave = !saving && wordHeld !== null && reflection.trim().length >= 10

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    const { error } = await saveEveningReflection(reflection.trim(), wordHeld)
    setSaving(false)
    if (!error) onSave()
  }

  const weaponEmoji = CATEGORY_EMOJIS[todayLog?.weapon_category] ?? ''

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
        paddingBottom: 14,
        flexShrink:    0,
        borderBottom:  `1px solid ${BORDER}`,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
      }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: 'none',
            color: MUTED, fontFamily: BC, fontWeight: 700,
            fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', cursor: 'pointer', padding: 0,
          }}
        >
          ← Back
        </button>
        <p style={{
          fontFamily: BC, fontWeight: 700, fontSize: 15,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: GOLD, margin: 0,
        }}>
          {todayLog?.word}
        </p>
        <div style={{ width: 48 }} />
      </div>

      {/* Body */}
      <div style={{
        flex:      1,
        padding:   '28px 20px 140px',
        animation: 'evening-in 0.3s ease',
      }}>

        {/* Morning brief recap */}
        <div style={{
          border:       `1px solid ${BORDER}`,
          background:   CARD,
          padding:      '14px 16px',
          marginBottom: 28,
        }}>
          <p style={{
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      10,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color:         'rgba(201,168,76,0.5)',
            margin:        '0 0 10px',
          }}>
            This Morning
          </p>

          {todayLog?.battle && (
            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 12, color: '#7788aa',
              margin: '0 0 8px', lineHeight: 1.6,
            }}>
              Battle: {todayLog.battle}
            </p>
          )}

          {todayLog?.weapon && (
            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 12, color: '#7788aa',
              margin: 0, lineHeight: 1.6,
            }}>
              {weaponEmoji} {todayLog.weapon}
            </p>
          )}
        </div>

        {/* Did you hold the word? */}
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 18, color: BONE,
          margin: '0 0 8px', lineHeight: 1.5,
        }}>
          Did you hold the word?
        </p>
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 13, color: MUTED,
          margin: '0 0 20px', lineHeight: 1.7,
        }}>
          Be honest. No judgment here.
        </p>

        {/* Yes / No toggle */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 28,
        }}>
          {[
            { value: true,  label: 'Yes — I held it' },
            { value: false, label: 'Not fully' },
          ].map(opt => {
            const isActive = wordHeld === opt.value
            return (
              <button
                key={String(opt.value)}
                onClick={() => setWordHeld(opt.value)}
                style={{
                  height:        56,
                  background:    isActive ? 'rgba(201,168,76,0.08)' : CARD,
                  border:        `1px solid ${isActive ? GOLD : BORDER}`,
                  borderRadius:  0,
                  fontFamily:    SERIF,
                  fontStyle:     'italic',
                  fontSize:      13,
                  color:         isActive ? BONE : '#7788aa',
                  cursor:        'pointer',
                  transition:    'border-color 0.2s, color 0.2s, background 0.2s',
                  padding:       '0 12px',
                  textAlign:     'center',
                  lineHeight:    1.4,
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {/* Reflection */}
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 18, color: BONE,
          margin: '0 0 8px', lineHeight: 1.5,
        }}>
          How did it go?
        </p>
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 13, color: MUTED,
          margin: '0 0 16px', lineHeight: 1.7,
        }}>
          Where did the battle show up? What held — and what didn't?
        </p>

        <textarea
          className="evening-textarea"
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="The meeting hit harder than I expected. The weapon helped — I came back to it twice…"
          rows={4}
          style={{
            width:        '100%',
            boxSizing:    'border-box',
            background:   '#111',
            border:       `1px solid ${BORDER}`,
            borderRadius: 0,
            color:        BONE,
            fontFamily:   SERIF,
            fontStyle:    'italic',
            fontSize:     14,
            lineHeight:   1.7,
            padding:      '14px 16px',
            resize:       'none',
            minHeight:    100,
          }}
        />

        {reflection.length > 0 && reflection.trim().length < 10 && (
          <p style={{
            fontFamily: SERIF, fontStyle: 'italic',
            fontSize: 11, color: '#333',
            margin: '6px 0 0', textAlign: 'right',
          }}>
            Keep going — be specific.
          </p>
        )}
      </div>

      {/* Fixed footer */}
      <div style={{
        position:      'fixed',
        bottom:        0, left: 0, right: 0,
        zIndex:        10,
        background:    '#0D0D0D',
        borderTop:     `1px solid ${BORDER}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            width:         '100%',
            height:        56,
            background:    canSave ? GOLD : 'rgba(201,168,76,0.18)',
            color:         '#0D0D0D',
            border:        'none',
            borderRadius:  0,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      17,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        canSave ? 'pointer' : 'not-allowed',
            transition:    'background 0.15s',
          }}
        >
          {saving ? 'Saving…' : 'Close the Loop'}
        </button>
      </div>
    </div>
  )
}
