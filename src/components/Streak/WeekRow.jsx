export default function WeekRow({ days }) {
  return (
    <div className="week-row">
      {days.map(day => (
        <div key={day.date} className="week-day">
          <span className="week-day-label">{day.dayLabel}</span>
          <div
            className={`week-dot ${day.isComplete ? 'week-dot--done' : ''} ${day.isToday ? 'week-dot--today' : ''}`}
          >
            {day.isComplete && <span className="week-dot-check">✓</span>}
          </div>
          <span className={`week-day-num ${day.isToday ? 'week-day-num--today' : ''}`}>
            {day.dayNum}
          </span>
        </div>
      ))}
    </div>
  )
}
