import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TOTAL_TASKS = 8 // 4 pillars × 2 tasks

function buildLastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().split('T')[0],
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.getMonth(),
      isToday: i === 0,
      isComplete: false,
    })
  }
  return days
}

export function useHistory(userId) {
  const [days, setDays] = useState(() => buildLastNDays(7))
  const [calendarDays, setCalendarDays] = useState(() => buildLastNDays(30))
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    if (!userId) return

    // Fetch 30 days in one query
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    const from = thirtyDaysAgo.toISOString().split('T')[0]

    const { data } = await supabase
      .from('daily_completions')
      .select('completion_date')
      .eq('user_id', userId)
      .eq('completed', true)
      .gte('completion_date', from)

    // Count completed tasks per date
    const countByDate = {}
    if (data) {
      data.forEach(row => {
        countByDate[row.completion_date] = (countByDate[row.completion_date] || 0) + 1
      })
    }

    const isComplete = date => (countByDate[date] || 0) >= TOTAL_TASKS

    // 7-day array (for WeekRow + History page)
    const updated7 = buildLastNDays(7).map(d => ({ ...d, isComplete: isComplete(d.date) }))
    setDays(updated7)

    // 30-day array (for CalendarGrid on dashboard)
    const updated30 = buildLastNDays(30).map(d => ({ ...d, isComplete: isComplete(d.date) }))
    setCalendarDays(updated30)

    // Total all-time completed days (one extra query for older data)
    const { data: allData } = await supabase
      .from('daily_completions')
      .select('completion_date')
      .eq('user_id', userId)
      .eq('completed', true)
      .lt('completion_date', from) // older than 30 days

    const oldCounts = {}
    if (allData) {
      allData.forEach(row => {
        oldCounts[row.completion_date] = (oldCounts[row.completion_date] || 0) + 1
      })
    }

    const oldTotal = Object.values(oldCounts).filter(c => c >= TOTAL_TASKS).length
    const recentTotal = Object.values(countByDate).filter(c => c >= TOTAL_TASKS).length
    setTotalCompleted(oldTotal + recentTotal)

    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { days, calendarDays, totalCompleted, loading, refetch: fetchHistory }
}
