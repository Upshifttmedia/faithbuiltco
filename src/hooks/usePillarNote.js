import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getLocalDate } from '../lib/dateUtils'

const DEBOUNCE_MS = 800

export function usePillarNote(userId, pillarKey) {
  const [note, setNote]     = useState('')
  const [saving, setSaving] = useState(false)
  const timerRef            = useRef(null)
  const today               = getLocalDate()

  // Load note on mount
  useEffect(() => {
    if (!userId || !pillarKey) return
    supabase
      .from('pillar_notes')
      .select('note')
      .eq('user_id', userId)
      .eq('pillar', pillarKey)
      .eq('note_date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.note) setNote(data.note)
      })
  }, [userId, pillarKey, today])

  const save = useCallback(async (text) => {
    if (!userId || !pillarKey) return
    setSaving(true)
    await supabase
      .from('pillar_notes')
      .upsert({
        user_id:   userId,
        pillar:    pillarKey,
        note_date: today,
        note:      text,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,note_date,pillar' })
    setSaving(false)
  }, [userId, pillarKey, today])

  function onChange(text) {
    setNote(text)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(text), DEBOUNCE_MS)
  }

  // Flush on unmount
  useEffect(() => () => clearTimeout(timerRef.current), [])

  return { note, onChange, saving }
}
