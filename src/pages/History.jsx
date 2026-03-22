/**
 * History.jsx — "Your Journey" tab.
 *
 * Fetches from daily_commits (not the old daily_completions table).
 * Shows last 7 days by default; "Load more" expands in 7-day chunks up to 30.
 * Every card is tappable and expands to show commitment text + pillar status.
 */
import { useState, useEffect, useCallback } from 'react'
import { useAuth }     from '../hooks/useAuth'
import { supabase }    from '../lib/supabase'
import { PillarIcon }  from '../components/PillarIcon'
import { getLocalDate, getLocalDateOffset } from '../lib/dateUtils'

const GOLD = '#C9A84C'

const PILLARS = [
  { key: 'faith',       label: 'Faith' },
  { key: 'body',        label: 'Body' },
  { key: 'mind',        label: 'Mind' },
  { key: 'stewardship', label: 'Stewardship' },
]

// ── Date helpers ──────────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

function formatShort(dateStr) {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// Build an array of YYYY-MM-DD strings for the last N days (today first)
function buildDateRange(n) {
  return Array.from({ length: n }, (_, i) => getLocalDateOffset(i))
}

// ── Status derivation ─────────────────────────────────────────────────
function getStatus(commit) {
  if (!commit) return 'drifted'
  const confirmedCount = PILLARS.filter(p => commit[`${p.key}_confirmed`]).length
  if (!commit.morning_done) return 'drifted'
  if (!commit.evening_done) return 'in-progress'
  if (confirmedCount >= 4)  return 'full'
  if (confirmedCount === 3) return 'partial'
  return 'fell-short'
}

const STATUS_META = {
  'full':        { label: 'Showed up',   color: GOLD,    pulse: false },
  'partial':     { label: 'Partial',     color: '#a88c3a', pulse: false },
  'fell-short':  { label: 'Fell short',  color: '#555',  pulse: false },
  'in-progress': { label: 'In progress', color: GOLD,    pulse: true  },
  'drifted':     { label: 'Drifted',     color: '#3a3a3a', pulse: false },
}

// ── CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @keyframes hj-pulse {
    0%,100% { opacity:1 }
    50%     { opacity:0.35 }
  }
  @keyframes hj-expand {
    from { opacity:0; transform:translateY(-6px) }
    to   { opacity:1; transform:translateY(0) }
  }
