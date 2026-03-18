import { useState, useEffect, useRef } from 'react'
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
  // Guard that prevents the mount-check useEffect from firing while
  // subscribeToPush is in flight. Without this, the state update inside
  // handleToggle (setSubscribed(true)) re-triggers the effect, which sees
  // the new browser subscription, runs its checks, and can call
  // unsubscribeFromPush — deleting the row that was just written.
  const isSubscribing = useRef(false)

  // Check subscription status on mount (and when userId first becomes available).
  // Only re-runs when userId changes — not on every state update.
  useEffect(() => {
    if (!PUSH_SUPPORTED || !userId) { setLoading(false); return }
    // Skip re-check while a subscribe operation is in progress.
    if (isSubscribing.current) return
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
      isSubscribing.current = true
      const { subscription, error } = await subscribeToPush(userId)
      isSubscribing.current = false
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
