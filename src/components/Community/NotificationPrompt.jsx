import { useState } from 'react'

export default function NotificationPrompt({ reminderTime, onSave, onDismiss }) {
  const [time, setTime] = useState(reminderTime || '07:00')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(time)
    setSaving(false)
  }

  return (
    <div className="prompt-overlay" role="dialog" aria-modal="true">
      <div className="prompt-sheet">
        <div className="prompt-icon">🔔</div>
        <h2 className="prompt-title">Your Daily Call to Show Up</h2>
        <p className="prompt-body">
          A push notification fires at your chosen time — no soft nudge, just the call. Show up when it fires.
        </p>

        <div className="prompt-time-wrap">
          <label className="field-label" htmlFor="reminder-time">Reminder time</label>
          <input
            id="reminder-time"
            type="time"
            className="field-input prompt-time-input"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </div>

        <p className="prompt-note">
          You'll see a browser notification: <em>"Your alignment starts now."</em>
        </p>

        <button
          className="btn-primary prompt-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Enable Reminder'}
        </button>

        <button className="prompt-skip" onClick={onDismiss}>
          Skip for now
        </button>
      </div>
    </div>
  )
}
