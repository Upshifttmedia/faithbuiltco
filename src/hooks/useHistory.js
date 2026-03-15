import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TOTAL_TASKS = 8 // 4 pillars × 2 tasks

function buildLast7Days() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({
      date: d.toISOString().split('T')[0],
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      isToday: i === 0,
      isComplete: false,
    })
  }
  return days
}

export function useHistory(userId) {
  const [days, setDays] = useState(buildLast7Days)
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    if (!userId) return

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    const from = sevenDaysAgo.toISOString().split('T')[0]

    // Fetch all completed tasks in the last 7 days
    const { data } = await supabase
      .from('daily_completions')
      .select('completion_date, task_key')
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

    const updatedDays = buildLast7Days().map(day => ({
      ...day,
      isComplete: (countByDate[day.date] || 0) >= TOTAL_TASKS,
    }))
    setDays(updatedDays)

    // Total all-time completed days
    const { data: allData } = await supabase
      .from('daily_completions')
      .select('completion_date, task_key')
      .eq('user_id', userId)
      .eq('completed', true)

    const allCounts = {}
    if (allData) {
      allData.forEach(row => {
        allCounts[row.completion_date] = (allCounts[row.completion_date] || 0) + 1
      })
    }
    const total = Object.values(allCounts).filter(c => c >= TOTAL_TASKS).length
    setTotalCompleted(total)

    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { days, totalCompleted, loading, refetch: fetchHistory }
}
