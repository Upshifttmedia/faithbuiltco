import { useState, useEffect } from 'react'
import { useAuth }        from '../hooks/useAuth'
import { useStreak }      from '../hooks/useStreak'
import { useDailyCommit } from '../hooks/useDailyCommit'
import { getLocalDate }   from '../lib/dateUtils'
import ArmorShield        from '../components/Dashboard/ArmorShield'
import { supabase }       from '../lib/supabase'
import Toast              from '../components/Toast'

const PILLARS = [
  { key: 'faith',       icon: '✦', label: 'Faith',       desc: 'Scripture and prayer' },
  { key: 'body',        icon: '⚡', label: 'Body',        desc: 'Move your body 20+ minutes' },
  { key: 'mind',        icon: '◈', label: 'Mind',        desc: 'Remove distraction, raise standards' },
  { key: 'stewardship', icon: '◆', label: 'Stewardship', desc: 'Own your responsibilities' },
]

// Greeting based on local hour
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning,'
  if (h < 17) return 'Good afternoon,'
  return 'Good evening,'
}

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

// Keyframe CSS injected once
const ANIMATIONS = `
  @keyframes db-fade  { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
  @keyframes db-pulse { 0%,100% { opacity:1 } 50% { opacity:0.55 } }
  @keyframes db-flash { 0% { background:rgba(201,168,76,0) } 40% { background:rgba(201,168,76,0.25) } 100% { background:rgba(201,168,76,0) } }
  @keyframes db-pop   { 0% { transform:scale(1) } 35% { transform:scale(1.18) } 70% { transform:scale(0.95) } 100% { transform:scale(1) } }
  @keyframes db-glow  { 0%,100% { box-shadow:0 0 0 0 rgba(201,168,76,0.3) } 50% { box-shadow:0 0 16px 4px rgba(201,168,76,0.5) } }
  @keyframes db-border-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.25), inset 0 0 0 0 rgba(201,168,76,0) }
    50%     { box-shadow: 0 0 12px 3px rgba(201,168,76,0.35), inset 0 0 0 0 rgba(201,168,76,0) }
  }
`

