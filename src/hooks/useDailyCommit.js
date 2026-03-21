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

    // Always reset to loading state before hitting Supabase.
    // This ensures every mount and every manual refetch() shows a clean
    // loading state and never serves stale in-memory data.
    // There is intentionally NO localStorage/sessionStorage caching here —
    // daily_commits data must always come fresh from the database.
    setCommit(null)
    setYesterday(null)
    setLoading(true)

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

  // ── Toggle a pillar back to unconfirmed ──────────────────────────────
  async function unconfirmPillar(pillarKey) {
    if (!userId || !commit) return null

    const today = getLocalDate()
    const { data, error } = await supabase
      .from('daily_commits')
      .update({ [`${pillarKey}_confirmed`]: false })
      .eq('user_id', userId)
      .eq('commit_date', today)
      .select()
      .single()

    if (!error && data) setCommit(data)
    return data
  }

  // ── Edit a single pillar's commitment text ───────────────────────────
  async function updateCommitment(pillarKey, text) {
    if (!userId || !commit) return null

    const today = getLocalDate()
    const field = `${pillarKey}_commitment`
    const { data, error } = await supabase
      .from('daily_commits')
      .update({ [field]: text })
      .eq('user_id', userId)
      .eq('commit_date', today)
      .select()
      .single()

    if (!error && data) setCommit(data)
    return data
  }

  // ── Evening save ─────────────────────────────────────────────────────
  // eveningConfirms: { faith: bool, body: bool, mind: bool, stewardship: bool }
  // carryForward: optional text to save in carry_forward column
  //   (requires: ALTER TABLE daily_commits ADD COLUMN IF NOT EXISTS carry_forward text)
  // Only flips a _confirmed column to true — never overwrites an existing true.
  async function saveEvening(eveningConfirms, carryForward = '') {
    if (!userId) return null

    const today   = getLocalDate()
    const updates = { evening_done: true }
    if (carryForward) updates.carry_forward = carryForward
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
    unconfirmPillar,
    updateCommitment,
    saveEvening,
    refetch: fetchCommit,
  }
}
