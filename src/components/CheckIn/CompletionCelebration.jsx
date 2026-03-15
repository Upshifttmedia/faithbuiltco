import { useEffect, useState } from 'react'

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  angle: (i / 24) * 360,
  delay: `${i * 30}ms`,
  size: Math.random() * 6 + 4,
  dist: Math.random() * 50 + 60,
}))

// Motivational messages that rotate by day of week
const COMPLETION_MESSAGES = [
  "You showed up when it counted. That's who you are.",
  "Consistency compounds. Keep building.",
  "Today's discipline is tomorrow's advantage.",
  "The man who does the work becomes the man he wants to be.",
  "Accountability kept. Alignment achieved.",
  "You didn't negotiate with yourself today. That's power.",
  "Iron sharpened. See you tomorrow.",
]

export default function CompletionCelebration({ streak, verse, onBack }) {
  const [visible, setVisible] = useState(false)
  const message = COMPLETION_MESSAGES[new Date().getDay()]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`celebration celebration--fullscreen ${visible ? 'celebration--in' : ''}`}>

      {/* Particle burst */}
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

      {/* Gold animated checkmark */}
      <div className="celebration-check-wrap">
        <svg className="celebration-check-svg" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" stroke="#C9A84C" strokeWidth="2" fill="rgba(201,168,76,0.08)" />
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

      {/* Streak badge */}
      {streak > 0 && (
        <div className="celebration-streak">
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{streak}</span>
          <span className="streak-label">day streak</span>
        </div>
      )}

      {/* Motivational message */}
      <p className="celebration-message">{message}</p>

      {/* Today's Scripture verse in gold */}
      {verse && (
        <div className="celebration-verse-block">
          <p className="celebration-verse-text">"{verse.text}"</p>
          <p className="celebration-verse-ref">— {verse.ref}</p>
        </div>
      )}

      <button className="btn-primary celebration-back-btn" onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
  )
}
