import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getLocalDate } from '../lib/dateUtils'

export function useEveningReflection(userId) {
  const [reflection, setReflection] = useState(null)
  const [loading, setLoading] = useState(true)
  const today = getLocalDate()

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase
      .from('evening_reflections')
      .select('*')
      .eq('user_id', userId)
      .eq('reflect_date', today)
      .maybeSingle()
      .then(({ data }) => {
        setReflection(data ?? null)
        setLoading(false)
      })
  }, [userId, today])

  async function saveReflection({ journalText, showedUp }) {
    if (!userId) return
    const { data } = await supabase
      .from('evening_reflections')
      .upsert(
        {
          user_id:      userId,
          reflect_date: today,
          journal_text: journalText ?? '',
          showed_up:    showedUp,
        },
        { onConflict: 'user_id,reflect_date' }
      )
      .select()
      .single()
    if (data) setReflection(data)
    return data
  }

  const reflected = !!reflection?.showed_up

  return { reflection, reflected, loading, saveReflection }
}
