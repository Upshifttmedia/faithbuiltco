import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { getLocalDate } from '../lib/dateUtils'

export const PILLARS = [
  {
    key: 'faith',
    label: 'Faith',
    icon: '✦',
    tasks: [
      { key: 'faith_prayer', label: 'Morning Prayer' },
      { key: 'faith_scripture', label: 'Scripture Reading' },
    ],
  },
  {
    key: 'body',
    label: 'Body',
    icon: '⚡',
    tasks: [
      { key: 'body_exercise', label: 'Exercise' },
      { key: 'body_nutrition', label: 'Healthy Eating' },
    ],
  },
  {
    key: 'mind',
    label: 'Mind',
    icon: '◈',
    tasks: [
      { key: 'mind_reading', label: 'Reading / Learning' },
      { key: 'mind_gratitude', label: 'Gratitude Practice' },
    ],
  },
  {
    key: 'stewardship',
    label: 'Stewardship',
    icon: '◆',
    tasks: [
      { key: 'stewardship_finances', label: 'Financial Review' },
      { key: 'stewardship_service', label: 'Acts of Service' },
    ],
  },
]

export const ALL_TASK_KEYS = PILLARS.flatMap(p => p.tasks.map(t => t.key))

export function useCheckIn(userId) {
  const [completions, setCompletions] = useState({})
  const [loading, setLoading] = useState(true)

  // ✅ LOCAL date — prevents UTC midnight flipping the date for non-UTC users
  const today = getLocalDate()

  const fetchCompletions = useCallback(async () => {
    if (!userId) return

    const { data } = await supabase
      .from('daily_completions')
      .select('task_key, completed')
      .eq('user_id', userId)
      .eq('completion_date', today)

    const map = {}
    // Only set tasks that are explicitly true — no rows = fresh day, all unchecked
    if (data) data.forEach(row => { map[row.task_key] = row.completed === true })
    setCompletions(map)
    setLoading(false)
  }, [userId, today])

  useEffect(() => {
    fetchCompletions()
  }, [fetchCompletions])

  async function toggleTask(pillarKey, taskKey) {
    if (!userId) return
    const next = !(completions[taskKey] === true)

    setCompletions(prev => ({ ...prev, [taskKey]: next }))

    await supabase
      .from('daily_completions')
      .upsert({
        user_id: userId,
        completion_date: today,
        pillar: pillarKey,
        task_key: taskKey,
        completed: next,
        completed_at: next ? new Date().toISOString() : null,
      }, { onConflict: 'user_id,completion_date,task_key' })
  }

  // Per-pillar completion status
  const pillarStatus = PILLARS.map(p => ({
    key: p.key,
    complete: p.tasks.every(t => completions[t.key] === true),
    count: p.tasks.filter(t => completions[t.key] === true).length,
  }))

  const completedPillars = pillarStatus.filter(p => p.complete).length
  const allCompleted = completedPillars === PILLARS.length
  const completedCount = ALL_TASK_KEYS.filter(k => completions[k] === true).length
  const totalCount = ALL_TASK_KEYS.length

  // PWA badge
  useEffect(() => {
    if (loading) return
    if ('setAppBadge' in navigator) {
      allCompleted ? navigator.clearAppBadge?.() : navigator.setAppBadge?.(1)
    }
  }, [allCompleted, loading])

  return { completions, loading, toggleTask, allCompleted, completedCount, completedPillars, totalCount, pillarStatus }
}
