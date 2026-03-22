export default function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img
          src="/pickupyourcross.png"
          alt=""
          style={{ width: 80, height: 80, mixBlendMode: 'screen', display: 'block', margin: '0 auto' }}
        />
        <h1 className="splash-name">FaithBuilt</h1>
        <p className="splash-tagline">FAITH. DISCIPLINE. DAILY.</p>
      </div>
    </div>
  )
}
