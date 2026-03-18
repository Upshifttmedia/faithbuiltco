import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const PROMPTED_KEY          = 'fb_notification_prompted'
const TIME_KEY              = 'fb_reminder_time'
const LAST_MORNING_NOTIF    = 'fb_last_morning_notification'
const LAST_EVENING_NOTIF    = 'fb_last_evening_notification'
const EVENING_HOUR          = 20   // 8 pm

async function registerSW() {
  if (!('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register('/sw.js')
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
  const [showPrompt, setShowPrompt] = useState(false)
  const swRef = useRef(null)

  useEffect(() => {
    registerSW().then(reg => { swRef.current = reg })
    // Prompt is triggered by maybeTriggerPrompt() after first completed check-in,
    // not automatically on app load.
  }, [userId])

  // Check both morning and evening notifications on open / visibility change
  useEffect(() => {
    function checkNotifications() {
      if (permission !== 'granted') return
      const today = new Date().toISOString().split('T')[0]
      const now   = new Date()

      // ── Morning notification ─────────────────────────────────────────
      const morningTime = localStorage.getItem(TIME_KEY)
      if (morningTime && localStorage.getItem(LAST_MORNING_NOTIF) !== today) {
        const [h, m] = morningTime.split(':').map(Number)
        const target = new Date()
        target.setHours(h, m, 0, 0)
        if (now >= target) {
          fireNotification({
            title: 'FaithBuilt',
            body: 'Your morning is waiting. Begin your day with intention.',
            tag: 'morning-reminder',
            url: '/',
          })
          localStorage.setItem(LAST_MORNING_NOTIF, today)
        }
      }

      // ── Evening reflection notification (8pm) ───────────────────────
      if (localStorage.getItem(LAST_EVENING_NOTIF) !== today) {
        const target = new Date()
        target.setHours(EVENING_HOUR, 0, 0, 0)
        if (now >= target) {
          fireNotification({
            title: 'FaithBuilt',
            body: 'How did today go? Did you show up as who you committed to be this morning?',
            tag: 'evening-reflection',
            url: '/?fb_page=evening',
          })
          localStorage.setItem(LAST_EVENING_NOTIF, today)
        }
      }
    }

    checkNotifications()

    const onVisible = () => { if (document.visibilityState === 'visible') checkNotifications() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [permission]) // eslint-disable-line react-hooks/exhaustive-deps

  function fireNotification({ title, body, tag, url }) {
    const sw = swRef.current
    if (sw?.active) {
      sw.active.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag, url })
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.svg' })
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

    if (userId) {
      await supabase.from('profiles').update({ reminder_time: time }).eq('id', userId)
    }
  }

  function dismissPrompt() {
    localStorage.setItem(PROMPTED_KEY, 'true')
    setShowPrompt(false)
  }

  function maybeTriggerPrompt() {
    if (!localStorage.getItem(PROMPTED_KEY)) setShowPrompt(true)
  }

  function updateBadge(isComplete) {
    if (!('setAppBadge' in navigator)) return
    isComplete ? navigator.clearAppBadge?.() : navigator.setAppBadge?.(1)
  }

  return { permission, reminderTime, showPrompt, requestAndSave, dismissPrompt, maybeTriggerPrompt, updateBadge }
}
