import { supabase } from '../lib/supabase'

// Convert the URL-safe Base64 VAPID public key to a Uint8Array
// that the PushManager.subscribe() call expects.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

/**
 * Subscribe the current user to Web Push notifications.
 * 1. Requests notification permission from the browser.
 * 2. Registers the service worker push subscription.
 * 3. Upserts the PushSubscription JSON into push_subscriptions.
 *
 * Returns { subscription, error }
 */
export async function subscribeToPush(userId) {
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

  try {
    // 1. Fast-fail if the VAPID key is missing — avoids a misleading
    //    permission prompt that would then fail at subscription time.
    if (!vapidKey) {
      const err = new Error(
        'VITE_VAPID_PUBLIC_KEY is not set. Add it to .env and restart the dev server.'
      )
      console.error('[FaithBuilt] subscribeToPush error:', err)
      return { subscription: null, error: err }
    }

    // 2. Permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return { subscription: null, error: new Error('Notification permission denied.') }
    }

    // 3. Service-worker registration
    const reg = await navigator.serviceWorker.ready

    // 4. Subscribe via PushManager
    const pushSub = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })

    // 5. Persist to Supabase
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      await pushSub.unsubscribe()
      return { subscription: null, error: new Error('No active session') }
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { user_id: session.user.id, subscription: pushSub.toJSON() },
        { onConflict: 'user_id', ignoreDuplicates: false }
      )
      .select()

    if (error) {
      // Roll back the browser-side subscription so state stays consistent
      await pushSub.unsubscribe()
      return { subscription: null, error }
    }

    return { subscription: pushSub, error: null }
  } catch (err) {
    console.error('[FaithBuilt] subscribeToPush error:', err)
    return { subscription: null, error: err }
  }
}

/**
 * Unsubscribe the current user from Web Push notifications.
 * 1. Unsubscribes via PushManager.
 * 2. Deletes the row from push_subscriptions.
 *
 * Returns { error }
 */
export async function unsubscribeFromPush(userId) {
  try {
    const reg = await navigator.serviceWorker.ready
    const pushSub = await reg.pushManager.getSubscription()

    if (pushSub) {
      await pushSub.unsubscribe()
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId)

    return { error: error ?? null }
  } catch (err) {
    return { error: err }
  }
}

/**
 * Returns the current PushSubscription (or null if not subscribed).
 */
export async function getCurrentSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
  try {
    const reg = await navigator.serviceWorker.ready
    return reg.pushManager.getSubscription()
  } catch {
    return null
  }
}
