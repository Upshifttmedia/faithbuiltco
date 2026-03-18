import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
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
  const [subscribed, setSubscribed] = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  // Check subscription status on mount.
  // Must verify BOTH the browser PushManager subscription AND the Supabase row.
  // Using the browser alone is unreliable: a stale browser subscription from a
  // prior session causes subscribed=true on mount, so the next click calls
  // unsubscribeFromPush and silently deletes the row that was just written.
  useEffect(() => {
    if (!PUSH_SUPPORTED || !userId) { setLoading(false); return }
    Promise.all([
      getCurrentSubscription(),
      supabase
        .from('push_subscriptions')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle(),
    ]).then(([browserSub, { data: dbRow }]) => {
      setSubscribed(!!browserSub && !!dbRow)
      setLoading(false)
    })
  }, [userId])

  async function handleToggle() {
    if (!PUSH_SUPPORTED) return
    setError('')
    setLoading(true)

    if (subscribed) {
      const { error } = await unsubscribeFromPush(userId)
      if (error) {
        setError('Could not disable reminders. Try again.')
      } else {
        setSubscribed(false)
      }
    } else {
      const { subscription, error } = await subscribeToPush(userId)
      if (error) {
        // Surface the real error so it's visible during debugging
        setError(
          error.message.includes('denied')
            ? 'Notifications are blocked in your browser settings.'
            : error.message
        )
      } else if (subscription) {
        setSubscribed(true)
      }
    }

    setLoading(false)
  }

  // Hide silently on unsupported browsers (e.g. iOS Safari < 16.4)
  if (!PUSH_SUPPORTED) return null

  return (
    <div className="notif-toggle-wrap">
      <div className="notif-toggle-info">
        <p className="notif-toggle-title">Daily Reminders</p>
        <p className="notif-toggle-sub">
          {subscribed
            ? 'Morning and evening push notifications are on.'
            : 'Get a morning prompt and evening reflection nudge.'}
        </p>
        {error && <p className="notif-toggle-error">{error}</p>}
      </div>

      <button
        className={`notif-toggle-btn${subscribed ? ' notif-toggle-btn--on' : ''}`}
        onClick={handleToggle}
        disabled={loading}
        aria-pressed={subscribed}
        aria-label={subscribed ? 'Disable daily reminders' : 'Enable daily reminders'}
      >
        {loading
          ? '…'
          : subscribed
            ? 'On'
            : 'Off'}
      </button>
    </div>
  )
}
