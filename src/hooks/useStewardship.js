/**
 * useStewardship — data hook for the Stewardship pillar feature.
 *
 * Reads/writes:
 *   stewardship_logs  — daily money/time intentions and evening reflection
 *   daily_commits     — stewardship_confirmed flipped via partial upsert
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase }     from '../lib/supabase'
import { getLocalDate } from '../lib/dateUtils'
import { MONEY_PROMPTS, TIME_PROMPTS } from '../data/stewardshipPrompts'

export function useStewardship(userId) {
  const [todayLog, setTodayLog] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)

  // ── Fetch today's log on mount ─────────────────────────────────────────────
  const fetchTodayLog = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data } = await supabase
      .from('stewardship_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', getLocalDate())
      .maybeSingle()
    setTodayLog(data ?? null)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchTodayLog() }, [fetchTodayLog])

  // ── saveLedger ─────────────────────────────────────────────────────────────
  // Upserts stewardship_logs + flips stewardship_confirmed on daily_commits.
  async function saveLedger(moneyIntention, timeIntention) {
    if (!userId) return { error: new Error('No user') }
    setSaving(true)
    const today = getLocalDate()

    const { data, error } = await supabase
      .from('stewardship_logs')
      .upsert(
        {
          user_id:         userId,
          log_date:        today,
          money_intention: moneyIntention,
          time_intention:  timeIntention,
          updated_at:      new Date().toISOString(),
        },
        { onConflict: 'user_id,log_date' }
      )
      .select()
      .single()

    if (!error) {
      setTodayLog(data)
      // Partial upsert — only touches stewardship_confirmed
      await supabase
        .from('daily_commits')
        .upsert(
          { user_id: userId, commit_date: today, stewardship_confirmed: true },
          { onConflict: 'user_id,commit_date' }
        )
    }

    setSaving(false)
    return { error: error ?? null }
  }

  // ── saveEveningReflection ──────────────────────────────────────────────────
  // Updates today's stewardship_logs row with evening reckoning data.
  async function saveEveningReflection(moneyHeld, timeHeld, eveningReflection) {
    if (!userId) return { error: new Error('No user') }
    const { data, error } = await supabase
      .from('stewardship_logs')
      .update({
        money_held:         moneyHeld,
        time_held:          timeHeld,
        evening_reflection: eveningReflection,
        updated_at:         new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('log_date', getLocalDate())
      .select()
      .single()
    if (data) setTodayLog(data)
    return { error: error ?? null }
  }

  // ── getSuggestion ──────────────────────────────────────────────────────────
  // Returns a random prompt from the given category that wasn't used in the
  // last 7 days. Falls back to a random prompt from the full pool if all
  // have been recently used.
  async function getSuggestion(category) {
    const { data: recentLogs } = await supabase
      .from('stewardship_logs')
      .select('money_intention, time_intention')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(7)

    const pool  = category === 'money' ? MONEY_PROMPTS : TIME_PROMPTS
    const field = category === 'money' ? 'money_intention' : 'time_intention'

    const recentlyUsed = new Set(
      (recentLogs ?? []).map(l => l[field]).filter(Boolean)
    )
    const candidates = pool.filter(p => !recentlyUsed.has(p))
    const source = candidates.length > 0 ? candidates : pool
    return source[Math.floor(Math.random() * source.length)]
  }

  return {
    todayLog,
    loading,
    saving,
    saveLedger,
    saveEveningReflection,
    getSuggestion,
    refetch: fetchTodayLog,
  }
}
