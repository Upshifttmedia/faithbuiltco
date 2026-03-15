import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useStreak(userId) {
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 })
  const [loading, setLoading] = useState(true)

  const fetchStreak = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (data) setStreak(data)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchStreak()
  }, [fetchStreak])

  async function updateStreak(allTasksCompleted) {
    if (!userId || !allTasksCompleted) return

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const { data: existing } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    let newStreak = 1
    if (existing) {
      if (existing.last_completed_date === today) return // already counted today
      if (existing.last_completed_date === yesterday) {
        newStreak = (existing.current_streak || 0) + 1
      }
    }

    const newLongest = Math.max(newStreak, existing?.longest_streak || 0)

    const { data } = await supabase
      .from('streaks')
      .upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: newLongest,
        last_completed_date: today,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single()

    if (data) setStreak(data)
  }

  return { streak, loading, updateStreak, refetch: fetchStreak }
}
