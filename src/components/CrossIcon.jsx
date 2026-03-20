/**
 * CrossIcon — minimal geometric silhouette of a figure carrying a cross.
 * Accepts `size` (default 24) and `color` (default 'white') props.
 */
export default function CrossIcon({ size = 24, color = 'white' }) {
  // ViewBox 0 0 20 26 — figure on the left, cross extending right + up/down
  const scale = size / 20

  return (
    <svg
      viewBox="0 0 20 26"
      width={20 * scale}
      height={26 * scale}
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Head */}
      <circle cx="6" cy="3.5" r="2" fill={color} stroke="none" />

      {/* Body */}
      <line x1="6" y1="5.5" x2="6" y2="16" />

      {/* Left arm */}
      <line x1="6" y1="10" x2="3" y2="13" />

      {/* Right arm — reaches to cross shaft */}
      <line x1="6" y1="10" x2="13" y2="10" />

      {/* Legs */}
      <line x1="6" y1="16" x2="4" y2="23" />
      <line x1="6" y1="16" x2="8" y2="23" />

      {/* Cross — vertical shaft */}
      <line x1="13" y1="4" x2="13" y2="25" />

      {/* Cross — horizontal beam */}
      <line x1="10" y1="8.5" x2="16" y2="8.5" />
    </svg>
  )
}
