export default function StreakCounter({ streak, completedCount, totalCount }) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="streak-bar">
      <div className="streak-left">
        <span className="streak-flame">🔥</span>
        <div>
          <span className="streak-number">{streak.current_streak}</span>
          <span className="streak-unit"> day streak</span>
        </div>
      </div>

      <div className="streak-right">
        <div className="day-progress-wrap">
          <svg className="day-progress-ring" viewBox="0 0 44 44">
            <circle
              cx="22" cy="22" r="18"
              fill="none"
              stroke="#1E1B15"
              strokeWidth="4"
            />
            <circle
              cx="22" cy="22" r="18"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 18}`}
              strokeDashoffset={`${2 * Math.PI * 18 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 22 22)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <span className="day-progress-pct">{pct}%</span>
        </div>
        <span className="day-progress-label">today</span>
      </div>
    </div>
  )
}
