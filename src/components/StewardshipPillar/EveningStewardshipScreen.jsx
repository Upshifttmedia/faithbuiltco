/**
 * StewardshipPillar/EveningStewardshipScreen
 *
 * Evening reckoning for users who completed a Daily Ledger that morning.
 * Shows morning intentions, asks two honest toggle questions, optional notes.
 *
 * Props:
 *   todayLog              — stewardship_logs row
 *   saveEveningReflection — async (moneyHeld, timeHeld, reflection) => { error }
 *   onSave                — () => void  called on successful save
 *   onCancel              — () => void  dismiss without saving
 */
import { useState } from 'react'

const GOLD   = '#C9A84C'
const BC     = "'Barlow Condensed', sans-serif"
const SERIF  = "'Georgia', 'Times New Roman', serif"
const BONE   = '#E8E0D4'
const CARD   = '#141008'
const BORDER = '#1e1a0e'
const MUTED  = '#555'

const CSS = `
  .reckoning-ta::placeholder { color: rgba(255,255,255,0.18); font-style: italic; }
  .reckoning-ta:focus { border-color: #3a3020 !important; outline: none; }
`

function ToggleRow({ question, value, onChange, yesLabel, noLabel }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{
        fontFamily: SERIF,
        fontStyle:  'italic',
        fontSize:   16,
        color:      BONE,
        margin:     '0 0 12px',
      }}>
        {question}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[{ v: true, label: yesLabel }, { v: false, label: noLabel }].map(opt => {
          const active = value === opt.v
          return (
            <button
              key={String(opt.v)}
              onClick={() => onChange(opt.v)}
              style={{
                height:     52,
                background: active ? 'rgba(201,168,76,0.08)' : CARD,
                border:     `1px solid ${active ? GOLD : BORDER}`,
                borderRadius: 0,
                fontFamily: SERIF,
                fontStyle:  'italic',
                fontSize:   13,
                color:      active ? BONE : '#7a7060',
                cursor:     'pointer',
                transition: 'border-color 0.2s, color 0.2s, background 0.2s',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function EveningStewardshipScreen({
  todayLog,
  saveEveningReflection,
  onSave,
  onCancel,
}) {
  const [moneyHeld,  setMoneyHeld]  = useState(null)
  const [timeHeld,   setTimeHeld]   = useState(null)
  const [reflection, setReflection] = useState('')
  const [saving,     setSaving]     = useState(false)

  const canSave = !saving && moneyHeld !== null && timeHeld !== null

  async function handleSave() {
    if (!canSave) return
    setSaving(true)
    const { error } = await saveEveningReflection(moneyHeld, timeHeld, reflection.trim())
    setSaving(false)
    if (!error) onSave()
  }

  return (
    <div style={{
      position:      'fixed',
      inset:         0,
      background:    '#0D0D0D',
      zIndex:        110,
      display:       'flex',
      flexDirection: 'column',
      overflowY:     'auto',
    }}>
      <style>{CSS}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        paddingTop:     'max(48px, env(safe-area-inset-top))',
        paddingLeft:    20,
        paddingRight:   20,
        paddingBottom:  14,
        flexShrink:     0,
        borderBottom:   `1px solid ${BORDER}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={onCancel}
          style={{
            background:    'none',
            border:        'none',
            color:         MUTED,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        'pointer',
            padding:       0,
          }}
        >
          ← Back
        </button>
        <p style={{
          fontFamily:    BC,
          fontWeight:    700,
          fontSize:      15,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color:         GOLD,
          margin:        0,
        }}>
          The Reckoning
        </p>
        <div style={{ width: 48 }} />
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{
        flex:    1,
        padding: '24px 20px calc(180px + env(safe-area-inset-bottom))',
      }}>

        {/* Morning intentions recap */}
        {(todayLog?.money_intention || todayLog?.time_intention) && (
          <div style={{
            background:   CARD,
            border:       `1px solid ${BORDER}`,
            padding:      '14px 16px',
            marginBottom: 28,
          }}>
            <p style={{
              fontFamily:    BC,
              fontWeight:    700,
              fontSize:      10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'rgba(201,168,76,0.5)',
              margin:        '0 0 10px',
            }}>
              This Morning
            </p>
            {todayLog?.money_intention && (
              <p style={{
                fontFamily: SERIF,
                fontStyle:  'italic',
                fontSize:   12,
                color:      '#7a7060',
                margin:     '0 0 6px',
                lineHeight: 1.6,
              }}>
                💰 {todayLog.money_intention}
              </p>
            )}
            {todayLog?.time_intention && (
              <p style={{
                fontFamily: SERIF,
                fontStyle:  'italic',
                fontSize:   12,
                color:      '#7a7060',
                margin:     0,
                lineHeight: 1.6,
              }}>
                ⏱ {todayLog.time_intention}
              </p>
            )}
          </div>
        )}

        {/* Toggle questions */}
        <ToggleRow
          question="Did the money move happen?"
          value={moneyHeld}
          onChange={setMoneyHeld}
          yesLabel="✓ It did"
          noLabel="✗ It didn't"
        />
        <ToggleRow
          question="Did you protect that hour?"
          value={timeHeld}
          onChange={setTimeHeld}
          yesLabel="✓ I did"
          noLabel="✗ I didn't"
        />

        {/* Optional reflection */}
        <p style={{
          fontFamily: SERIF,
          fontStyle:  'italic',
          fontSize:   14,
          color:      '#888',
          margin:     '0 0 12px',
        }}>
          Anything else worth noting?
        </p>
        <textarea
          className="reckoning-ta"
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="Be honest. This is between you and God."
          rows={3}
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
            minHeight:    80,
          }}
        />
      </div>

      {/* ── Fixed footer ───────────────────────────────────────────────────── */}
      <div style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
        zIndex:        10,
        background:    '#0D0D0D',
        borderTop:     `1px solid ${BORDER}`,
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
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
          {saving ? 'Saving…' : 'Save Reflection'}
        </button>
      </div>
    </div>
  )
}
