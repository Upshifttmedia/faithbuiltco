import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getLocalDate } from '../lib/dateUtils'
import { PILLARS } from './useCheckIn'

export function useCommitment(userId) {
  const [commitment, setCommitment] = useState(null)
  const [loading, setLoading] = useState(true)
  const today = getLocalDate()

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    supabase
      .from('morning_commitments')
      .select('*')
      .eq('user_id', userId)
      .eq('commit_date', today)
      .maybeSingle()
      .then(({ data }) => {
        setCommitment(data ?? null)
        setLoading(false)
      })
  }, [userId, today])

  async function saveCommitment(texts) {
    if (!userId) return

    // 1. Save commitment text
    const { data } = await supabase
      .from('morning_commitments')
      .upsert(
        {
          user_id:          userId,
          commit_date:      today,
          faith_text:       texts.faith       ?? '',
          body_text:        texts.body        ?? '',
          mind_text:        texts.mind        ?? '',
          stewardship_text: texts.stewardship ?? '',
        },
        { onConflict: 'user_id,commit_date' }
      )
      .select()
      .single()

    if (data) setCommitment(data)

    // 2. Mark all tasks complete in daily_completions so the existing
    //    history / streak / calendar system continues to work unchanged
    const taskRows = PILLARS.flatMap(p =>
      p.tasks.map(t => ({
        user_id:         userId,
        completion_date: today,
        pillar:          p.key,
        task_key:        t.key,
        completed:       true,
        completed_at:    new Date().toISOString(),
      }))
    )
    await supabase
      .from('daily_completions')
      .upsert(taskRows, { onConflict: 'user_id,completion_date,task_key' })
  }

  return { commitment, committed: !!commitment, loading, saveCommitment }
}
