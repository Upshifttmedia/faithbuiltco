/**
 * ArmorShield — SVG shield split into 4 quadrants, one per pillar.
 * Empty quadrant: dark fill #1a1a1a, muted icon #444.
 * Filled quadrant: gold gradient, bright gold icon #FFD700.
 * When all 4 are confirmed the shield border pulses gold.
 */
export default function ArmorShield({
  faithConfirmed       = false,
  bodyConfirmed        = false,
  mindConfirmed        = false,
  stewardshipConfirmed = false,
}) {
  const allFour = faithConfirmed && bodyConfirmed && mindConfirmed && stewardshipConfirmed

  const confirmed = {
    faith:       faithConfirmed,
    body:        bodyConfirmed,
    mind:        mindConfirmed,
    stewardship: stewardshipConfirmed,
  }

  // Quadrant: clip rect + icon center position
  // viewBox 0 0 200 240; shield lives from roughly x=15…185, y=8…228
  // Vertical split at x=100, horizontal split at y=120
  const quadrants = [
    { key: 'faith',       icon: '✦', x: 0,   y: 0,   w: 100, h: 120, cx: 58,  cy: 66  },
    { key: 'body',        icon: '⚡', x: 100, y: 0,   w: 100, h: 120, cx: 142, cy: 66  },
    { key: 'mind',        icon: '◆', x: 0,   y: 120, w: 100, h: 120, cx: 58,  cy: 172 },
    { key: 'stewardship', icon: '◆', x: 100, y: 120, w: 100, h: 120, cx: 142, cy: 172 },
  ]

  const SHIELD = 'M 100 8 L 185 38 L 185 148 C 185 196 100 228 100 228 C 100 228 15 196 15 148 L 15 38 Z'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0 8px' }}>
      <style>{`
        @keyframes shield-glow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(201,168,76,0.5)); }
          50%       { filter: drop-shadow(0 0 18px rgba(201,168,76,0.95)); }
        }
      `}</style>

      <svg
        viewBox="0 0 200 240"
        width="200"
        height="240"
        style={{
          animation:  allFour ? 'shield-glow 1.8s ease-in-out infinite' : 'none',
          transition: 'filter 0.4s ease',
          overflow:   'visible',
        }}
        aria-label="Armor Shield"
      >
        <defs>
          {/* Shield clip applied to all quadrant rects */}
          <clipPath id="shield-clip">
            <path d={SHIELD} />
          </clipPath>

          {/* Gold fill gradient */}
          <linearGradient id="gold-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#8B6914" />
          </linearGradient>
        </defs>

        {/* Shield background */}
        <path d={SHIELD} fill="#0d0d0d" />

        {/* Quadrant fills — clipped to shield shape */}
        {quadrants.map(q => (
          <rect
            key={q.key}
            x={q.x} y={q.y} width={q.w} height={q.h}
            fill={confirmed[q.key] ? 'url(#gold-grad)' : '#1a1a1a'}
            clipPath="url(#shield-clip)"
            style={{ transition: 'fill 0.35s ease' }}
          />
        ))}

        {/* Dividers — drawn inside clip so they don't poke outside shield */}
        <g clipPath="url(#shield-clip)">
          {/* Vertical centre */}
          <line x1="100" y1="8" x2="100" y2="228" stroke="#0d0d0d" strokeWidth="2.5" />
          {/* Horizontal centre */}
          <line x1="15" y1="120" x2="185" y2="120" stroke="#0d0d0d" strokeWidth="2.5" />
        </g>

        {/* Pillar icons */}
        {quadrants.map(q => (
          <text
            key={q.key + '-icon'}
            x={q.cx} y={q.cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="26"
            fill={confirmed[q.key] ? '#FFD700' : '#3a3a3a'}
            style={{ transition: 'fill 0.35s ease', userSelect: 'none' }}
          >
            {q.icon}
          </text>
        ))}

        {/* Shield border — thickens and turns gold when all four confirmed */}
        <path
          d={SHIELD}
          fill="none"
          stroke={allFour ? '#C9A84C' : '#2a2a2a'}
          strokeWidth={allFour ? 3 : 1.5}
          style={{ transition: 'stroke 0.4s ease, stroke-width 0.4s ease' }}
        />
      </svg>

      {/* Confirmed count label */}
      <p style={{
        margin: '4px 0 0',
        fontSize: 12,
        color: allFour ? '#C9A84C' : '#444',
        letterSpacing: 1,
        fontWeight: 600,
        textTransform: 'uppercase',
        transition: 'color 0.3s ease',
      }}>
        {[faithConfirmed, bodyConfirmed, mindConfirmed, stewardshipConfirmed].filter(Boolean).length} / 4 confirmed
      </p>

    </div>
  )
}