// ── Shield + streak stats block ───────────────────────────────────────
function ShieldWithStats({ commit, streak }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 8px' }}>
      <ArmorShield
        faithConfirmed={!!commit?.faith_confirmed}
        bodyConfirmed={!!commit?.body_confirmed}
        mindConfirmed={!!commit?.mind_confirmed}
        stewardshipConfirmed={!!commit?.stewardship_confirmed}
      />

      {/* Stats row: current streak (left) | divider | best (right) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', marginTop: 20, padding: '0 40px', boxSizing: 'border-box',
      }}>
        {/* Left — current streak: [number][cross image] then label below */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>
              {streak.current_streak}
            </span>
            <img
              src="/pickupyourcross.png"
              width={32} height={32}
              alt=""
              style={{ display: 'block', objectFit: 'contain' }}
            />
          </div>
          <span style={{ fontSize: 11, color: '#666', letterSpacing: 0.5, marginTop: 5 }}>
            day streak{streak.grace_active && <span title="Grace day active — streak protected"> 🛡</span>}
          </span>
        </div>

        {/* Vertical divider */}
        <div style={{ width: 1, height: 52, background: 'rgba(255,255,255,0.1)', flexShrink: 0 }} />

        {/* Right — best streak: number then label below */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
            {streak.longest_streak}
          </span>
          <span style={{ fontSize: 11, color: '#666', letterSpacing: 1, textTransform: 'uppercase', marginTop: 5 }}>
            Best
          </span>
        </div>
      </div>
    </div>
  )
}

// ── Review modal ─────────────────────────────────────────────────────
function ReviewModal({ commit, onClose }) {
  const confirmedCount = PILLARS.filter(p => commit[`${p.key}_confirmed`]).length

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.92)',
      zIndex: 80,
      overflowY: 'auto',
      padding: '24px 20px 60px',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#fff', fontSize: 20, fontWeight: 700 }}>Today's Commitments</h2>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#888', fontSize: 24, cursor: 'pointer', padding: '4px 8px' }}
        >
          ✕
        </button>
      </div>

      <p style={{ color: '#555', fontSize: 13, margin: '0 0 20px' }}>
        {confirmedCount}/4 pillars confirmed
      </p>

      {PILLARS.map(p => {
        const text      = commit[`${p.key}_commitment`] ?? ''
        const confirmed = !!commit[`${p.key}_confirmed`]
        return (
          <div key={p.key} style={{
            background: confirmed ? 'rgba(201,168,76,0.07)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${confirmed ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 12, padding: '14px 16px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20, minWidth: 24 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#C9A84C', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {p.label}
                </p>
                <p style={{ margin: 0, color: '#ccc', fontSize: 14, lineHeight: 1.5 }}>
                  {text || <span style={{ color: '#444', fontStyle: 'italic' }}>No commitment recorded</span>}
                </p>
              </div>
              {confirmed && (
                <span style={{ color: '#4DD9C0', fontSize: 18, flexShrink: 0 }}>✓</span>
              )}
            </div>
          </div>
        )
      })}

      <button className="btn-primary" style={{ marginTop: 16 }} onClick={onClose}>
        Close
      </button>
    </div>
  )
}

// ── All-4 celebration overlay ────────────────────────────────────────
function AllFourOverlay({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      zIndex: 90, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '0 32px',
    }}>
      <div style={{ fontSize: 80, animation: 'db-pop 0.5s ease, db-glow 1.5s ease 0.4s infinite' }}>
        🔥
      </div>
      <h1 style={{ color: '#C9A84C', fontSize: 36, fontWeight: 900, margin: '24px 0 12px', letterSpacing: 2 }}>
        All four.
      </h1>
      <p style={{ color: '#888', fontSize: 17 }}>
        You showed up today. Finish strong tonight.
      </p>
    </div>
  )
}

