const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function CalendarGrid({ calendarDays }) {
  if (!calendarDays || calendarDays.length === 0) return null

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
        {calendarDays.map(day => {
          const pc = day.pillarsComplete ?? 0
          const tooltipSuffix = day.isComplete
            ? ' ✓'
            : pc > 0 ? ` (${pc}/4)` : ''

          return (
            <div
              key={day.date}
              className={[
                'cal-dot',
                day.isComplete      ? 'cal-dot--done'    : '',
                !day.isComplete && pc > 0 ? 'cal-dot--partial' : '',
                day.isToday         ? 'cal-dot--today'   : '',
              ].filter(Boolean).join(' ')}
              title={`${MONTH_ABBR[day.month]} ${day.dayNum}${tooltipSuffix}`}
            >
              <span className="cal-dot-num">{day.dayNum}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
