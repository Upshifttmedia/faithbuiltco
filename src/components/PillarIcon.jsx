/**
 * PillarIcon — inline SVG icons for each of the four pillars.
 *
 * Props:
 *   pillar  — 'faith' | 'body' | 'mind' | 'stewardship'
 *   size    — px dimension (default 20)
 *   color   — fill/stroke color (default gold #C9A84C)
 */
export function PillarIcon({ pillar, size = 20, color = '#C9A84C' }) {
  const s = {
    width: size, height: size,
    display: 'inline-block', verticalAlign: 'middle', flexShrink: 0,
  }
  const sw = Math.max(1.5, size * 0.09) // stroke width scales with size

  if (pillar === 'faith') return (
    // Simple cross: vertical + horizontal bars
    <svg viewBox="0 0 24 24" style={s} fill={color}>
      <rect x="11" y="2" width="2" height="20" />
      <rect x="4"  y="8" width="16" height="2" />
    </svg>
  )

  if (pillar === 'body') return (
    // Running figure: filled head circle + stroked body path
    <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" fill={color} stroke="none" />
      <path d="M8 7l4 4 4-4M12 11v5M9 16l-2 4M15 16l2 4" />
    </svg>
  )

  if (pillar === 'mind') return (
    // Open book with center spine line
    <svg viewBox="0 0 24 24" style={s}>
      <path
        d="M12 6.5C10 4.5 6 4 3 5v13c3-1 7-.5 9 1.5 2-2 6-2.5 9-1.5V5c-3-1-7-.5-9 1.5z"
        fill={color}
      />
      <line x1="12" y1="6.5" x2="12" y2="21" stroke="rgba(0,0,0,0.3)" strokeWidth={Math.max(1, sw * 0.8)} />
    </svg>
  )

  if (pillar === 'stewardship') return (
    // Arrow/hands motif: horizontal arrow + vertical cross-bar
    <svg viewBox="0 0 24 24" style={s} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
      <path d="M20 12H4M4 12l4-4M4 12l4 4" />
      <path d="M12 4v4M12 16v4" />
    </svg>
  )

  return null
}