// ── Edit commitment modal (slides up from bottom) ────────────────────
function EditCommitmentModal({ pillar, initialText, onSave, onCancel }) {
  const [text, setText] = useState(initialText ?? '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(text.trim())
    setSaving(false)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 95,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <style>{`
        @keyframes sheet-up { from { transform:translateY(100%) } to { transform:translateY(0) } }
      `}</style>
      <div style={{
        width: '100%',
        background: '#1a1a1a',
        borderRadius: '18px 18px 0 0',
        padding: '24px 20px 40px',
        animation: 'sheet-up 0.28s cubic-bezier(0.32,0.72,0,1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>{pillar.icon}</span>
          <p style={{
            margin: 0, fontSize: 14, fontWeight: 700,
            color: '#C9A84C', textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {pillar.label}
          </p>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={200}
          rows={4}
          autoFocus
          placeholder={`What will you commit to for ${pillar.label} today?`}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: '#111', color: '#e0e0e0',
            border: '1.5px solid #333',
            borderRadius: 10, padding: '12px 14px',
            fontSize: 15, lineHeight: 1.55,
            resize: 'none', outline: 'none',
            transition: 'border-color 0.2s ease',
            fontFamily: 'inherit',
          }}
          onFocus={e => { e.target.style.borderColor = '#C9A84C' }}
          onBlur={e => { e.target.style.borderColor = '#333' }}
        />
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#444', textAlign: 'right' }}>
          {text.length}/200
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '13px 0',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, color: '#888',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !text.trim()}
            style={{
              flex: 1, padding: '13px 0',
              background: saving || !text.trim() ? 'rgba(201,168,76,0.35)' : '#C9A84C',
              border: 'none',
              borderRadius: 10, color: '#000',
              fontSize: 15, fontWeight: 700, cursor: saving ? 'wait' : 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            {saving ? 'Saving…' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pillar checkmark card (day phase) ────────────────────────────────
function PillarCheckCard({ pillar, commitment, confirmed, animating, onConfirm, onEditTap }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      background: confirmed
        ? 'rgba(201,168,76,0.08)'
        : 'rgba(255,255,255,0.03)',
      border: `1px solid ${confirmed ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 14,
      padding: '16px 14px',
      marginBottom: 10,
      transition: 'background 0.3s ease, border-color 0.3s ease',
      animation: animating ? 'db-flash 0.4s ease' : undefined,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>{pillar.icon}</span>
          <p style={{
            margin: 0, fontSize: 12, fontWeight: 700,
            color: '#C9A84C', textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {pillar.label}
          </p>
        </div>
        {/* Tapping the text opens the edit sheet */}
        <p
          onClick={onEditTap}
          style={{
            margin: 0, color: '#bbb', fontSize: 14, lineHeight: 1.55,
            cursor: onEditTap ? 'pointer' : 'default',
          }}
        >
          {commitment
            ? <>{commitment}<span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginLeft: 6, verticalAlign: 'middle' }}><span style={{ color: '#C9A84C', fontSize: 18, lineHeight: 1 }}>✎</span><span style={{ color: '#666', fontSize: 10, fontWeight: 600, letterSpacing: 0.5 }}>Edit</span></span></>
            : <span style={{ color: '#444', fontStyle: 'italic' }}>Tap to add commitment…</span>
          }
        </p>
      </div>

      {/* Circular checkmark button — always clickable so confirmed pillars can be toggled off */}
      <button
        onClick={onConfirm}
        style={{
          flexShrink: 0,
          width: 36, height: 36,
          borderRadius: '50%',
          border: `2px solid ${confirmed ? '#C9A84C' : 'rgba(255,255,255,0.18)'}`,
          background: confirmed ? '#C9A84C' : 'transparent',
          color: confirmed ? '#000' : 'rgba(255,255,255,0.3)',
          fontSize: 16, fontWeight: 700,
          cursor: confirmed ? 'default' : 'pointer',
          transition: 'all 0.25s ease',
          animation: animating ? 'db-pop 0.35s ease' : undefined,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginTop: 2,
        }}
        aria-label={confirmed ? `${pillar.label} confirmed` : `Confirm ${pillar.label}`}
      >
        ✓
      </button>
    </div>
  )
}

// ── Greyed-out morning preview card ─────────────────────────────────
function PillarPreviewCard({ pillar, text }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 14,
      padding: '14px',
      marginBottom: 8,
      opacity: 0.6,
    }}>
      <span style={{ fontSize: 20, minWidth: 24 }}>{pillar.icon}</span>
      <div>
        <p style={{ margin: '0 0 3px', fontSize: 11, color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
          {pillar.label}
        </p>
        <p style={{ margin: 0, color: '#555', fontSize: 13, lineHeight: 1.5, fontStyle: text ? 'normal' : 'italic' }}>
          {text || pillar.desc}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────

export default function Dashboard({ navigate, userId }) {
  const { user, profile }                   = useAuth()
  const { streak }                          = useStreak(userId)
  const { commit, yesterdayCommit, loading, fetchError, confirmPillar, unconfirmPillar, updateCommitment, refetch } = useDailyCommit(userId)
  const [toast, setToast] = useState(null)

  const [animating, setAnimating]     = useState(null)   // pillar key being animated
  const [showAllFour, setShowAllFour] = useState(false)
  const [showReview, setShowReview]   = useState(false)
  const [editingPillar, setEditing]   = useState(null)   // pillar object being edited
  const [eveningTime, setEveningTime] = useState(null)   // "HH:MM" from push_subscriptions

  // Show toast when daily_commits fetch fails
  useEffect(() => {
    if (fetchError) {
      setToast({ message: 'Having trouble loading your data. Pull to refresh.', type: 'error' })
    }
  }, [fetchError])

  const displayName = profile?.display_name
    || user?.user_metadata?.display_name
    || 'Builder'

  // Fetch this user's chosen evening notification time
  useEffect(() => {
    if (!userId) return
    supabase
      .from('push_subscriptions')
      .select('evening_time')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.evening_time) setEveningTime(data.evening_time)
      })
  }, [userId])

  // Derive phase from commit state
  const phase = !commit?.morning_done
    ? 'morning'
    : !commit?.evening_done
      ? 'day'
      : 'done'

  // Count confirmed pillars
  const confirmedCount = commit
    ? PILLARS.filter(p => commit[`${p.key}_confirmed`]).length
    : 0

  // Show evening CTA only when: morning done, evening not yet done,
  // AND current local time >= user's evening_time from push_subscriptions.
  // Falls back to 20:00 if no push subscription exists for this user.
  const showEveningCTA = phase === 'day' && (() => {
    const time = eveningTime ?? '20:00'
    const [hh, mm] = time.split(':').map(Number)
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes() >= hh * 60 + (mm || 0)
  })()

  async function handleConfirm(pillarKey) {
    if (!commit) return
    setAnimating(pillarKey)

    if (commit[`${pillarKey}_confirmed`]) {
      // Toggle OFF — unconfirm
      await unconfirmPillar(pillarKey)
    } else {
      // Toggle ON — confirm
      const updated = await confirmPillar(pillarKey)
      // Show all-four celebration when 4th pillar is confirmed
      if (updated) {
        const nowCount = PILLARS.filter(p => updated[`${p.key}_confirmed`]).length
        if (nowCount === 4) setShowAllFour(true)
      }
    }

    setTimeout(() => setAnimating(null), 400)
  }

  if (loading) {
    return <div className="loader-screen"><div className="loader-icon">✦</div></div>
  }


  return (
    <div className="app-shell">
      <style>{ANIMATIONS}</style>
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}

      {/* All-4 celebration overlay */}
      {showAllFour && <AllFourOverlay onDone={() => setShowAllFour(false)} />}

      {/* Review modal */}
      {showReview && commit && (
        <ReviewModal commit={commit} onClose={() => setShowReview(false)} />
      )}

      {/* Edit commitment modal */}
      {editingPillar && commit && (
        <EditCommitmentModal
          pillar={editingPillar}
          initialText={commit[`${editingPillar.key}_commitment`] ?? ''}
          onSave={async (text) => {
            await updateCommitment(editingPillar.key, text)
            setEditing(null)
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span className="brand-name">FaithBuilt</span>
        </div>
      </header>

      <main className="main-content">

        {/* ── MORNING PHASE ─────────────────────────────────────────── */}
        {phase === 'morning' && (
          <>
            {/* Greeting */}
            <div style={{ animation: 'db-fade 0.4s ease', marginBottom: 4 }}>
              <p style={{ margin: '0 0 6px', color: '#666', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                {getGreeting()}
              </p>
              <h1 style={{ margin: '0 0 6px', color: '#fff', fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>
                {displayName}
              </h1>
              <p style={{ margin: '0 0 10px', color: '#555', fontSize: 13, letterSpacing: 0.3 }}>
                {todayLabel}
              </p>
              <p style={{ margin: 0, color: '#888', fontSize: 15, fontStyle: 'italic' }}>
                What are you committing to today?
              </p>
            </div>

            {/* Primary CTA */}
            <button
              className="btn-primary btn-cta"
              style={{
                marginTop: 24, marginBottom: 24,
                background: '#C9A84C', color: '#000',
                fontWeight: 800, fontSize: 17, letterSpacing: 0.5,
              }}
              onClick={() => navigate('checkin')}
            >
              Begin Your Morning
            </button>

            {/* Shield + streak stats */}
            <ShieldWithStats commit={null} streak={streak} />

            {/* Yesterday's pillars (greyed out) */}
            <div style={{ marginTop: 24 }}>
              <p className="section-heading" style={{ marginBottom: 12 }}>Today's Pillars</p>
              {PILLARS.map(p => (
                <PillarPreviewCard
                  key={p.key}
                  pillar={p}
                  text={yesterdayCommit?.[`${p.key}_commitment`] ?? ''}
                />
              ))}
            </div>
          </>
        )}

        {/* ── DAY PHASE ─────────────────────────────────────────────── */}
        {phase === 'day' && (
          <>
            {/* Status card */}
            <div style={{
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: 14, padding: '18px 16px',
              marginBottom: 20,
              animation: 'db-fade 0.4s ease',
            }}>
              <p style={{ margin: '0 0 4px', color: '#C9A84C', fontSize: 17, fontWeight: 800 }}>
                Committed. Now go do it.
              </p>
              <p style={{ margin: 0, color: '#777', fontSize: 14 }}>
                Check off each pillar as you complete it.
              </p>
            </div>

            {/* Name label above shield */}
            <p style={{ margin: '0 0 2px', color: '#444', fontSize: 12, textAlign: 'center', letterSpacing: 0.5 }}>
              {displayName}
            </p>

            {/* Shield + streak stats */}
            <ShieldWithStats commit={commit} streak={streak} />

            {/* Pillar checkmark cards */}
            <p className="section-heading" style={{ marginBottom: 12 }}>Today's Pillars</p>
            {PILLARS.map(p => (
              <PillarCheckCard
                key={p.key}
                pillar={p}
                commitment={commit[`${p.key}_commitment`]}
                confirmed={!!commit[`${p.key}_confirmed`]}
                animating={animating === p.key}
                onConfirm={() => handleConfirm(p.key)}
                onEditTap={() => setEditing(p)}
              />
            ))}

            {/* Evening CTA — visible when current time >= user's chosen evening_time */}
            {showEveningCTA && (
              <div style={{
                border: '1.5px solid #C9A84C',
                borderRadius: 14, padding: '18px 20px',
                marginTop: 20, marginBottom: 4,
                background: 'rgba(201,168,76,0.05)',
                animation: 'db-border-pulse 2.5s ease infinite',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <span style={{ color: '#C9A84C', fontSize: 18, flexShrink: 0, marginTop: 2 }}>✦</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: '0 0 5px', color: '#C9A84C', fontSize: 15, fontWeight: 700 }}>
                      Evening reflection is ready.
                    </p>
                    <p style={{ margin: 0, color: '#888', fontSize: 13, lineHeight: 1.5 }}>
                      The day is almost done. Close the loop.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('evening')}
                  style={{
                    width: '100%', background: '#C9A84C',
                    border: 'none', borderRadius: 10,
                    padding: '13px 0', color: '#000',
                    fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  }}
                >
                  Begin Reflection →
                </button>
              </div>
            )}
          </>
        )}

        {/* ── DONE PHASE ────────────────────────────────────────────── */}
        {phase === 'done' && (
          <>
            {/* Status card */}
            <div style={{
              background: 'rgba(201,168,76,0.06)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 14, padding: '18px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20,
              animation: 'db-fade 0.4s ease',
            }}>
              <div>
                <p style={{ margin: '0 0 4px', color: '#C9A84C', fontSize: 17, fontWeight: 800 }}>
                  Today you showed up. ✓
                </p>
                <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
                  {confirmedCount === 4
                    ? 'All pillars aligned.'
                    : `${confirmedCount}/4 pillars confirmed.`}
                </p>
              </div>
              <button
                className="btn-outline"
                style={{ flexShrink: 0, fontSize: 13, padding: '8px 14px' }}
                onClick={() => setShowReview(true)}
              >
                Review
              </button>
            </div>

            {/* Shield + streak stats (read-only) */}
            <ShieldWithStats commit={commit} streak={streak} />

            {/* Pillar done cards (read-only) */}
            <p className="section-heading" style={{ marginBottom: 12 }}>Today's Pillars</p>
            {PILLARS.map(p => (
              <PillarCheckCard
                key={p.key}
                pillar={p}
                commitment={commit[`${p.key}_commitment`]}
                confirmed={!!commit[`${p.key}_confirmed`]}
                animating={false}
                onConfirm={() => {}}
              />
            ))}
          </>
        )}

      </main>

    </div>
  )
}
