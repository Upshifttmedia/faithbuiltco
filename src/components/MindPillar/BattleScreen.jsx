/**
 * MindPillar/BattleScreen
 *
 * User names the battle — what will most likely pull them off their
 * chosen word today.
 *
 * Props:
 *   word    — the chosen word string
 *   onNext  — (battle: string) => void  advance to WeaponScreen
 *   onBack  — () => void  return to WordSelectScreen
 */
import { useState } from 'react'

const GOLD   = '#C9A84C'
const BC     = "'Barlow Condensed', sans-serif"
const SERIF  = "'Georgia', 'Times New Roman', serif"
const BONE   = '#E8E0D4'
const BORDER = '#1a2030'
const MUTED  = '#555'

const CSS = `
  @keyframes battle-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .battle-textarea::placeholder {
    color: rgba(255,255,255,0.18);
    font-style: italic;
  }
  .battle-textarea:focus {
    border-color: #2a3a50 !important;
    outline: none;
  }
`

export default function BattleScreen({ word, onNext, onBack }) {
  const [battle, setBattle] = useState('')

  const canProceed = battle.trim().length >= 10

  return (
    <div style={{
      position:   'fixed', inset: 0,
      background: '#0D0D0D',
      zIndex:     110,
      display:    'flex', flexDirection: 'column',
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
          onClick={onBack}
          style={{
            background: 'none', border: 'none',
            color: MUTED, fontFamily: BC, fontWeight: 700,
            fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', cursor: 'pointer', padding: 0,
          }}
        >
          ← Back
        </button>

        {/* Chosen word — centered */}
        <p style={{
          fontFamily:    BC,
          fontWeight:    700,
          fontSize:      15,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color:         GOLD,
          margin:        0,
        }}>
          {word}
        </p>

        <div style={{ width: 48 }} />
      </div>

      {/* Body */}
      <div style={{
        flex:      1,
        padding:   '36px 24px 120px',
        display:   'flex',
        flexDirection: 'column',
        animation: 'battle-in 0.3s ease',
        maxWidth:  480, width: '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 18, color: BONE,
          margin: '0 0 10px', lineHeight: 1.5,
        }}>
          Name your battle.
        </p>

        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 13, color: MUTED,
          margin: '0 0 28px', lineHeight: 1.7,
        }}>
          What's most likely to pull you off this posture today?
          Be specific.
        </p>

        <textarea
          className="battle-textarea"
          value={battle}
          onChange={e => setBattle(e.target.value)}
          placeholder="The meeting I've been avoiding. The comparison trap. The noise I can't silence."
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

        {/* Character hint — appears when close to threshold */}
        {battle.length > 0 && battle.trim().length < 10 && (
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
          onClick={() => canProceed && onNext(battle.trim())}
          disabled={!canProceed}
          style={{
            width:         '100%',
            height:        56,
            background:    canProceed ? GOLD : 'rgba(201,168,76,0.18)',
            color:         '#0D0D0D',
            border:        'none',
            borderRadius:  0,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      17,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        canProceed ? 'pointer' : 'not-allowed',
            transition:    'background 0.15s',
          }}
        >
          Choose Your Weapon →
        </button>
      </div>
    </div>
  )
}
