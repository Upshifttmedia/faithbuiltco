const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function CalendarGrid({ calendarDays }) {
  if (!calendarDays || calendarDays.length === 0) return null

  // Group into weeks of 7 for a proper calendar feel, but we'll just
  // display 30 dots in a 6-column grid for compactness
  const completedCount = calendarDays.filter(d => d.isComplete).length

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <span className="calendar-title">30-Day Record</span>
        <span className="calendar-stat">
          <span className="calendar-stat-num">{completedCount}</span>
          <span className="calendar-stat-label"> / 30 complete</span>
        </span>
      </div>

      <div className="calendar-grid">
        {calendarDays.map(day => (
          <div
            key={day.date}
            className={[
              'cal-dot',
              day.isComplete  ? 'cal-dot--done'  : '',
              day.isToday     ? 'cal-dot--today' : '',
            ].join(' ')}
            title={`${MONTH_ABBR[day.month]} ${day.dayNum}${day.isComplete ? ' ✓' : ''}`}
          >
            <span className="cal-dot-num">{day.dayNum}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