`

// ── Day card ──────────────────────────────────────────────────────────
function DayCard({ dateStr, commit, isToday }) {
  const [open, setOpen] = useState(false)
  const status   = getStatus(commit)
  const meta     = STATUS_META[status]
  const confirmedCount = commit
    ? PILLARS.filter(p => commit[`${p.key}_confirmed`]).length
    : 0

  const label = isToday ? 'Today' : formatShort(dateStr)

  return (
    <div
      style={{
        borderRadius: 14,
        border: open
          ? `1px solid rgba(201,168,76,0.4)`
          : '1px solid rgba(255,255,255,0.06)',
        marginBottom: 10,
        background: open ? 'rgba(201,168,76,0.04)' : 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
        transition: 'border-color 0.25s ease, background 0.25s ease',
      }}
    >
      {/* ── Collapsed row (always visible, tappable) ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Left: date */}
        <div>
          <p style={{
            margin: 0, color: isToday ? '#fff' : '#aaa',
            fontSize: 14, fontWeight: isToday ? 700 : 500,
            letterSpacing: 0.2,
          }}>
            {label}
          </p>
          {!isToday && (
            <p style={{ margin: '2px 0 0', color: '#444', fontSize: 11, letterSpacing: 0.3 }}>
              {new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })}
            </p>
          )}
        </div>

        {/* Right: status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {meta.pulse && (
            <span style={{
              display: 'inline-block', width: 7, height: 7,
              borderRadius: '50%', background: GOLD,
              animation: 'hj-pulse 1.4s ease-in-out infinite',
              flexShrink: 0,
            }} />
          )}
          <span style={{
            fontSize: 12, fontWeight: 600, color: meta.color,
            letterSpacing: 0.4,
          }}>
            {meta.label}
          </span>
          {/* Confirmed count badge for full/partial */}
          {(status === 'full' || status === 'partial' || status === 'fell-short') && (
            <span style={{
              fontSize: 11, color: '#555', letterSpacing: 0.2,
            }}>
              {confirmedCount}/4
            </span>
          )}
          {/* Expand chevron */}
          <span style={{
            color: '#444', fontSize: 12,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            display: 'inline-block',
          }}>
            ▾
          </span>
        </div>
      </button>

      {/* ── Expanded detail ── */}
      {open && (
        <div style={{
          padding: '0 16px 20px',
          animation: 'hj-expand 0.25s ease both',
        }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 16 }} />

          {status === 'drifted' ? (
            <p style={{ color: '#3a3a3a', fontSize: 14, fontStyle: 'italic', margin: 0 }}>
              No commitment recorded.
            </p>
          ) : (
            <>
              {/* ── YOUR COMMITMENTS ── */}
              <p style={{
                color: '#555', fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 1.5,
                margin: '0 0 12px',
              }}>
                Your Commitments
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {PILLARS.map(p => {
                  const confirmed = !!commit[`${p.key}_confirmed`]
                  const text      = commit[`${p.key}_commitment`] || ''
                  return (
                    <div key={p.key} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}>
                      {/* Pillar icon */}
                      <span style={{ marginTop: 1, flexShrink: 0 }}>
                        <PillarIcon
                          pillar={p.key}
                          size={15}
                          color={confirmed ? GOLD : '#3a3a3a'}
                        />
                      </span>

                      {/* Label + commitment text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: confirmed ? GOLD : '#555',
                          textTransform: 'uppercase', letterSpacing: 1,
                        }}>
                          {p.label}
                        </span>
                        {text ? (
                          <p style={{
                            margin: '3px 0 0', fontSize: 13, color: '#888',
                            lineHeight: 1.5, fontStyle: 'italic',
                          }}>
                            "{text}"
                          </p>
                        ) : (
                          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#3a3a3a' }}>
                            No text recorded.
                          </p>
                        )}
                      </div>

                      {/* Check / X */}
                      <span style={{
                        fontSize: 14,
                        color: confirmed ? GOLD : '#2a2a2a',
                        fontWeight: 700, flexShrink: 0,
                        marginTop: 1,
                      }}>
                        {confirmed ? '✓' : '✗'}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* ── CARRIED FORWARD ── */}
              {commit.carry_forward && (
                <>
                  <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '16px 0 14px' }} />
                  <p style={{
                    color: '#555', fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: 1.5,
                    margin: '0 0 10px',
                  }}>
                    Carried Forward
                  </p>
                  {/* Gold left border block */}
                  <div style={{
                    borderLeft: '3px solid #C9A84C',
                    paddingLeft: 12,
                  }}>
                    <p style={{
                      color: '#C9A84C', fontSize: 14, fontStyle: 'italic',
                      lineHeight: 1.65, margin: 0,
                    }}>
                      "{commit.carry_forward}"
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────
export default function History() {
  const { user } = useAuth()

  const [commits, setCommits]   = useState({})   // keyed by YYYY-MM-DD
  const [loading, setLoading]   = useState(true)
  const [visible, setVisible]   = useState(7)     // how many days to show

  const today = getLocalDate()

  const fetchCommits = useCallback(async () => {
    if (!user?.id) { setLoading(false); return }
    setLoading(true)

    const from = getLocalDateOffset(29)
    const { data } = await supabase
      .from('daily_commits')
      .select('*')
      .eq('user_id', user.id)
      .gte('commit_date', from)
      .order('commit_date', { ascending: false })

    const map = {}
    for (const row of (data || [])) {
      map[row.commit_date] = row
    }
    setCommits(map)
    setLoading(false)
  }, [user?.id])

  useEffect(() => { fetchCommits() }, [fetchCommits])

  // Full 30-day range regardless of whether a commit exists
  const allDates = buildDateRange(30)
  const visibleDates = allDates.slice(0, visible)

  return (
    <div className="app-shell">
      <style>{CSS}</style>

      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">Your Journey</span>
        </div>
      </header>

      <main className="main-content" style={{ paddingBottom: 80 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 24 }}>
          <p style={{
            margin: '0 0 4px',
            color: '#fff', fontSize: 22, fontWeight: 800, letterSpacing: 0.5,
          }}>
            YOUR JOURNEY
          </p>
          <p style={{ margin: 0, color: '#555', fontSize: 14, fontStyle: 'italic' }}>
            Every day is a chapter.
          </p>
        </div>

        {/* ── Cards ── */}
        {loading ? (
          <div>
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{
                height: 54, borderRadius: 14, marginBottom: 10,
                background: 'rgba(255,255,255,0.03)',
                animation: 'hj-pulse 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.08}s`,
              }} />
            ))}
          </div>
        ) : (
          <>
            {visibleDates.map(dateStr => (
              <DayCard
                key={dateStr}
                dateStr={dateStr}
                commit={commits[dateStr] ?? null}
                isToday={dateStr === today}
              />
            ))}

            {/* ── Load more ── */}
            {visible < 30 && (
              <button
                onClick={() => setVisible(v => Math.min(v + 7, 30))}
                style={{
                  width: '100%', marginTop: 8,
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '13px 0',
                  color: '#555', fontSize: 13, letterSpacing: 0.5,
                  cursor: 'pointer',
                }}
              >
                Load more
              </button>
            )}

            {visible >= 30 && (
              <p style={{
                textAlign: 'center', color: '#333',
                fontSize: 12, fontStyle: 'italic', marginTop: 16,
              }}>
                30 days shown — that's your recent chapter.
              </p>
            )}
          </>
        )}
      </main>
    </div>
  )
}
