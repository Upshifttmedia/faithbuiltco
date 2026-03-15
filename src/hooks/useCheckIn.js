import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const PILLARS = [
  {
    key: 'faith',
    label: 'Faith',
    icon: '✦',
    color: '#C9A84C',
    tasks: [
      { key: 'faith_prayer', label: 'Morning Prayer' },
      { key: 'faith_scripture', label: 'Scripture Reading' },
    ],
  },
  {
    key: 'body',
    label: 'Body',
    icon: '⚡',
    color: '#C9A84C',
    tasks: [
      { key: 'body_exercise', label: 'Exercise' },
      { key: 'body_nutrition', label: 'Healthy Eating' },
    ],
  },
  {
    key: 'mind',
    label: 'Mind',
    icon: '◈',
    color: '#C9A84C',
    tasks: [
      { key: 'mind_reading', label: 'Reading / Learning' },
      { key: 'mind_gratitude', label: 'Gratitude Practice' },
    ],
  },
  {
    key: 'stewardship',
    label: 'Stewardship',
    icon: '◆',
    color: '#C9A84C',
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
  const today = new Date().toISOString().split('T')[0]

  const fetchCompletions = useCallback(async () => {
    if (!userId) return
    const { data } = await supabase
      .from('daily_completions')
      .select('task_key, completed')
      .eq('user_id', userId)
      .eq('completion_date', today)

    const map = {}
    if (data) data.forEach(row => { map[row.task_key] = row.completed })
    setCompletions(map)
    setLoading(false)
  }, [userId, today])

  useEffect(() => {
    fetchCompletions()
  }, [fetchCompletions])

  async function toggleTask(pillarKey, taskKey) {
    if (!userId) return
    const current = completions[taskKey] || false
    const next = !current

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

  const allCompleted = ALL_TASK_KEYS.every(key => completions[key] === true)
  const completedCount = ALL_TASK_KEYS.filter(key => completions[key] === true).length
  const totalCount = ALL_TASK_KEYS.length

  // Update PWA app-icon badge
  useEffect(() => {
    if (loading) return
    if ('setAppBadge' in navigator) {
      allCompleted ? navigator.clearAppBadge?.() : navigator.setAppBadge?.(1)
    }
  }, [allCompleted, loading])

  return { completions, loading, toggleTask, allCompleted, completedCount, totalCount }
}
