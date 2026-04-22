/**
 * StewardshipPillar/ConfirmationScreen
 *
 * Shown after the user commits their Daily Ledger.
 * Summarises money and time intentions in a clean card.
 *
 * Props:
 *   moneyIntention — string
 *   timeIntention  — string
 *   onDone         — () => void  returns to Morning Commitment
 */

const GOLD   = '#C9A84C'
const BC     = "'Barlow Condensed', sans-serif"
const SERIF  = "'Georgia', 'Times New Roman', serif"
const CARD   = '#141008'
const BORDER = '#1e1a0e'
const MUTED  = '#555'

export default function ConfirmationScreen({ moneyIntention, timeIntention, onDone }) {
  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     '#0D0D0D',
      zIndex:         110,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        'max(60px, env(safe-area-inset-top)) 24px 80px',
    }}>

      {/* Leaf icon */}
      <div style={{ fontSize: 28, marginBottom: 20, lineHeight: 1 }}>🌱</div>

      {/* Summary card */}
      <div style={{
        width:        '100%',
        maxWidth:     460,
        background:   CARD,
        border:       `1px solid ${BORDER}`,
        borderRadius: 0,
        padding:      20,
        marginBottom: 24,
      }}>
        <p style={{
          fontFamily:    BC,
          fontWeight:    700,
          fontSize:      10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         'rgba(201,168,76,0.5)',
          margin:        '0 0 6px',
        }}>
          Money
        </p>
        <p style={{
          fontFamily: SERIF,
          fontStyle:  'italic',
          fontSize:   13,
          color:      '#9a8f7a',
          margin:     '0 0 18px',
          lineHeight: 1.7,
        }}>
          {moneyIntention}
        </p>

        <div style={{ height: 1, background: BORDER, marginBottom: 18 }} />

        <p style={{
          fontFamily:    BC,
          fontWeight:    700,
          fontSize:      10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color:         'rgba(201,168,76,0.5)',
          margin:        '0 0 6px',
        }}>
          Time
        </p>
        <p style={{
          fontFamily: SERIF,
          fontStyle:  'italic',
          fontSize:   13,
          color:      '#9a8f7a',
          margin:     0,
          lineHeight: 1.7,
        }}>
          {timeIntention}
        </p>
      </div>

      {/* Encouragement */}
      <p style={{
        fontFamily: SERIF,
        fontStyle:  'italic',
        fontSize:   13,
        color:      MUTED,
        textAlign:  'center',
        lineHeight: 1.7,
        maxWidth:   300,
        margin:     0,
      }}>
        These are your two commitments.<br />
        Carry them. Account for them tonight.
      </p>

      {/* Fixed footer */}
      <div style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
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
