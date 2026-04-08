/**
 * CompletionScreen — shown after SOAP save.
 * Cross icon, "FAITH PILLAR COMPLETE", Psalm 119:105, back button.
 */
const GOLD  = '#C9A84C'
const BC    = "'Barlow Condensed', sans-serif"
const SERIF = "'Georgia', 'Times New Roman', serif"
const BONE  = '#E8E0D4'

const CSS = `
  @keyframes cs-rise {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cs-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.25); }
    50%       { box-shadow: 0 0 24px 8px rgba(201,168,76,0.35); }
  }
`

export default function CompletionScreen({ onDone }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0D0D0D',
      zIndex: 110,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center',
      paddingTop: 'max(24px, env(safe-area-inset-top))',
      paddingLeft: 32, paddingRight: 32, paddingBottom: 0,
    }}>
      <style>{CSS}</style>

      {/* Gold circle with cross icon */}
      <div style={{
        width: 80, height: 80,
        borderRadius: '50%',
        border: `2px solid ${GOLD}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
        animation: 'cs-rise 0.5s ease, cs-glow 2.5s ease 0.5s infinite',
      }}>
        <img
          src="/pickupyourcross.png"
          alt=""
          style={{
            width: 44, height: 44,
            mixBlendMode: 'screen',
            filter: `brightness(10) drop-shadow(0 0 6px ${GOLD})`,
            opacity: 0.9,
          }}
        />
      </div>

      {/* Headline */}
      <h2 style={{
        fontFamily: BC, fontWeight: 800, fontSize: 32,
        color: BONE, textTransform: 'uppercase',
        letterSpacing: '2px', lineHeight: 1.15,
        margin: '0 0 6px',
        animation: 'cs-rise 0.5s ease 0.1s both',
      }}>
        Faith Pillar
      </h2>
      <h2 style={{
        fontFamily: BC, fontWeight: 800, fontSize: 32,
        color: GOLD, textTransform: 'uppercase',
        letterSpacing: '2px', lineHeight: 1.15,
        margin: '0 0 28px',
        animation: 'cs-rise 0.5s ease 0.15s both',
      }}>
        Complete.
      </h2>

      {/* Psalm 119:105 */}
      <div style={{
        animation: 'cs-rise 0.5s ease 0.2s both',
        maxWidth: 300,
        marginBottom: 48,
      }}>
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 15, color: '#aaa',
          lineHeight: 1.8, margin: '0 0 8px',
        }}>
          "Your word is a lamp to my feet<br />and a light to my path."
        </p>
        <p style={{
          fontFamily: BC, fontWeight: 700, fontSize: 11,
          letterSpacing: '3px', color: GOLD,
          textTransform: 'uppercase', margin: 0,
        }}>
          — Psalm 119:105
        </p>
      </div>

      {/* Back to morning */}
      <button
        onClick={onDone}
        style={{
          padding: '16px 48px',
          background: GOLD, border: 'none', borderRadius: 4,
          color: '#000',
          fontFamily: BC, fontWeight: 700, fontSize: 16,
          letterSpacing: '2px', textTransform: 'uppercase',
          cursor: 'pointer',
          animation: 'cs-rise 0.5s ease 0.25s both',
        }}
      >
        Back to Morning →
      </button>
    </div>
  )
}
