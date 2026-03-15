// One punchy phrase per day of week (0 = Sunday)
const BANNERS = [
  'Drift ends today.',
  'The grind is the grace.',
  'Standards, not moods.',
  'Integrity when no one\'s watching.',
  'Own every outcome.',
  'The disciplined always win.',
  'Build the man. Build the life.',
]

export default function MotivationalBanner() {
  const phrase = BANNERS[new Date().getDay()]

  return (
    <div className="motivational-banner">
      <span className="banner-mark">✦</span>
      <p className="banner-phrase">{phrase}</p>
    </div>
  )
}
