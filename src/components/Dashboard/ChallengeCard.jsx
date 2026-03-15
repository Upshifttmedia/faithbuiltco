// Theme + sentence per day of week (0 = Sunday)
const CHALLENGES = [
  {
    theme: 'Posture',
    sentence: 'Stand tall in every room you enter today. Your posture signals your conviction.',
  },
  {
    theme: 'Obedience',
    sentence: 'Do what you said you\'d do — without excuses. Your word is your covenant.',
  },
  {
    theme: 'Discipline',
    sentence: 'The gap between who you are and who you want to be is closed one day at a time.',
  },
  {
    theme: 'Integrity',
    sentence: 'Be the same man in private that you are in public. That\'s where character is forged.',
  },
  {
    theme: 'Responsibility',
    sentence: 'Nothing is someone else\'s fault today. Own every result, no exceptions.',
  },
  {
    theme: 'Standards',
    sentence: 'Don\'t lower the bar to feel comfortable. Raise yourself to meet it.',
  },
  {
    theme: 'Accountability',
    sentence: 'Find someone harder than you and sharpen against them. Iron sharpens iron.',
  },
]

export default function ChallengeCard() {
  const { theme, sentence } = CHALLENGES[new Date().getDay()]

  return (
    <div className="challenge-card">
      <div className="challenge-header">
        <span className="challenge-label">Today's Challenge</span>
        <span className="challenge-theme">{theme}</span>
      </div>
      <p className="challenge-sentence">{sentence}</p>
    </div>
  )
}
