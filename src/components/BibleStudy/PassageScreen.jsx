/**
 * PassageScreen — shows today's passage and study question.
 * Two exit paths:
 *   onJournal()  — user wants to do SOAP (→ SOAPScreen)
 *   onCarried()  — user will carry the Word with them (calls markCarried, closes)
 */
import { useState } from 'react'

const GOLD  = '#C9A84C'
const BC    = "'Barlow Condensed', sans-serif"
const SERIF = "'Georgia', 'Times New Roman', serif"
const BONE  = '#E8E0D4'

const CSS = `
  @keyframes ps-fade {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

export default function PassageScreen({ passage, markCarried, onJournal, onCarried, onBack }) {
  const [carrying, setCarrying] = useState(false)

  async function handleCarry() {
    setCarrying(true)
    await markCarried()
    setCarrying(false)
    onCarried()
  }

  if (!passage) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: '#0D0D0D',
        zIndex: 110, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 24,
      }}>
        <p style={{ color: '#888', fontFamily: SERIF, fontStyle: 'italic', textAlign: 'center' }}>
          No passage found for this book and chapter yet.
          <br />More books are coming soon.
        </p>
        <button onClick={onBack} style={backBtnStyle}>← Back</button>
      </div>
    )
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
          The Word
        </p>
        <div style={{ width: 56 }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '28px 24px 48px',
        display: 'flex', flexDirection: 'column',
        animation: 'ps-fade 0.35s ease',
        maxWidth: 480, width: '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>
        {/* Book + chapter label */}
        <p style={{
          fontFamily: BC, fontWeight: 800, fontSize: 13,
          letterSpacing: '4px', color: GOLD,
          textTransform: 'uppercase', margin: '0 0 4px',
        }}>
          {passage.book} {passage.chapter}
        </p>
        <p style={{
          fontFamily: BC, fontWeight: 400, fontSize: 12,
          letterSpacing: '2px', color: '#555',
          textTransform: 'uppercase', margin: '0 0 24px',
        }}>
          {passage.verse}
        </p>

        {/* Passage text card */}
        <div style={{
          background: '#161616',
          border: '1px solid #2a2a2a',
          borderLeft: `3px solid ${GOLD}`,
          borderRadius: 8,
          padding: '20px 18px',
          marginBottom: 20,
        }}>
          <p style={{
            fontFamily: SERIF,
            fontSize: 16,
            color: BONE,
            lineHeight: 1.85,
            margin: 0,
            whiteSpace: 'pre-line',
          }}>
            {passage.text}
          </p>
        </div>

        {/* Study question card */}
        <div style={{
          background: 'transparent',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          padding: '16px 18px',
          marginBottom: 32,
        }}>
          <p style={{
            fontFamily: BC, fontWeight: 700, fontSize: 10,
            letterSpacing: '3px', color: '#555',
            textTransform: 'uppercase', margin: '0 0 8px',
          }}>
            Study Question
          </p>
          <p style={{
            fontFamily: SERIF, fontStyle: 'italic',
            fontSize: 15, color: '#aaa',
            lineHeight: 1.7, margin: 0,
          }}>
            {passage.question}
          </p>
        </div>

        {/* Action buttons */}
        <button
          onClick={onJournal}
          style={{
            width: '100%', padding: '17px 0',
            background: GOLD, border: 'none', borderRadius: 4,
            color: '#000',
            fontFamily: BC, fontWeight: 700, fontSize: 17,
            letterSpacing: '2px', textTransform: 'uppercase',
            cursor: 'pointer', marginBottom: 12,
          }}
        >
          Reflect &amp; Journal →
        </button>

        <button
          onClick={handleCarry}
          disabled={carrying}
          style={{
            width: '100%', padding: '17px 0',
            background: 'transparent',
            border: '1px solid #2a2a2a',
            borderRadius: 4,
            color: carrying ? '#555' : '#888',
            fontFamily: BC, fontWeight: 700, fontSize: 15,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            cursor: carrying ? 'not-allowed' : 'pointer',
          }}
        >
          {carrying ? 'Saving…' : "I'll carry this with me →"}
        </button>

        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 12, color: '#444',
          textAlign: 'center', margin: '14px 0 0',
        }}>
          Carrying marks your Faith pillar complete for today.
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
