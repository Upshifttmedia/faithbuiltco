import { useState, useEffect } from 'react'
import { subscribeToPush, unsubscribeFromPush } from '../hooks/usePushNotifications'
import { supabase } from '../lib/supabase'

export default function NotificationToggle() {
  const [enabled, setEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        setLoading(false)
        return
      }
      try {
        const reg = await navigator.serviceWorker.ready
        const sub = await reg.pushManager.getSubscription()
        if (!sub) { setEnabled(false); setLoading(false); return }

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) { setEnabled(false); setLoading(false); return }

        const { data } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('user_id', session.user.id)
          .single()

        setEnabled(!!data)
      } catch {
        setEnabled(false)
      }
      setLoading(false)
    }
    checkStatus()
  }, [])

  async function handleToggle() {
    if (loading) return
    setLoading(true)
    if (enabled) {
      const { data: { session } } = await supabase.auth.getSession()
      await unsubscribeFromPush(session?.user?.id)
      setEnabled(false)
    } else {
      const { data: { session } } = await supabase.auth.getSession()
      const { subscription } = await subscribeToPush(session?.user?.id)
      if (subscription) setEnabled(true)
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#1a1a1a', borderRadius: '12px' }}>
      <div>
        <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '15px' }}>Daily Reminders</div>
        <div style={{ color: '#888', fontSize: '13px', marginTop: '2px' }}>Get a morning prompt and evening reflection nudge.</div>
      </div>
      <div
        onClick={handleToggle}
        style={{
          width: '51px',
          height: '31px',
          borderRadius: '15.5px',
          background: enabled ? '#4DD9C0' : '#333',
          position: 'relative',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
          flexShrink: 0,
          opacity: loading ? 0.6 : 1,
        }}
      >
        <div style={{
          position: 'absolute',
          top: '2px',
          left: enabled ? '22px' : '2px',
          width: '27px',
          height: '27px',
          borderRadius: '50%',
          background: '#ffffff',
          transition: 'left 0.2s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
    </div>
  )
}
