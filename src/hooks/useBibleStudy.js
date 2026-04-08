/**
 * useBibleStudy — data hook for the Bible Study feature.
 *
 * Reads/writes:
 *   bible_study_settings — user's path, current_book, current_chapter,
 *                          context, onboarding_complete
 *   journal_entries      — SOAP notes stored as JSON in content column,
 *                          entry_type: 'soap', book + chapter set
 *   daily_commits        — faith_confirmed flipped via partial upsert
 *                          (Option A: creates row if none exists today)
 *   word_streaks         — increments on each SOAP save
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getLocalDate } from '../lib/dateUtils'
import biblePassages, { BOOK_CHAPTERS, ALL_BOOKS } from '../data/biblePassages'

export function useBibleStudy(userId) {
  const [settings, setSettings] = useState(null)   // bible_study_settings row
  const [loading, setLoading]   = useState(true)

  // ── Fetch settings on mount ──────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const { data } = await supabase
      .from('bible_study_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    setSettings(data ?? null)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  // ── Derive today's passage from current settings ─────────────────────
  // Returns the matching entry from biblePassages.js, or null if the
  // current book/chapter isn't in our curated list yet.
  const passage = settings
    ? (biblePassages.find(
        p => p.book === settings.current_book &&
             p.chapter === settings.current_chapter
      ) ?? null)
    : null

  // ── Onboarding save ──────────────────────────────────────────────────
  // Sets onboarding_complete: true + stores the user's chosen path.
  async function saveOnboarding(path, book, chapter, context) {
    if (!userId) return { error: new Error('No user') }

    const payload = {
      user_id:             userId,
      path,
      current_book:        book,
      current_chapter:     Number(chapter),
      context,
      onboarding_complete: true,
    }

    const { data, error } = await supabase
      .from('bible_study_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (data) setSettings(data)
    return { data, error }
  }

  // ── Advance to next chapter / book ───────────────────────────────────
  // Called internally after saveSOAP and markCarried.
  async function advanceChapter() {
    if (!userId || !settings) return

    const { current_book, current_chapter } = settings
    const maxChapter = BOOK_CHAPTERS[current_book] ?? 1

    let nextBook    = current_book
    let nextChapter = current_chapter + 1

    if (nextChapter > maxChapter) {
      nextChapter = 1
      const bookIndex = ALL_BOOKS.indexOf(current_book)
      // Wrap around to Genesis after Revelation
      nextBook = ALL_BOOKS[(bookIndex + 1) % ALL_BOOKS.length] ?? current_book
    }

    const { data } = await supabase
      .from('bible_study_settings')
      .update({ current_book: nextBook, current_chapter: nextChapter })
      .eq('user_id', userId)
      .select()
      .single()

    if (data) setSettings(data)
  }

  // ── SOAP journal save ────────────────────────────────────────────────
  // 1. Writes to journal_entries (entry_type: 'soap', content as JSON)
  // 2. Partial-upserts daily_commits to flip faith_confirmed: true
  // 3. Updates word_streaks
  // 4. Advances chapter
  async function saveSOAP(scripture, observation, application, prayer) {
    if (!userId || !settings) return { error: new Error('No user or settings') }

    const today   = getLocalDate()
    const content = JSON.stringify({ scripture, observation, application, prayer })

    // 1. Write journal entry
    const { error: journalError } = await supabase
      .from('journal_entries')
      .upsert(
        {
          user_id:    userId,
          entry_date: today,
          entry_type: 'soap',
          content,
          book:       settings.current_book,
          chapter:    settings.current_chapter,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,entry_date' }
      )

    if (journalError) return { error: journalError }

    // 2. Partial upsert on daily_commits — creates row if none exists,
    //    only touches faith_confirmed (Option A confirmed by user).
    await supabase
      .from('daily_commits')
      .upsert(
        { user_id: userId, commit_date: today, faith_confirmed: true },
        { onConflict: 'user_id,commit_date' }
      )

    // 3. Update word streak
    await updateWordStreak()

    // 4. Advance chapter
    await advanceChapter()

    return { error: null }
  }

  // ── Mark carried (no journal entry) ─────────────────────────────────
  // Flips faith_confirmed without saving SOAP notes, then advances.
  async function markCarried() {
    if (!userId) return

    const today = getLocalDate()

    await supabase
      .from('daily_commits')
      .upsert(
        { user_id: userId, commit_date: today, faith_confirmed: true },
        { onConflict: 'user_id,commit_date' }
      )

    await advanceChapter()
  }

  // ── Word streak update ────────────────────────────────────────────────
  // Called after every SOAP save. Mirrors the logic in useStreak.js:
  // increment if last_word_date was yesterday, reset to 1 if gap > 1,
  // no-op if already updated today.
  async function updateWordStreak() {
    if (!userId) return

    const today = getLocalDate()

    const { data: current } = await supabase
      .from('word_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (current?.last_word_date === today) return  // already counted today

    const yesterday   = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const prevStreak    = current?.current_streak  ?? 0
    const prevLongest   = current?.longest_streak  ?? 0
    const lastDate      = current?.last_word_date  ?? null

    const newStreak  = lastDate === yesterdayStr ? prevStreak + 1 : 1
    const newLongest = Math.max(prevLongest, newStreak)

    await supabase
      .from('word_streaks')
      .upsert(
        {
          user_id:        userId,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_word_date: today,
          updated_at:     new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
  }

  return {
    settings,
    passage,
    loading,
    saveOnboarding,
    saveSOAP,
    markCarried,
    refetch: fetchSettings,
  }
}
