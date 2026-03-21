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

// ── Network-first fetch strategy ──────────────────────────────────────────
// Supabase API requests are NEVER cached — they always hit the network so
// the app always sees fresh database state.
// All other requests (app shell, assets) use network-first with a cache
// fallback so the app still loads offline if the network is unavailable.
const CACHE_NAME = 'faithbuilt-' + VERSION

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Pass Supabase calls straight through — no caching, no interception.
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.io')
  ) {
    event.respondWith(fetch(event.request))
    return
  }

  // Non-GET requests (POST/PATCH/DELETE) go straight to network.
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request))
    return
  }

  // Network-first for everything else (HTML, JS, CSS, images).
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a clone of the successful response for offline fallback.
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() =>
        // Network failed — serve from cache if available.
        caches.match(event.request)
      )
  )
})
