import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const SAVE_DELAY = 1200

export default function ReflectionJournal({ userId }) {
  const [content, setContent] = useState('')
  const [status, setStatus] = useState('idle') // idle | saving | saved
  const saveTimer = useRef(null)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!userId) return
    supabase
      .from('journal_entries')
      .select('content')
      .eq('user_id', userId)
      .eq('entry_date', today)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content) setContent(data.content)
      })
  }, [userId, today])

  function handleChange(e) {
    setContent(e.target.value)
    setStatus('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => save(e.target.value), SAVE_DELAY)
  }

  async function save(text) {
    if (!userId) return
    await supabase
      .from('journal_entries')
      .upsert({
        user_id: userId,
        entry_date: today,
        content: text,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,entry_date' })
    setStatus('saved')
    setTimeout(() => setStatus('idle'), 2000)
  }

  return (
    <div className="journal-section">
      <div className="journal-header">
        <h3 className="journal-title">Today's Reflection</h3>
        {status === 'saving' && <span className="save-status">Saving…</span>}
        {status === 'saved' && <span className="save-status save-status--done">Saved ✓</span>}
      </div>
      <textarea
        className="journal-input"
        value={content}
        onChange={handleChange}
        placeholder="What's on your heart today? Capture a thought, gratitude, or insight…"
        rows={5}
      />
    </div>
  )
}
