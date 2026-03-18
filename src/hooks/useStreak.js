import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getLocalDate, getLocalDateOffset } from '../lib/dateUtils'

// ── Date helpers ─────────────────────────────────────────────────────

/** Calendar days between two local date strings (later - earlier) */
function daysBetween(laterStr, earlierStr) {
  const a = new Date(laterStr  + 'T12:00:00')
  const b = new Date(earlierStr + 'T12:00:00')
  return Math.round((a - b) / 86400000)
}

/** ISO week Monday for a local date string ("YYYY-MM-DD") */
function isoWeekStart(dateStr) {
  const d   = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()                       // 0 = Sun
  const diff = day === 0 ? -6 : 1 - day        // shift to Monday
  const mon  = new Date(d)
  mon.setDate(d.getDate() + diff)
  const y  = mon.getFullYear()
  const m  = String(mon.getMonth() + 1).padStart(2, '0')
  const dd = String(mon.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// ─────────────────────────────────────────────────────────────────────

export function useStreak(userId) {
  const [streak, setStreak] = useState({
    current_streak:  0,
    longest_streak:  0,
    grace_days_used: 0,
    grace_week_start: null,
    grace_active:    false,
  })
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

  useEffect(() => { fetchStreak() }, [fetchStreak])

  async function updateStreak(allTasksCompleted) {
    if (!userId || !allTasksCompleted) return

    const today     = getLocalDate()
    const yesterday = getLocalDateOffset(1)

    const { data: existing } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Already counted today
    if (existing?.last_completed_date === today) return

    let newStreak      = 1
    let graceActive    = false
    let graceWeekStart = existing?.grace_week_start ?? null
    let graceDaysUsed  = existing?.grace_days_used  ?? 0

    if (existing) {
      const gap = daysBetween(today, existing.last_completed_date)

      if (gap === 1) {
        // ── Normal consecutive day ───────────────────────────────────
        newStreak   = (existing.current_streak || 0) + 1
        graceActive = false
        // Reset grace counter if new week started
        const thisWeek = isoWeekStart(today)
        if (graceWeekStart !== thisWeek) {
          graceWeekStart = thisWeek
          graceDaysUsed  = 0
        }
      } else if (gap === 2) {
        // ── Missed exactly 1 day — check grace ──────────────────────
        const thisWeek       = isoWeekStart(today)
        const graceSameWeek  = graceWeekStart === thisWeek
        const graceAvailable = !graceSameWeek || graceDaysUsed < 1

        if (graceAvailable) {
          // Protect the streak with a grace day
          newStreak      = (existing.current_streak || 0) + 1
          graceActive    = true
          graceWeekStart = thisWeek
          graceDaysUsed  = graceSameWeek ? graceDaysUsed + 1 : 1
        } else {
          // Grace already used this week — streak resets
          newStreak      = 1
          graceActive    = false
          graceWeekStart = thisWeek
          graceDaysUsed  = 0
        }
      } else {
        // ── Gap > 2 days — full reset ────────────────────────────────
        newStreak      = 1
        graceActive    = false
        graceWeekStart = isoWeekStart(today)
        graceDaysUsed  = 0
      }
    }

    const newLongest = Math.max(newStreak, existing?.longest_streak || 0)

    const payload = {
      user_id:             userId,
      current_streak:      newStreak,
      longest_streak:      newLongest,
      last_completed_date: today,
      grace_active:        graceActive,
      grace_days_used:     graceDaysUsed,
      grace_week_start:    graceWeekStart,
      updated_at:          new Date().toISOString(),
    }

    const { data } = await supabase
      .from('streaks')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (data) setStreak(data)
  }

  return { streak, loading, updateStreak, refetch: fetchStreak }
}
