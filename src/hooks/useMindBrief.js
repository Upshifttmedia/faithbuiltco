/**
 * useMindBrief — data hook for the Mind pillar feature.
 *
 * Reads/writes:
 *   mind_logs      — daily word, battle, weapon, evening reflection
 *   daily_commits  — mind_confirmed flipped via partial upsert
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase }      from '../lib/supabase'
import { getLocalDate }  from '../lib/dateUtils'
import WORD_LIBRARY, { ALL_WORDS } from '../data/mindWordLibrary'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL         = 'claude-haiku-4-5-20251001'

// Fisher-Yates shuffle (returns new array)
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function useMindBrief(userId) {
  const [todayLog,  setTodayLog]  = useState(null)
  const [words,     setWords]     = useState([])      // 5 AI-selected words
  const [loading,   setLoading]   = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError,   setAiError]   = useState(null)

  // ── Fetch today's log on mount ────────────────────────────────────────────
  const fetchTodayLog = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)

    const today = getLocalDate()
    const { data } = await supabase
      .from('mind_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .maybeSingle()

    setTodayLog(data ?? null)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchTodayLog() }, [fetchTodayLog])

  // ── generateWords ─────────────────────────────────────────────────────────
  // Calls Anthropic to select 5 words from the master list suited to today.
  // Falls back to 5 random words on API failure.
  async function generateWords() {
    if (!userId) return
    setAiLoading(true)
    setAiError(null)

    // Fetch last 7 logs for context
    const { data: recentLogs } = await supabase
      .from('mind_logs')
      .select('word, battle, log_date')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(7)

    const wordList = ALL_WORDS.join(', ')

    const recentHistory = (recentLogs ?? [])
      .map(l => `${l.log_date}: word="${l.word}", battle="${l.battle ?? 'none'}"`)
      .join('\n')

    const dow     = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const dateStr = getLocalDate()

    const userMsg =
      `Master word list: ${wordList}\n\n` +
      `Today: ${dow}, ${dateStr}\n\n` +
      `Recent history:\n${recentHistory || 'None yet.'}\n\n` +
      'Return exactly 5 words from the master list as a JSON array. Nothing else.'

    try {
      const res = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: {
          'Content-Type':          'application/json',
          'x-api-key':             import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version':     '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model:      MODEL,
          max_tokens: 80,
          system:
            "You are the voice of FaithBuilt — a faith-based discipline app for men. " +
            "Your job is to select 5 words from the provided master list that best suit " +
            "this man's mental and spiritual posture today. Consider: day of week, his " +
            "recent word choices, and any patterns in his recent battles. Return exactly " +
            "5 words as a JSON array. No explanation. No preamble. Just the array.",
          messages: [{ role: 'user', content: userMsg }],
        }),
      })

      if (!res.ok) throw new Error(`API error ${res.status}`)

      const json = await res.json()
      const text = json.content?.[0]?.text?.trim() ?? '[]'

      // Strip any markdown code fences the model may wrap around JSON
      const clean = text.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '').trim()
      const parsed = JSON.parse(clean)

      // Validate: only keep words that exist in the master list
      const valid = (Array.isArray(parsed) ? parsed : [])
        .filter(w => typeof w === 'string' && ALL_WORDS.includes(w))
        .slice(0, 5)

      // Pad with random words if the model returned fewer than 5 valid ones
      if (valid.length < 5) {
        const remaining = shuffle(ALL_WORDS.filter(w => !valid.includes(w)))
        valid.push(...remaining.slice(0, 5 - valid.length))
      }

      setWords(valid)
    } catch (err) {
      setAiError(err.message)
      // Fallback: 5 random words from library
      setWords(shuffle(ALL_WORDS).slice(0, 5))
    } finally {
      setAiLoading(false)
    }
  }

  // ── saveMindBrief ─────────────────────────────────────────────────────────
  // Upserts mind_logs + flips mind_confirmed on daily_commits.
  async function saveMindBrief(word, battle, weaponCategory, weapon) {
    if (!userId) return { error: new Error('No user') }

    const today = getLocalDate()

    const { data, error } = await supabase
      .from('mind_logs')
      .upsert(
        {
          user_id:         userId,
          log_date:        today,
          word,
          battle,
          weapon_category: weaponCategory,
          weapon,
          updated_at:      new Date().toISOString(),
        },
        { onConflict: 'user_id,log_date' }
      )
      .select()
      .single()

    if (error) return { error }
    setTodayLog(data)

    // Partial upsert — only touches mind_confirmed
    await supabase
      .from('daily_commits')
      .upsert(
        { user_id: userId, commit_date: today, mind_confirmed: true },
        { onConflict: 'user_id,commit_date' }
      )

    return { error: null }
  }

  // ── saveEveningReflection ─────────────────────────────────────────────────
  // Updates today's mind_logs row with evening data.
  async function saveEveningReflection(reflection, wordHeld) {
    if (!userId) return { error: new Error('No user') }

    const today = getLocalDate()

    const { data, error } = await supabase
      .from('mind_logs')
      .update({
        evening_reflection: reflection,
        word_held:          wordHeld,
        updated_at:         new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('log_date', today)
      .select()
      .single()

    if (data) setTodayLog(data)
    return { error }
  }

  return {
    todayLog,
    words,
    loading,
    aiLoading,
    aiError,
    generateWords,
    saveMindBrief,
    saveEveningReflection,
    refetch: fetchTodayLog,
  }
}
