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

const MILESTONES = [7, 14, 21, 30]

// ─────────────────────────────────────────────────────────────────────

export function useStreak(userId) {
  const [streak, setStreak] = useState({
    current_streak:   0,
    longest_streak:   0,
    grace_days_used:  0,
    grace_week_start: null,
    grace_active:     false,
  })
  const [loading, setLoading] = useState(true)

  const fetchStreak = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (data) {
      const today = getLocalDate()
      const gap   = data.last_completed_date
        ? daysBetween(today, data.last_completed_date)
        : 999

      // Reset rules (respects grace_active so a one-day miss with grace
      // applied doesn't get wiped on the next app open):
      //   gap > 2                       → always reset (too many missed days)
      //   gap > 1 && !grace_active      → reset (missed with no grace available)
      //   gap > 1 && grace_active       → do NOT reset (grace covers gap of 2)
      const shouldReset =
        data.current_streak > 0 &&
        (gap > 2 || (gap > 1 && !data.grace_active))

      if (shouldReset) {
        const reset = { ...data, current_streak: 0, grace_active: false }
        setStreak(reset)
        const { data: resetData, error: resetError } = await supabase
          .from('streaks')
          .upsert(
            {
              user_id:        userId,
              current_streak: 0,
              grace_active:   false,
              updated_at:     new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          )
          .select()
      } else {
        setStreak(data)
      }
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchStreak() }, [fetchStreak])

  // ── Legacy updateStreak (kept for any existing callers) ──────────────
  async function updateStreak(allTasksCompleted) {
    if (!userId || !allTasksCompleted) return

    const today     = getLocalDate()
    const yesterday = getLocalDateOffset(1) // eslint-disable-line no-unused-vars

    const { data: existing } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (existing?.last_completed_date === today) return

    let newStreak      = 1
    let graceActive    = false
    let graceWeekStart = existing?.grace_week_start ?? null
    let graceDaysUsed  = existing?.grace_days_used  ?? 0

    if (existing) {
      const gap = daysBetween(today, existing.last_completed_date)

      if (gap === 1) {
        newStreak   = (existing.current_streak || 0) + 1
        graceActive = false
        const thisWeek = isoWeekStart(today)
        if (graceWeekStart !== thisWeek) { graceWeekStart = thisWeek; graceDaysUsed = 0 }
      } else if (gap === 2) {
        const thisWeek       = isoWeekStart(today)
        const graceSameWeek  = graceWeekStart === thisWeek
        const graceAvailable = !graceSameWeek || graceDaysUsed < 1
        if (graceAvailable) {
          newStreak      = (existing.current_streak || 0) + 1
          graceActive    = true
          graceWeekStart = thisWeek
          graceDaysUsed  = graceSameWeek ? graceDaysUsed + 1 : 1
        } else {
          newStreak = 1; graceActive = false
          graceWeekStart = thisWeek; graceDaysUsed = 0
        }
      } else {
        newStreak = 1; graceActive = false
        graceWeekStart = isoWeekStart(today); graceDaysUsed = 0
      }
    }

    const newLongest = Math.max(newStreak, existing?.longest_streak || 0)
    const payload = {
      user_id: userId, current_streak: newStreak, longest_streak: newLongest,
      last_completed_date: today, grace_active: graceActive,
      grace_days_used: graceDaysUsed, grace_week_start: graceWeekStart,
      updated_at: new Date().toISOString(),
    }
    const { data } = await supabase
      .from('streaks').upsert(payload, { onConflict: 'user_id' }).select().single()
    if (data) setStreak(data)
  }

  // ── Evening streak update ────────────────────────────────────────────
  // Called at end of evening reflection with count of confirmed pillars.
  //   confirmedCount 4   → full day  → streak + 1,  grace_active = false
  //   confirmedCount 3   → partial   → streak + 1,  grace_active = true
  //   confirmedCount ≤ 2 → missed    → no increment; first miss sets grace,
  //                                    second consecutive miss resets to 0
  //
  // Returns { newStreak, isMilestone, resultType }
  async function updateStreakFromEvening(confirmedCount) {
    if (!userId) return null

    const today = getLocalDate()

    const { data: existing } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // Guard against double-counting the same day
    if (existing?.last_completed_date === today && confirmedCount >= 3) return {
      newStreak: existing.current_streak,
      isMilestone: false,
      resultType: confirmedCount >= 4 ? 'full' : 'partial',
    }

    const currentStreak  = existing?.current_streak  ?? 0
    const currentLongest = existing?.longest_streak  ?? 0
    const graceWasActive = existing?.grace_active     ?? false

    let newStreak   = currentStreak
    let graceActive = graceWasActive
    let lastDate    = existing?.last_completed_date ?? null
    let resultType

    if (confirmedCount >= 4) {
      // Full day
      newStreak   = currentStreak + 1
      graceActive = false
      lastDate    = today
      resultType  = 'full'
    } else if (confirmedCount === 3) {
      // Partial — still counts, grace noted
      newStreak   = currentStreak + 1
      graceActive = true
      lastDate    = today
      resultType  = 'partial'
    } else {
      // Missed (≤ 2 pillars)
      resultType = 'missed'
      if (graceWasActive) {
        // Second consecutive miss — reset
        newStreak   = 0
        graceActive = false
      } else {
        // First miss — apply grace, preserve streak, don't update lastDate
        graceActive = true
        // newStreak and lastDate unchanged
      }
    }

    const newLongest = Math.max(newStreak, currentLongest)

    const payload = {
      user_id:             userId,
      current_streak:      newStreak,
      longest_streak:      newLongest,
      last_completed_date: lastDate,
      grace_active:        graceActive,
      updated_at:          new Date().toISOString(),
    }

    const { data } = await supabase
      .from('streaks')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (data) setStreak(data)

    const isMilestone = MILESTONES.includes(newStreak)
    return { newStreak, isMilestone, resultType }
  }

  return { streak, loading, updateStreak, updateStreakFromEvening, refetch: fetchStreak }
}
