/**
 * SOAPScreen — four-field journaling form.
 * S — Scripture   O — Observation   A — Application   P — Prayer
 *
 * All four fields required to enable Save.
 * Save calls saveSOAP(s, o, a, p) then onComplete().
 */
import { useState } from 'react'

const GOLD  = '#C9A84C'
const BC    = "'Barlow Condensed', sans-serif"
const SERIF = "'Georgia', 'Times New Roman', serif"
const BONE  = '#E8E0D4'

const FIELDS = [
  {
    key:    'scripture',
    label:  'S — Scripture',
    prompt: 'Write the verse or phrase that stood out to you.',
    rows:   3,
  },
  {
    key:    'observation',
    label:  'O — Observation',
    prompt: 'What do you notice? What is the context or meaning?',
    rows:   4,
  },
  {
    key:    'application',
    label:  'A — Application',
    prompt: 'How does this apply to your life specifically today?',
    rows:   4,
  },
  {
    key:    'prayer',
    label:  'P — Prayer',
    prompt: 'Respond to God in your own words.',
    rows:   4,
  },
]

const CSS = `
  @keyframes soap-fade {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .soap-textarea:focus {
    border-color: #C9A84C !important;
    outline: none;
  }
`

export default function SOAPScreen({ passage, saveSOAP, onComplete, onBack }) {
  const [values, setValues] = useState({ scripture: '', observation: '', application: '', prayer: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  const allFilled = FIELDS.every(f => values[f.key].trim().length > 0)

  function handleChange(key, val) {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    if (!allFilled) return
    setSaving(true)
    setError(null)
    const { error: err } = await saveSOAP(
      values.scripture,
      values.observation,
      values.application,
      values.prayer,
    )
    setSaving(false)
    if (err) { setError('Couldn\'t save your notes. Check your connection.'); return }
    onComplete()
  }

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
        <button onClick={onBack} style={backBtnStyle}>← Back</button>
        <p style={{
          fontFamily: BC, fontWeight: 700, fontSize: 11,
          letterSpacing: '4px', color: GOLD, textTransform: 'uppercase',
          margin: 0,
        }}>
          S.O.A.P.
        </p>
        <div style={{ width: 56 }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '28px 24px 48px',
        display: 'flex', flexDirection: 'column',
        animation: 'soap-fade 0.35s ease',
        maxWidth: 480, width: '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>
        {/* Passage reference */}
        {passage && (
          <p style={{
            fontFamily: BC, fontWeight: 700, fontSize: 13,
            letterSpacing: '3px', color: GOLD,
            textTransform: 'uppercase', margin: '0 0 24px',
          }}>
            {passage.book} {passage.chapter} — {passage.verse}
          </p>
        )}

        {/* SOAP fields */}
        {FIELDS.map(f => (
          <div key={f.key} style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontFamily: BC, fontWeight: 700, fontSize: 13,
              letterSpacing: '2px', textTransform: 'uppercase',
              color: GOLD, marginBottom: 4,
            }}>
              {f.label}
            </label>
            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 12, color: '#666',
              margin: '0 0 8px', lineHeight: 1.5,
            }}>
              {f.prompt}
            </p>
            <textarea
              className="soap-textarea"
              value={values[f.key]}
              onChange={e => handleChange(f.key, e.target.value)}
              rows={f.rows}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#161616',
                border: '1px solid #2a2a2a',
                borderRadius: 8,
                padding: '14px 14px',
                color: BONE,
                fontFamily: SERIF,
                fontSize: 15, lineHeight: 1.65,
                resize: 'vertical',
                transition: 'border-color 0.2s ease',
              }}
            />
          </div>
        ))}

        {error && (
          <p style={{ color: '#e05252', fontSize: 13, textAlign: 'center', margin: '0 0 16px' }}>
            {error}
          </p>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={!allFilled || saving}
          style={{
            width: '100%', padding: '18px 0',
            background: allFilled && !saving ? GOLD : 'rgba(201,168,76,0.25)',
            border: 'none', borderRadius: 4,
            color: '#000',
            fontFamily: BC, fontWeight: 700, fontSize: 17,
            letterSpacing: '2px', textTransform: 'uppercase',
            cursor: allFilled && !saving ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s ease',
          }}
        >
          {saving ? 'Saving…' : 'Lock It In →'}
        </button>

        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 12, color: '#444',
          textAlign: 'center', margin: '14px 0 0',
        }}>
          All four fields required.
        </p>
      </div>
    </div>
  )
}

const backBtnStyle = {
  background: 'none', border: 'none',
  color: '#666', fontSize: 14, cursor: 'pointer',
  fontFamily: BC, fontWeight: 600, letterSpacing: '1px',
  padding: '4px 0',
}
