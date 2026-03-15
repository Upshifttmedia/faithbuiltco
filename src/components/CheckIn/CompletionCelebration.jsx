import { useEffect, useState } from 'react'

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  angle: (i / 20) * 360,
  delay: (i * 35) + 'ms',
  size: Math.random() * 7 + 4,
  dist: Math.random() * 40 + 55,
}))

export default function CompletionCelebration({ streak, onBack }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`celebration ${visible ? 'celebration--in' : ''}`}>
      {/* Burst particles */}
      <div className="celebration-burst" aria-hidden="true">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="burst-particle"
            style={{
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              '--angle': `${p.angle}deg`,
              '--dist': `${p.dist}px`,
            }}
          />
        ))}
      </div>

      {/* Animated gold checkmark */}
      <div className="celebration-check-wrap">
        <svg className="celebration-check-svg" viewBox="0 0 80 80" fill="none">
          <circle
            cx="40" cy="40" r="38"
            stroke="#C9A84C"
            strokeWidth="2"
            fill="rgba(201,168,76,0.08)"
          />
          <path
            d="M22 40 L34 52 L58 28"
            stroke="#C9A84C"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check-path"
          />
        </svg>
      </div>

      <h2 className="celebration-title">Congratulations</h2>

      <p className="celebration-tagline">Alignment is built daily.</p>

      <p className="celebration-message">
        All four pillars complete. You showed up fully today.
      </p>

      {streak > 0 && (
        <div className="celebration-streak">
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{streak}</span>
          <span className="streak-label">day streak</span>
        </div>
      )}

      <button className="btn-primary celebration-back-btn" onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
  )
}
