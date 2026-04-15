/**
 * MindPillar/ConfirmationScreen
 *
 * Full-screen summary shown after the user commits their Mind Brief.
 * Displays word, battle, and chosen weapon in a clean dark card.
 *
 * Props:
 *   word           — string
 *   battle         — string
 *   weaponCategory — 'verse' | 'prayer' | 'reset' | 'question'
 *   weapon         — string
 *   onDone         — () => void  returns to Morning Commitment
 */

const GOLD   = '#C9A84C'
const BC     = "'Barlow Condensed', sans-serif"
const SERIF  = "'Georgia', 'Times New Roman', serif"
const BONE   = '#E8E0D4'
const BORDER = '#1a2030'
const MUTED  = '#555'

const CATEGORY_LABELS = {
  verse:    'A Verse',
  prayer:   'A Prayer',
  reset:    'A Reset',
  question: 'A Question',
}

const CATEGORY_EMOJIS = {
  verse:    '📖',
  prayer:   '🙏',
  reset:    '↺',
  question: '❓',
}

const CSS = `
  @keyframes confirm-in {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes confirm-badge {
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; transform: scale(1); }
  }
`

export default function ConfirmationScreen({ word, battle, weaponCategory, weapon, onDone }) {
  return (
    <div style={{
      position:   'fixed', inset: 0,
      background: '#0D0D0D',
      zIndex:     110,
      display:    'flex', flexDirection: 'column',
      overflowY:  'auto',
    }}>
      <style>{CSS}</style>

      {/* Body */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        'max(60px, env(safe-area-inset-top)) 24px 40px',
        animation:      'confirm-in 0.4s ease',
      }}>

        {/* Shield / badge */}
        <div style={{
          fontSize:        44,
          lineHeight:      1,
          marginBottom:    20,
          animation:       'confirm-badge 0.4s ease 0.1s both',
        }}>
          ✝
        </div>

        {/* Word */}
        <p style={{
          fontFamily:    BC,
          fontWeight:    700,
          fontSize:      52,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color:         GOLD,
          margin:        '0 0 6px',
          lineHeight:    1,
          textAlign:     'center',
        }}>
          {word}
        </p>

        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 13, color: MUTED,
          margin: '0 0 32px', textAlign: 'center',
        }}>
          Your posture for today.
        </p>

        {/* Summary card */}
        <div style={{
          width:        '100%',
          maxWidth:     460,
          border:       `1px solid ${BORDER}`,
          background:   '#0d1018',
        }}>

          {/* Battle row */}
          <div style={{
            padding:      '16px 18px',
            borderBottom: `1px solid ${BORDER}`,
          }}>
            <p style={{
              fontFamily:    BC,
              fontWeight:    700,
              fontSize:      10,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color:         'rgba(201,168,76,0.5)',
              margin:        '0 0 6px',
            }}>
              The Battle
            </p>
            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 13, color: BONE,
              margin: 0, lineHeight: 1.7,
            }}>
              {battle}
            </p>
          </div>

          {/* Weapon row */}
          <div style={{ padding: '16px 18px' }}>
            <p style={{
              fontFamily:    BC,
              fontWeight:    700,
              fontSize:      10,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color:         'rgba(201,168,76,0.5)',
              margin:        '0 0 6px',
              display:       'flex',
              alignItems:    'center',
              gap:           6,
            }}>
              <span>{CATEGORY_EMOJIS[weaponCategory]}</span>
              <span>Your Weapon — {CATEGORY_LABELS[weaponCategory]}</span>
            </p>
            <p style={{
              fontFamily: SERIF, fontStyle: 'italic',
              fontSize: 13, color: BONE,
              margin: 0, lineHeight: 1.7,
            }}>
              {weapon}
            </p>
          </div>
        </div>

        {/* Encouragement line */}
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 12, color: MUTED,
          marginTop: 28, textAlign: 'center',
          lineHeight: 1.6, maxWidth: 300,
        }}>
          You are armed. Now walk accordingly.
        </p>
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
          onClick={onDone}
          style={{
            width:         '100%',
            height:        56,
            background:    GOLD,
            color:         '#0D0D0D',
            border:        'none',
            borderRadius:  0,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      17,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        'pointer',
          }}
        >
          Back to Morning
        </button>
      </div>
    </div>
  )
}
