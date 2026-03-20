// FaithBuilt Service Worker
const VERSION = 'v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim())
})

// ── Web Push ─────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body || 'Time to show up.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'faithbuilt-reminder',
    renotify: true,
    requireInteraction: true,
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open FaithBuilt'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'FaithBuilt', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  const fullUrl = self.location.origin + url

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({ type: 'NAVIGATE', url: url })
            return client.focus()
          }
        }
        return clients.openWindow(fullUrl)
      })
  )
})
