import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const PROMPTED_KEY   = 'fb_notification_prompted'
const TIME_KEY       = 'fb_reminder_time'
const LAST_NOTIF_KEY = 'fb_last_notification_date'

// Register service worker once
async function registerSW() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    return reg
  } catch {
    return null
  }
}

export function useNotifications(userId) {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [reminderTime, setReminderTime] = useState(
    localStorage.getItem(TIME_KEY) || '07:00'
  )
  // Show the first-time setup prompt
  const [showPrompt, setShowPrompt] = useState(false)
  const swRef = useRef(null)

  useEffect(() => {
    registerSW().then(reg => { swRef.current = reg })

    // Show prompt once after first login
    if (userId && !localStorage.getItem(PROMPTED_KEY)) {
      const timer = setTimeout(() => setShowPrompt(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [userId])

  // On app open / visibility change, fire notification if it's due
  useEffect(() => {
    function checkAndNotify() {
      if (permission !== 'granted') return
      const time = localStorage.getItem(TIME_KEY)
      if (!time) return
      const today = new Date().toISOString().split('T')[0]
      if (localStorage.getItem(LAST_NOTIF_KEY) === today) return

      const [h, m] = time.split(':').map(Number)
      const now = new Date()
      const target = new Date()
      target.setHours(h, m, 0, 0)

      if (now >= target) {
        fireNotification()
        localStorage.setItem(LAST_NOTIF_KEY, today)
      }
    }

    checkAndNotify()

    const onVisible = () => { if (document.visibilityState === 'visible') checkAndNotify() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [permission]) // eslint-disable-line react-hooks/exhaustive-deps

  function fireNotification() {
    const sw = swRef.current
    if (sw?.active) {
      sw.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        title: 'FaithBuilt',
        body: 'Your alignment starts now. Open FaithBuilt.',
      })
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('FaithBuilt', {
        body: 'Your alignment starts now. Open FaithBuilt.',
        icon: '/favicon.svg',
      })
    }
  }

  async function requestAndSave(time) {
    let perm = permission
    if (typeof Notification !== 'undefined' && perm !== 'granted') {
      perm = await Notification.requestPermission()
      setPermission(perm)
    }
    setReminderTime(time)
    localStorage.setItem(TIME_KEY, time)
    localStorage.setItem(PROMPTED_KEY, 'true')
    setShowPrompt(false)

    // Persist to Supabase profile
    if (userId) {
      await supabase
        .from('profiles')
        .update({ reminder_time: time })
        .eq('id', userId)
    }
  }

  function dismissPrompt() {
    localStorage.setItem(PROMPTED_KEY, 'true')
    setShowPrompt(false)
  }

  // Update the PWA app-icon badge based on completion state
  function updateBadge(isComplete) {
    if (!('setAppBadge' in navigator)) return
    if (isComplete) {
      navigator.clearAppBadge?.()
    } else {
      navigator.setAppBadge?.(1)
    }
  }

  return {
    permission,
    reminderTime,
    showPrompt,
    requestAndSave,
    dismissPrompt,
    updateBadge,
  }
}
