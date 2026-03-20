// Supabase Edge Function — send-push-notifications
// Runs on a cron schedule (every hour). For each push_subscription row,
// checks whether the current local time matches morning_time or evening_time.
// If it does, sends a Web Push notification via the web-push npm package.

import webpush from 'npm:web-push@3.6.7'

// ── Environment variables ────────────────────────────────────────────────
const VAPID_PUBLIC_KEY        = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY       = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_MAILTO            = Deno.env.get('VAPID_MAILTO')!
const SUPABASE_URL            = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

webpush.setVapidDetails(VAPID_MAILTO, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

// ── Types ────────────────────────────────────────────────────────────────
interface PushSubscriptionRow {
  id:           string
  user_id:      string
  subscription: Record<string, unknown>   // PushSubscription JSON
  morning_time: string  // "HH:MM"
  evening_time: string  // "HH:MM"
  timezone:     string  // IANA timezone string
}

// ── Helpers ──────────────────────────────────────────────────────────────

/** Return the current "HH:MM" in the given IANA timezone. */
function getCurrentHHMM(timezone: string): string {
  const now = new Date()
  try {
    // toLocaleTimeString with hour12:false returns "HH:MM:SS"
    const parts = now
      .toLocaleTimeString('en-US', { timeZone: timezone, hour12: false })
      .split(':')
    return `${parts[0].padStart(2, '0')}:${parts[1]}`
  } catch {
    // Fall back to UTC if timezone string is invalid
    const h = String(now.getUTCHours()).padStart(2, '0')
    const m = String(now.getUTCMinutes()).padStart(2, '0')
    return `${h}:${m}`
  }
}

/** Fetch all push_subscriptions rows using the service-role key. */
async function fetchSubscriptions(): Promise<PushSubscriptionRow[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`,
    {
      headers: {
        'apikey':        SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type':  'application/json',
      },
    }
  )
  if (!res.ok) {
    throw new Error(`Failed to fetch subscriptions: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

// ── Main handler ─────────────────────────────────────────────────────────
Deno.serve(async (_req) => {
  let sent   = 0
  let skipped = 0
  let failed  = 0

  try {
    const rows = await fetchSubscriptions()
    console.log('Subscriptions found:', rows.length)

    await Promise.allSettled(
      rows.map(async (row) => {
        const currentTime = getCurrentHHMM(row.timezone)
        console.log('Checking user:', row.user_id, 'current time:', currentTime, 'morning:', row.morning_time, 'evening:', row.evening_time)

        let notification: { title: string; body: string; url: string } | null = null

        if (currentTime === row.morning_time) {
          notification = {
            title: 'Good morning, Builder.',
            body:  'Your commitment is waiting. Open FaithBuilt and show up.',
            url:   '/morning',
          }
        } else if (currentTime === row.evening_time) {
          notification = {
            title: 'Time to reflect.',
            body:  'How did you show up today? Your evening check-in is ready.',
            url:   '/evening',
          }
        }

        if (!notification) {
          console.log('Skipped user:', row.user_id, 'time mismatch')
          skipped++
          return
        }

        try {
          await webpush.sendNotification(
            row.subscription,
            JSON.stringify({
              title: notification.title,
              body:  notification.body,
              url:   notification.url,
              tag:   'faithbuilt-push',
            })
          )
          console.log('Sent to:', row.user_id)
          sent++
        } catch (err) {
          // Log per-subscription errors but don't crash the whole function
          console.error(`Push failed for user ${row.user_id}:`, err)
          failed++
        }
      })
    )
  } catch (err) {
    console.error('Fatal error:', err)
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ ok: true, sent, skipped, failed }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
