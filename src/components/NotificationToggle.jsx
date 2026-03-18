import { useState, useEffect } from 'react'
import {
  subscribeToPush,
  unsubscribeFromPush,
  getCurrentSubscription,
} from '../hooks/usePushNotifications'

const PUSH_SUPPORTED =
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window

export default function NotificationToggle({ userId }) {
  const [enabled,  setEnabled]  = useState(false)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  // Read-only mount check — sets initial state, never calls subscribe/unsubscribe.
  useEffect(() => {
    if (!PUSH_SUPPORTED || !userId) { setLoading(false); return }
    getCurrentSubscription().then(sub => {
      setEnabled(!!sub)
      setLoading(false)
    })
  }, [userId])

  // The ONLY place subscribe or unsubscribe is called — explicit user action only.
  async function handleToggle() {
    if (!PUSH_SUPPORTED || loading) return
    setError('')
    setLoading(true)

    if (enabled) {
      // Turning OFF
      const { error: err } = await unsubscribeFromPush(userId)
      if (err) {
        setError('Could not disable reminders. Try again.')
      } else {
        setEnabled(false)
      }
    } else {
      // Turning ON
      const { subscription, error: err } = await subscribeToPush(userId)
      if (err) {
        setError(
          err.message.includes('denied')
            ? 'Notifications are blocked in your browser settings.'
            : err.message
        )
      } else if (subscription) {
        setEnabled(true)
      }
    }

    setLoading(false)
  }

  if (!PUSH_SUPPORTED) return null

  return (
    <div className="notif-toggle-wrap">
      <div className="notif-toggle-info">
        <p className="notif-toggle-title">Daily Reminders</p>
        <p className="notif-toggle-sub">
          {enabled
            ? 'Morning and evening push notifications are on.'
            : 'Get a morning prompt and evening reflection nudge.'}
        </p>
        {error && <p className="notif-toggle-error">{error}</p>}
      </div>

      <button
        className={`notif-toggle-btn${enabled ? ' notif-toggle-btn--on' : ''}`}
        onClick={handleToggle}
        disabled={loading}
        aria-pressed={enabled}
        aria-label={enabled ? 'Disable daily reminders' : 'Enable daily reminders'}
      >
        {loading ? '…' : enabled ? 'On' : 'Off'}
      </button>
    </div>
  )
}
