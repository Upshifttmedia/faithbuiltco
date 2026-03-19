import { useEffect, useRef } from 'react'
import { useCheckIn, PILLARS } from '../hooks/useCheckIn'
import { useStreak } from '../hooks/useStreak'
import PillarCard from '../components/CheckIn/PillarCard'
import CompletionCelebration from '../components/CheckIn/CompletionCelebration'
import StreakCounter from '../components/Streak/StreakCounter'
import ReflectionJournal from '../components/Journal/ReflectionJournal'

// One verse per day of week (0 = Sunday … 6 = Saturday)
export const DAILY_VERSES = [
  {
    text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    ref: 'Proverbs 3:5–6',
  },
  {
    text: 'Do not merely listen to the word, and so deceive yourselves. Do what it says.',
    ref: 'James 1:22',
  },
  {
    text: 'No discipline seems pleasant at the time, but painful. Later on, however, it produces a harvest of righteousness and peace for those who have been trained by it.',
    ref: 'Hebrews 12:11',
  },
  {
    text: 'Whoever walks in integrity walks securely, but whoever takes crooked paths will be found out.',
    ref: 'Proverbs 10:9',
  },
  {
    text: 'Each one should carry their own load.',
    ref: 'Galatians 6:5',
  },
  {
    text: 'Be very careful, then, how you live — not as unwise but as wise, making the most of every opportunity, because the days are evil.',
    ref: 'Ephesians 5:15–16',
  },
  {
    text: 'As iron sharpens iron, so one person sharpens another.',
    ref: 'Proverbs 27:17',
  },
]

const todayVerse = DAILY_VERSES[new Date().getDay()]

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

export default function DailyCheckIn({ navigate, userId, onAllComplete }) {
  const { completions, loading, toggleTask, allCompleted, completedCount, totalCount } = useCheckIn(userId)
  const { streak, updateStreak } = useStreak(userId)
  const completeFiredRef = useRef(false)

  useEffect(() => {
    if (allCompleted) {
      updateStreak(true)
      // Fire onAllComplete exactly once per session (triggers notification prompt)
      if (!completeFiredRef.current) {
        completeFiredRef.current = true
        onAllComplete?.()
      }
    }
  }, [allCompleted]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="loader-screen">
        <div className="loader-icon">✦</div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      {/* Top bar */}
      <header className="top-bar">
        <button className="back-btn" onClick={() => navigate('dashboard')} aria-label="Back to dashboard">
          ← Dashboard
        </button>
        <div className="brand">
          <span className="brand-mark">✦</span>
        </div>
      </header>

      <main className="main-content">
        {/* Date */}
        <div className="date-row">
          <p className="today-date">{todayLabel}</p>
        </div>

        {/* Daily Scripture Verse — always visible */}
        <div className="verse-card">
          <p className="verse-text">"{todayVerse.text}"</p>
          <p className="verse-reference">— {todayVerse.ref}</p>
        </div>

        {/* Streak ring */}
        <StreakCounter
          streak={streak}
          completedCount={completedCount}
          totalCount={totalCount}
        />

        {/* Full celebration screen when all pillars done */}
        {allCompleted ? (
          <CompletionCelebration
            streak={streak.current_streak}
            verse={todayVerse}
            onBack={() => navigate('dashboard')}
          />
        ) : (
          <>
            <h2 className="section-heading">Show Up Across All Four</h2>
            <div className="pillars-grid">
              {PILLARS.map(pillar => (
                <PillarCard
                  key={pillar.key}
                  pillar={pillar}
                  completions={completions}
                  onToggle={toggleTask}
                  userId={userId}
                />
              ))}
            </div>
          </>
        )}

        {/* Journal always visible */}
        <ReflectionJournal userId={userId} />
      </main>
    </div>
  )
}
