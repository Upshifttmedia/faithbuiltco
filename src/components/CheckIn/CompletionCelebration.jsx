import { useEffect, useState, useCallback } from 'react'

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  angle: (i / 24) * 360,
  delay: `${i * 30}ms`,
  size: Math.random() * 6 + 4,
  dist: Math.random() * 50 + 60,
}))

const COMPLETION_MESSAGES = [
  "You showed up when it counted. That's who you are.",
  "Consistency compounds. Keep building.",
  "Today's discipline is tomorrow's advantage.",
  "The man who does the work becomes the man he wants to be.",
  "Accountability kept. Alignment achieved.",
  "You didn't negotiate with yourself today. That's power.",
  "Iron sharpened. See you tomorrow.",
]

// Draw a 1080×1920 share card and return as PNG Blob
async function buildShareCard(streakCount) {
  const W = 1080, H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#0F0D0A'
  ctx.fillRect(0, 0, W, H)

  ctx.textAlign = 'center'

  // Logo mark
  ctx.font = 'bold 120px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#C9A84C'
  ctx.fillText('\u2726', W / 2, 420)

  // App name
  ctx.font = 'bold 96px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#F0EAD6'
  ctx.fillText('FaithBuilt', W / 2, 560)

  // Divider
  ctx.strokeStyle = '#2A2520'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(200, 620)
  ctx.lineTo(880, 620)
  ctx.stroke()

  // Streak number
  ctx.font = 'bold 260px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#C9A84C'
  ctx.fillText(String(streakCount), W / 2, 960)

  // Day streak label
  ctx.font = '72px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#8A6E2F'
  ctx.fillText('day streak', W / 2, 1060)

  // Tagline
  ctx.font = 'italic 60px Georgia, serif'
  ctx.fillStyle = '#C9A84C'
  ctx.fillText('\u201cAlignment is built daily.\u201d', W / 2, 1240)

  // Sub
  ctx.font = '52px -apple-system, system-ui, sans-serif'
  ctx.fillStyle = '#7A7060'
  ctx.fillText('Faith. Discipline. Structure.', W / 2, 1360)

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

export default function CompletionCelebration({ streak, verse, onBack }) {
  const [visible, setVisible]       = useState(false)
  const [shareState, setShareState] = useState('idle') // 'idle' | 'loading' | 'copied'
  const message = COMPLETION_MESSAGES[new Date().getDay()]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const handleShare = useCallback(async () => {
    setShareState('loading')
    try {
      const blob = await buildShareCard(streak)
      const file = new File([blob], 'faithbuilt-streak.png', { type: 'image/png' })

      // Try native share with image file (works on iOS 15+ / Android — shows Instagram)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'FaithBuilt',
          text: `\uD83D\uDD25 ${streak} day streak \u2014 Alignment is built daily.` })
        setShareState('idle')
        return
      }

      // Text-only share (no image, still pops native sheet)
      if (navigator.share) {
        await navigator.share({ title: 'FaithBuilt',
          text: `\uD83D\uDD25 ${streak} day streak on FaithBuilt\n"Alignment is built daily."\n\nFaith. Discipline. Structure.` })
        setShareState('idle')
        return
      }

      // Desktop fallback: download image + copy text
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'faithbuilt-streak.png'
      a.click()
      URL.revokeObjectURL(url)
      await navigator.clipboard.writeText(
        `\uD83D\uDD25 ${streak} day streak on FaithBuilt \u2014 Alignment is built daily.`)
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 2500)
    } catch {
      setShareState('idle')
    }
  }, [streak])

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

      <h2 className="celebration-title">You Showed Up.</h2>
      <p className="celebration-tagline">Alignment is built daily.</p>

      {streak > 0 && (
        <div className="celebration-streak">
          <span className="streak-flame">🔥</span>
          <span className="streak-count">{streak}</span>
          <span className="streak-label">day streak</span>
        </div>
      )}

      <p className="celebration-message">{message}</p>

      {verse && (
        <div className="celebration-verse-block">
          <p className="celebration-verse-text">"{verse.text}"</p>
          <p className="celebration-verse-ref">— {verse.ref}</p>
        </div>
      )}

      {/* Share button */}
      <button
        className={`btn-share${shareState === 'loading' ? ' btn-share--loading' : ''}`}
        onClick={handleShare}
        disabled={shareState === 'loading'}
      >
        {shareState === 'copied'
          ? '✓ Image saved & text copied'
          : shareState === 'loading'
          ? 'Preparing…'
          : '↑ Share your streak'}
      </button>

      <button className="btn-primary celebration-back-btn" onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
  )
}
