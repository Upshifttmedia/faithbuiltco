/**
 * CommunityFeed — Brotherhood teaser / waitlist page.
 *
 * Supabase table required (run once in SQL editor):
 *
 *   CREATE TABLE IF NOT EXISTS squad_waitlist (
 *     id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
 *     email      text        NOT NULL,
 *     user_id    uuid        REFERENCES auth.users(id),
 *     created_at timestamptz DEFAULT now(),
 *     UNIQUE(email)
 *   );
 *   ALTER TABLE squad_waitlist ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Anyone can join waitlist"
 *     ON squad_waitlist FOR INSERT WITH CHECK (true);
 *   CREATE POLICY "Users see own entry"
 *     ON squad_waitlist FOR SELECT
 *     USING (auth.uid() = user_id OR user_id IS NULL);
 */
import { useState } from 'react'
import { useAuth }  from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

const GOLD = '#C9A84C'
const BG   = '#0a0a0a'

const CSS = `
  @keyframes walkForward {
    0%   { transform: translateX(0px) translateY(0px) rotate(0deg);
           filter: brightness(10) drop-shadow(0 0 4px ${GOLD}); }
    25%  { transform: translateX(3px) translateY(-2px) rotate(2deg);
           filter: brightness(10) drop-shadow(0 0 12px ${GOLD}); }
    50%  { transform: translateX(6px) translateY(0px) rotate(0deg);
           filter: brightness(10) drop-shadow(0 0 4px ${GOLD}); }
    75%  { transform: translateX(3px) translateY(-2px) rotate(-2deg);
           filter: brightness(10) drop-shadow(0 0 12px ${GOLD}); }
    100% { transform: translateX(0px) translateY(0px) rotate(0deg);
           filter: brightness(10) drop-shadow(0 0 4px ${GOLD}); }
  }
`

const FEATURES = [
  {
    icon: '✦',
    name: "Your Squad's Shield",
    desc: "See every brother's armor. Know who showed up today.",
  },
  {
    icon: '🔥',
    name: 'Absence Alerts',
    desc: "When a brother goes quiet for 2 days, the squad gets notified. No man left behind.",
  },
  {
    icon: '🙏',
    name: 'Prayer Requests',
    desc: 'Post a need. Your brothers pray. Iron sharpens iron.',
  },
  {
    icon: '⚡',
    name: 'Squad Streaks',
    desc: 'A collective streak that only grows when everyone shows up. Rise together.',
  },
]

export default function CommunityFeed() {
  const { user } = useAuth()

  const [email,   setEmail]   = useState('')
  const [status,  setStatus]  = useState(null) // null | 'success' | 'duplicate' | 'error'
  const [saving,  setSaving]  = useState(false)

  async function handleWaitlist(e) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    setSaving(true)

    const { error } = await supabase
      .from('squad_waitlist')
      .insert({ email: trimmed, user_id: user?.id ?? null })

    setSaving(false)

    if (!error) {
      setStatus('success')
    } else if (error.code === '23505') {
      // unique constraint violation — already on the list
      setStatus('duplicate')
    } else {
      setStatus('error')
    }
  }

  return (
    <div className="app-shell" style={{ background: BG }}>
      <style>{CSS}</style>

      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">Brotherhood</span>
        </div>
      </header>

      <main style={{
        padding: '24px 24px 80px',
        display: 'flex', flexDirection: 'column', gap: 40,
        overflowY: 'auto',
      }}>

        {/* ── SECTION 1 — HERO ─────────────────────────────────────── */}
        <section style={{ textAlign: 'center', paddingTop: 16 }}>
          <img
            src="/pickupyourcross.png"
            alt="Pick up your cross"
            style={{
              width: 80, height: 80,
              display: 'block', objectFit: 'contain',
              margin: '0 auto 24px',
              mixBlendMode: 'screen',
              animation: 'walkForward 1.2s ease-in-out infinite',
            }}
          />
          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            color: '#fff', fontSize: 32, fontWeight: 800,
            margin: '0 0 16px', lineHeight: 1.2,
          }}>
            Iron sharpens iron.
          </h1>
          <p style={{
            color: '#888', fontSize: 15, lineHeight: 1.65,
            margin: '0 auto',
            maxWidth: 280,
          }}>
            The Brotherhood is coming. A squad of brothers who show up daily,
            hold each other accountable, and refuse to let each other drift.
          </p>
        </section>

        {/* ── SECTION 2 — WHAT'S COMING ────────────────────────────── */}
        <section>
          {/* "Coming Soon" divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 28,
          }}>
            <div style={{ flex: 1, height: 1, background: GOLD, opacity: 0.35 }} />
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              color: GOLD, fontSize: 11, fontWeight: 700,
              letterSpacing: 2, textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}>
              Coming Soon
            </span>
            <div style={{ flex: 1, height: 1, background: GOLD, opacity: 0.35 }} />
          </div>

          {/* Feature rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {FEATURES.map(f => (
              <div key={f.name} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 22, color: GOLD,
                  flexShrink: 0, width: 28, textAlign: 'center',
                  marginTop: 1,
                }}>
                  {f.icon}
                </span>
                <div>
                  <p style={{ margin: '0 0 4px', color: '#fff', fontSize: 15, fontWeight: 700 }}>
                    {f.name}
                  </p>
                  <p style={{ margin: 0, color: '#666', fontSize: 13, lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 3 — EARLY ACCESS ─────────────────────────────── */}
        <section>
          <h2 style={{
            color: '#fff', fontSize: 18, fontWeight: 700,
            margin: '0 0 8px',
          }}>
            Be first.
          </h2>
          <p style={{ color: '#666', fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>
            Enter your email to be notified when squads launch.
          </p>

          {status === 'success' ? (
            <p style={{
              color: GOLD, fontSize: 15, fontWeight: 600,
              padding: '16px', background: 'rgba(201,168,76,0.08)',
              border: `1px solid rgba(201,168,76,0.3)`,
              borderRadius: 12, textAlign: 'center', margin: 0,
            }}>
              You're on the list. The Brotherhood is coming.
            </p>
          ) : status === 'duplicate' ? (
            <p style={{
              color: '#888', fontSize: 15,
              padding: '16px', background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: 12, textAlign: 'center', margin: 0,
            }}>
              You're already on the list. We'll see you there.
            </p>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#1a1a1a', color: '#fff',
                  border: `1.5px solid ${GOLD}`,
                  borderRadius: 12, padding: '16px',
                  fontSize: 15, outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {status === 'error' && (
                <p style={{ color: '#e06c6c', fontSize: 13, margin: 0 }}>
                  Something went wrong. Try again.
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%', background: GOLD, border: 'none',
                  borderRadius: 12, padding: '16px',
                  color: '#000', fontSize: 15, fontWeight: 700,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  letterSpacing: 0.3,
                }}
              >
                {saving ? 'Saving…' : 'Notify Me When It\'s Ready'}
              </button>
            </form>
          )}
        </section>

        {/* ── SECTION 4 — SCRIPTURE FOOTER ─────────────────────────── */}
        <section style={{ textAlign: 'center', paddingBottom: 8 }}>
          <p style={{
            color: '#444', fontSize: 12, fontStyle: 'italic',
            lineHeight: 1.7, margin: 0,
          }}>
            "As iron sharpens iron, so one person sharpens another."
            <br />
            — Proverbs 27:17
          </p>
        </section>

      </main>
    </div>
  )
}
