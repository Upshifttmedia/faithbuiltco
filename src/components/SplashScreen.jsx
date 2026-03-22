export default function SplashScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999,
      background: `linear-gradient(rgba(0,0,0,0.60), rgba(0,0,0,0.60)), url('/bg-splash.jpg') center / cover no-repeat`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 32px',
      }}>
        {/* Cross icon */}
        <img
          src="/pickupyourcross.png"
          alt=""
          style={{
            width: 60,
            height: 60,
            display: 'block',
            mixBlendMode: 'screen',
            filter: 'brightness(10) drop-shadow(0 0 8px #C9A84C)',
            opacity: 0.6,
            marginBottom: 16,
          }}
        />

        {/* FaithBuilt */}
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 42,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '2px',
          margin: 0,
          lineHeight: 1,
        }}>
          FaithBuilt
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 13,
          fontWeight: 400,
          color: '#C9A84C',
          letterSpacing: '4px',
          margin: '12px 0 0',
        }}>
          FAITH. DISCIPLINE. DAILY.
        </p>
      </div>
    </div>
  )
}
