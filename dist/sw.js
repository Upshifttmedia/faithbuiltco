// FaithBuilt Service Worker
const VERSION = 'v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim())
})

// Listen for messages from the app to trigger notifications
self.addEventListener('message', e => {
  const { type, title, body } = e.data || {}

  if (type === 'SHOW_NOTIFICATION') {
    e.waitUntil(
      self.registration.showNotification(title || 'FaithBuilt', {
        body: body || 'Your alignment starts now. Open FaithBuilt.',
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'daily-reminder',
        renotify: true,
        requireInteraction: false,
      })
    )
  }
})

// Open (or focus) the app when user taps the notification
self.addEventListener('notificationclick', e => {
  e.notification.close()
  e.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        if (clientList.length > 0) return clientList[0].focus()
        return self.clients.openWindow('/')
      })
  )
})
