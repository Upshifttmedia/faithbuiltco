/**
 * useDailyCommit — primary data hook for the new daily loop.
 *
 * Reads/writes to the daily_commits table which has:
 *   user_id, commit_date, faith_commitment, body_commitment,
 *   mind_commitment, stewardship_commitment, morning_done,
 *   evening_done, faith_confirmed, body_confirmed,
 *   mind_confirmed, stewardship_confirmed
 *
 * Requires a unique constraint on (user_id, commit_date) for upsert.
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getLocalDate, getLocalDateOffset } from '../lib/dateUtils'

export function useDailyCommit(userId) {
  const [commit, setCommit]               = useState(null)   // today
  const [yesterdayCommit, setYesterday]   = useState(null)   // yesterday
  const [loading, setLoading]             = useState(true)

  const fetchCommit = useCallback(async () => {
    if (!userId) { setLoading(false); return }

    const today     = getLocalDate()
    const yesterday = getLocalDateOffset(1)

    const [{ data: todayData }, { data: ydayData }] = await Promise.all([
      supabase
        .from('daily_commits').select('*')
        .eq('user_id', userId).eq('commit_date', today).maybeSingle(),
      supabase
        .from('daily_commits').select('*')
        .eq('user_id', userId).eq('commit_date', yesterday).maybeSingle(),
    ])

    setCommit(todayData   ?? null)
    setYesterday(ydayData ?? null)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchCommit() }, [fetchCommit])

  // ── Morning commit ───────────────────────────────────────────────────
  async function saveMorning({ faith, body, mind, stewardship }) {
    if (!userId) return { error: new Error('No user') }

    const today = getLocalDate()
    const { data, error } = await supabase
      .from('daily_commits')
      .upsert(
        {
          user_id:               userId,
          commit_date:           today,
          faith_commitment:      faith?.trim()       ?? '',
          body_commitment:       body?.trim()        ?? '',
          mind_commitment:       mind?.trim()        ?? '',
          stewardship_commitment: stewardship?.trim() ?? '',
          morning_done:          true,
        },
        { onConflict: 'user_id,commit_date' }
      )
      .select()
      .single()

    if (data) setCommit(data)
    return { data, error }
  }

  // ── Per-pillar confirmation during the day ───────────────────────────
  async function confirmPillar(pillarKey) {
    if (!userId) return null

    const today = getLocalDate()
    const { data } = await supabase
      .from('daily_commits')
      .update({ [`${pillarKey}_confirmed`]: true })
      .eq('user_id', userId)
      .eq('commit_date', today)
      .select()
      .single()

    if (data) setCommit(data)
    return data
  }

  // ── Evening save ─────────────────────────────────────────────────────
  // eveningConfirms: { faith: bool, body: bool, mind: bool, stewardship: bool }
  // Only flips a column to true — never overwrites an existing true.
  async function saveEvening(eveningConfirms) {
    if (!userId) return null

    const today   = getLocalDate()
    const updates = { evening_done: true }
    for (const [key, val] of Object.entries(eveningConfirms)) {
      if (val) updates[`${key}_confirmed`] = true
    }

    const { data } = await supabase
      .from('daily_commits')
      .update(updates)
      .eq('user_id', userId)
      .eq('commit_date', today)
      .select()
      .single()

    if (data) setCommit(data)
    return data
  }

  return {
    commit,
    yesterdayCommit,
    loading,
    saveMorning,
    confirmPillar,
    saveEvening,
    refetch: fetchCommit,
  }
}
