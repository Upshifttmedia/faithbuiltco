import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { buildLastNLocalDays, getLocalDateOffset } from '../lib/dateUtils'

const TOTAL_TASKS  = 8  // 4 pillars × 2 tasks
const TOTAL_PILLARS = 4

// Count how many pillars have both tasks completed on a given date
function pillarsCompleteForDate(rows, date) {
  // rows: array of { completion_date, pillar, completed }
  const dayRows = rows.filter(r => r.completion_date === date && r.completed === true)
  const pillarTaskCount = {}
  dayRows.forEach(r => {
    pillarTaskCount[r.pillar] = (pillarTaskCount[r.pillar] || 0) + 1
  })
  // A pillar is complete when both its tasks are done (count === 2)
  return Object.values(pillarTaskCount).filter(c => c >= 2).length
}

export function useHistory(userId) {
  const [days, setDays]               = useState(() => buildLastNLocalDays(7))
  const [calendarDays, setCalendarDays] = useState(() => buildLastNLocalDays(30))
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [loading, setLoading]         = useState(true)

  const fetchHistory = useCallback(async () => {
    if (!userId) return

    // ✅ LOCAL date so range matches the user's timezone
    const from = getLocalDateOffset(29)

    const { data } = await supabase
      .from('daily_completions')
      .select('completion_date, pillar, completed')
      .eq('user_id', userId)
      .gte('completion_date', from)

    const rows = data || []

    // Per-date helpers
    const taskCountByDate    = {}
    rows.filter(r => r.completed === true).forEach(r => {
      taskCountByDate[r.completion_date] = (taskCountByDate[r.completion_date] || 0) + 1
    })

    const isComplete       = date => (taskCountByDate[date] || 0) >= TOTAL_TASKS
    const pillarsComplete  = date => pillarsCompleteForDate(rows, date)

    // 7-day array (WeekRow + History page)
    const updated7 = buildLastNLocalDays(7).map(d => ({
      ...d,
      isComplete:     isComplete(d.date),
      pillarsComplete: pillarsComplete(d.date),
    }))
    setDays(updated7)

    // 30-day array (CalendarGrid on dashboard)
    const updated30 = buildLastNLocalDays(30).map(d => ({
      ...d,
      isComplete:     isComplete(d.date),
      pillarsComplete: pillarsComplete(d.date),
    }))
    setCalendarDays(updated30)

    // All-time completed days (older than 30-day window)
    const { data: allData } = await supabase
      .from('daily_completions')
      .select('completion_date')
      .eq('user_id', userId)
      .eq('completed', true)
      .lt('completion_date', from)

    const oldCounts = {}
    if (allData) {
      allData.forEach(r => {
        oldCounts[r.completion_date] = (oldCounts[r.completion_date] || 0) + 1
      })
    }

    const oldTotal    = Object.values(oldCounts).filter(c => c >= TOTAL_TASKS).length
    const recentTotal = Object.values(taskCountByDate).filter(c => c >= TOTAL_TASKS).length
    setTotalCompleted(oldTotal + recentTotal)

    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { days, calendarDays, totalCompleted, loading, refetch: fetchHistory }
}
