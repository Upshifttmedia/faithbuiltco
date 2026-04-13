/**
 * useBodyStudy — data hook for the Body pillar feature.
 *
 * Reads/writes:
 *   body_settings   — track, split, gym_mode, onboarding_complete
 *   body_logs       — daily workout log (exercises, completed, feeling…)
 *   daily_commits   — body_confirmed flipped via partial upsert
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase }                          from '../lib/supabase'
import { getLocalDate }                      from '../lib/dateUtils'
import LIBRARY, { getWorkoutsForDay }        from '../data/workoutLibrary'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL         = 'claude-haiku-4-5-20251001'

// ── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Pick the best workout from the library given current settings and recent logs.
 * Avoids repeating the same focus as the last 3 sessions.
 * excludeId optionally skips one workout (used for "give me something different").
 */
function selectWorkout(settingsData, recentLogs, excludeId = null) {
  if (!settingsData) return null

  const { track, split } = settingsData
  const dow = new Date().getDay()

  let candidates = getWorkoutsForDay(track, split, dow)

  if (excludeId) {
    candidates = candidates.filter(w => w.id !== excludeId)
  }

  if (!candidates.length) return null
  if (candidates.length === 1) return candidates[0]

  // Collect the focus values of the last 3 logs
  const recentFocuses = (recentLogs ?? [])
    .slice(0, 3)
    .map(l => {
      const match = LIBRARY.find(
        w => w.type === l.workout_type && w.track === l.track
      )
      return match?.focus ?? null
    })
    .filter(Boolean)

  const fresh = candidates.filter(w => !recentFocuses.includes(w.focus))
  return (fresh.length ? fresh : candidates)[0]
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBodyStudy(userId) {
  const [settings,    setSettings]    = useState(null)
  const [todayLog,    setTodayLog]    = useState(null)
  const [todayWorkout,setTodayWorkout]= useState(null)
  const [recentLogs,  setRecentLogs]  = useState([])
  const [aiBrief,     setAiBrief]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [aiLoading,   setAiLoading]   = useState(false)
  const [aiError,     setAiError]     = useState(null)

  // ── Initial fetch ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)

    const today = getLocalDate()

    const [settingsRes, logRes, recentRes] = await Promise.all([
      supabase
        .from('body_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('body_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', today)
        .maybeSingle(),
      supabase
        .from('body_logs')
        .select('workout_type, track, log_date')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })
        .limit(3),
    ])

    const s = settingsRes.data ?? null
    const l = logRes.data     ?? null
    const r = recentRes.data  ?? []

    setSettings(s)
    setTodayLog(l)
    setRecentLogs(r)

    // Auto-select today's workout if onboarded and no log yet
    if (s?.onboarding_complete && !l && s.gym_mode !== 'custom') {
      const workout = selectWorkout(s, r)
      setTodayWorkout(workout)
    }

    setLoading(false)
  }, [userId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── generateAIBrief ───────────────────────────────────────────────────────
  // Calls Anthropic haiku with the workout context.
  // Returns the brief string (also stores in state).
  async function generateAIBrief(workout) {
    if (!workout) return null
    setAiLoading(true)
    setAiError(null)

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

    const exerciseList = workout.exercises
      .map(e => `${e.name}: ${e.sets} × ${e.reps}`)
      .join(', ')

    const userMsg =
      `Workout: ${workout.type}. ` +
      `Focus: ${workout.focus}. ` +
      `Track: ${workout.track}. ` +
      `Exercises: ${exerciseList}. ` +
      `Duration: ~${workout.duration} minutes.`

    try {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type':                          'application/json',
          'x-api-key':                             apiKey,
          'anthropic-version':                     '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: 150,
          system:
            'You are the voice of FaithBuilt — a faith-based discipline app for men. ' +
            'Write a 2-3 sentence workout brief that is direct, masculine, and grounded. ' +
            'Tone: mostly discipline-focused with an occasional subtle faith nod. ' +
            'No fluff. No exclamation marks. Sound like a coach who believes in both God and hard work.',
          messages: [{ role: 'user', content: userMsg }],
        }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)

      const json  = await res.json()
      const brief = json.content?.[0]?.text?.trim() ?? ''
      setAiBrief(brief)
      return brief
    } catch (err) {
      setAiError(err.message)
      return null
    } finally {
      setAiLoading(false)
    }
  }

  // ── swapWorkout ───────────────────────────────────────────────────────────
  // Selects a different workout from the library (called once per session).
  function swapWorkout() {
    if (!settings) return
    const next = selectWorkout(settings, recentLogs, todayWorkout?.id)
    setTodayWorkout(next)
    setAiBrief(null)   // caller should re-trigger generateAIBrief
  }

  // ── saveOnboarding ────────────────────────────────────────────────────────
  async function saveOnboarding(track, gymMode, split) {
    if (!userId) return { error: new Error('No user') }

    const payload = {
      user_id:             userId,
      track,
      gym_mode:            gymMode,
      split,
      onboarding_complete: true,
    }

    const { data, error } = await supabase
      .from('body_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (data) {
      setSettings(data)
      if (data.gym_mode !== 'custom') {
        const workout = selectWorkout(data, recentLogs)
        setTodayWorkout(workout)
      }
    }
    return { data, error }
  }

  // ── acceptWorkout ─────────────────────────────────────────────────────────
  // Writes body_logs row (completed: false) + flips body_confirmed on
  // daily_commits.
  async function acceptWorkout(workout) {
    if (!userId || !workout) return { error: new Error('No user or workout') }

    const today = getLocalDate()

    const logPayload = {
      user_id:          userId,
      log_date:         today,
      workout_type:     workout.type,
      track:            workout.track,
      exercises:        workout.exercises,
      completed:        false,
      duration_minutes: null,
      feeling:          null,
      notes:            null,
    }

    const { data: logData, error: logError } = await supabase
      .from('body_logs')
      .upsert(logPayload, { onConflict: 'user_id,log_date' })
      .select()
      .single()

    if (logError) return { error: logError }
    setTodayLog(logData)

    // Partial upsert — only touches body_confirmed
    await supabase
      .from('daily_commits')
      .upsert(
        { user_id: userId, commit_date: today, body_confirmed: true },
        { onConflict: 'user_id,commit_date' }
      )

    return { error: null }
  }

  // ── completeWorkout ───────────────────────────────────────────────────────
  // Updates today's body_logs row with completion data.
  async function completeWorkout(duration, feeling, notes) {
    if (!userId) return { error: new Error('No user') }

    const today = getLocalDate()

    const { data, error } = await supabase
      .from('body_logs')
      .update({
        completed:        true,
        duration_minutes: duration,
        feeling,
        notes,
      })
      .eq('user_id', userId)
      .eq('log_date', today)
      .select()
      .single()

    if (data) setTodayLog(data)
    return { error }
  }

  return {
    settings,
    todayWorkout,
    todayLog,
    aiBrief,
    loading,
    aiLoading,
    aiError,
    saveOnboarding,
    acceptWorkout,
    completeWorkout,
    generateAIBrief,
    swapWorkout,
    refetch: fetchAll,
  }
}
