// FaithBuilt Service Worker
const VERSION = 'v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim())
})

// Listen for messages from the app to trigger notifications
self.addEventListener('message', e => {
  const { type, title, body, tag, url } = e.data || {}

  if (type === 'SHOW_NOTIFICATION') {
    e.waitUntil(
      self.registration.showNotification(title || 'FaithBuilt', {
        body: body || 'Your alignment starts now. Open FaithBuilt.',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: tag || 'daily-reminder',
        renotify: true,
        requireInteraction: false,
        data: { url: url || '/' },
      })
    )
  }
})

// Open (or focus) the app when user taps the notification
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const targetUrl = e.notification.data?.url || '/'
  e.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // If a window is already open, navigate it to the target URL
        if (clientList.length > 0) {
          const client = clientList[0]
          client.navigate(targetUrl)
          return client.focus()
        }
        return self.clients.openWindow(targetUrl)
      })
  )
})

// ── Web Push ─────────────────────────────────────────────────────────────
// Receive a server-sent push payload and display a native notification.
self.addEventListener('push', e => {
  const data = e.data?.json() || {}
  e.waitUntil(
    self.registration.showNotification(data.title || 'FaithBuilt', {
      body:      data.body || 'Your alignment starts now. Open FaithBuilt.',
      icon:      '/icon-192.png',
      badge:     '/icon-192.png',
      tag:       data.tag  || 'faithbuilt-push',
      renotify:  true,
      data:      { url: data.url || '/' },
    })
  )
})
