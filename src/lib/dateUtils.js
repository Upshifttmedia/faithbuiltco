/**
 * All date operations use LOCAL timezone to prevent tasks from bleeding
 * across day boundaries when the user is in a non-UTC timezone.
 *
 * NEVER use new Date().toISOString().split('T')[0] for completion_date —
 * that returns the UTC date which can differ from the user's local date.
 */

/** Returns "YYYY-MM-DD" in the user's LOCAL timezone */
export function getLocalDate(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns local date string for N days ago (0 = today, 1 = yesterday, …) */
export function getLocalDateOffset(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return getLocalDate(d)
}

/**
 * Builds an array of the last N days (oldest first, newest last).
 * Each entry has: date (local YYYY-MM-DD), dayLabel, dayNum, month, isToday
 */
export function buildLastNLocalDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: getLocalDate(d),
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.getMonth(),
      isToday: i === 0,
      isComplete: false,
      pillarsComplete: 0,
    })
  }
  return days
}
