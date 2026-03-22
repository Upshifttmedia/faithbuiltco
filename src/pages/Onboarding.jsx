import { useState } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULT_IDENTITY = 'I am a man of faith, discipline, and character.'
const TOTAL_STEPS = 8 // slide steps 1–8; step 0 is the mission screen (no dots)

const COMMITMENT_OPTIONS = [
  { days: 3, label: 'Getting started',   sub: '3 days / week' },
  { days: 5, label: 'Building momentum', sub: '5 days / week' },
  { days: 7, label: 'Full commitment',   sub: '7 days / week' },
]

export default function Onboarding({ userId, onComplete }) {
  const [step, setStep]             = useState(0)
  const [name, setName]             = useState('')
  const [commitment, setCommitment] = useState(7)
  const [identity, setIdentity]     = useState(DEFAULT_IDENTITY)

  function next() { setStep(s => s + 1) }
  function back() { setStep(s => s - 1) }

  function finish() {
    // Set localStorage immediately — no network wait
    localStorage.setItem('fb_onboarding_done', '1')
    // Navigate instantly
    onComplete()
    // Fire-and-forget: persist to Supabase in background
    if (userId) {
      supabase
        .from('profiles')
        .upsert(
          {
            id:                 userId,
            display_name:       name.trim(),
            commitment_days:    commitment,
            onboarding_done:    true,
            identity_statement: identity.trim() || DEFAULT_IDENTITY,
          },
          { onConflict: 'id' }
        )
    }
  }

  // Dots are offset by 1 because step 0 is the pre-slide mission screen.
  // Steps 1–8 map to dot indices 0–7.
  const dots = (
    <div className="onboard-dots">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <span
          key={i}
          className={`onboard-dot${i === step - 1 ? ' onboard-dot--active' : ''}`}
        />
      ))}
    </div>
  )

  // ── Screen 0 — Mission Statement ───────────────────────────────────────
  if (step === 0) return (
    <div style={{
      minHeight: '100dvh',
      background: `linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.72)), url('/bg-onboarding.jpg') center top / cover no-repeat`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 32px',
      textAlign: 'center',
    }}>
      {/* Cross */}
      <img
        src="/pickupyourcross.png"
        alt=""
        style={{ width: 60, height: 60, mixBlendMode: 'screen', marginBottom: 32 }}
      />

      {/* FAITHBUILT label */}
      <div style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: '#C9A84C',
        fontSize: 13,
        fontVariant: 'small-caps',
        letterSpacing: 3,
        textTransform: 'uppercase',
      }}>
        FaithBuilt
      </div>

      {/* Headline */}
      <p style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: '#fff',
        fontSize: 28,
        fontWeight: 700,
        lineHeight: 1.3,
        marginTop: 16,
        marginBottom: 0,
      }}>
        Most men don't collapse in their faith.<br />They drift.
      </p>

      {/* Body */}
      <p style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: '#888',
        fontSize: 15,
        lineHeight: 1.8,
        marginTop: 24,
        maxWidth: 300,
        fontStyle: 'italic',
      }}>
        Small compromises. Skipped mornings. Good intentions that never become discipline.
      </p>

      {/* System line */}
      <p style={{
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: '#fff',
        fontSize: 17,
        fontWeight: 600,
        marginTop: 24,
      }}>
        FaithBuilt is the system that ends the drift.
      </p>

      {/* Tagline */}
      <p style={{
        color: '#888',
        fontSize: 13,
        marginTop: 32,
        letterSpacing: 1,
        lineHeight: 1.8,
      }}>
        Not motivation. Not content.<br />
        A daily structure that holds you accountable<br />
        to becoming who God built you to be.
      </p>

      {/* CTA */}
      <button
        className="btn-primary onboard-btn"
        onClick={next}
        style={{ marginTop: 'auto', paddingTop: 48 }}
      >
        I'm ready to build. →
      </button>
    </div>
  )

  // ── Screen 1 — The Mirror ──────────────────────────────────────────────
  if (step === 1) return (
    <div className="onboarding-screen">
      {dots}
      <div className="onboard-slide">
        <div className="onboard-icon">◆</div>
        <h2 className="onboard-title">You already know what's missing.</h2>
        <p className="onboard-body">
          Most men don't collapse in their faith. They drift. Small compromises.
          Skipped mornings. Good intentions that never become discipline.
          FaithBuilt is the system that ends the drift.
        </p>
      </div>
      <button className="btn-primary onboard-btn" onClick={next}>
        That's me →
      </button>
      <button className="link-btn onboard-back" onClick={back}>← Back</button>
    </div>
  )

  // ── Screen 2 — The Four Pillars ────────────────────────────────────────
  if (step === 2) return (
    <div className="onboarding-screen">
      {dots}
      <div className="onboard-slide">
        <div className="onboard-icon">✦</div>
        <h2 className="onboard-title">Every day. Four disciplines.</h2>
        <p className="onboard-body">
          Faith — the anchor. Body — the temple. Mind — the weapon.
          Stewardship — the calling. Not a checklist. A way of life.
        </p>
      </div>
      <button className="btn-primary onboard-btn" onClick={next}>I'm ready →</button>
      <button className="link-btn onboard-back" onClick={back}>← Back</button>
    </div>
  )

  // ── Screen 3 — The Streak ──────────────────────────────────────────────
  if (step === 3) return (
    <div className="onboarding-screen">
      {dots}
      <div className="onboard-slide">
        <div className="onboard-icon">🔥</div>
        <h2 className="onboard-title">Consistency is character.</h2>
        <p className="onboard-body">
          Every day you show up, your streak grows. Every day you don't,
          the drift starts again. One day at a time. No exceptions.
          No excuses. Just the decision.
        </p>
      </div>
      <button className="btn-primary onboard-btn" onClick={next}>Understood →</button>
      <button className="link-btn onboard-back" onClick={back}>← Back</button>
    </div>
  )

  // ── Screen 4 — The Brotherhood ─────────────────────────────────────────
  if (step === 4) return (
    <div className="onboarding-screen">
      {dots}
      <div className="onboard-slide">
        <div className="onboard-icon">◆</div>
        <h2 className="onboard-title">You weren't built to do this alone.</h2>
        <p className="onboard-body">
          Iron sharpens iron. Inside FaithBuilt you'll find your Brotherhood —
          a small group of men who show up daily, hold each other accountable,
          and refuse to let each other drift. Your Brothers are waiting.
        </p>
      </div>
      <button className="btn-primary onboard-btn" onClick={next}>Let's go →</button>
      <button className="link-btn onboard-back" onClick={back}>← Back</button>
    </div>
  )

  // ── Screen 5 — Name ────────────────────────────────────────────────────
  if (step === 5) return (
    <div className="onboarding-screen">
      {dots}
      <div className="onboarding-commit">
        <div className="onboard-icon">✦</div>
        <h2 className="onboard-title">What's your name, Builder?</h2>
        <p className="onboard-body">
          This is how FaithBuilt will address you every day.
        </p>
        <div className="identity-field-wrap">
          <input
            className="field-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="First name"
            maxLength={50}
            autoFocus
          />
        </div>
        <button
          className="btn-primary onboard-btn"
          onClick={next}
          disabled={!name.trim()}
        >
          That's me →
        </button>
        <button className="link-btn onboard-back" onClick={back}>← Back</button>
      </div>
    </div>
  )

  // ── Screen 6 — The Identity Statement ─────────────────────────────────
  if (step === 6) return (
    <div className="onboarding-screen">
      {dots}
      <div className="onboarding-commit">
        <div className="onboard-icon">✦</div>
        <h2 className="onboard-title">Who are you becoming?</h2>
        <p className="onboard-body">
          Write it in the present tense. As if it's already true. Because it is.
        </p>
        <div className="identity-field-wrap">
          <textarea
            className="identity-textarea"
            value={identity}
            onChange={e => setIdentity(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder={DEFAULT_IDENTITY}
          />
        </div>
        <button className="btn-primary onboard-btn" onClick={next}>
          This is who I am →
        </button>
        <button className="link-btn onboard-back" onClick={back}>← Back</button>
      </div>
    </div>
  )

  // ── Screen 7 — The Commitment ──────────────────────────────────────────
  if (step === 7) return (
    <div className="onboarding-screen">
      {dots}
      <div className="onboarding-commit">
        <div className="onboard-icon">◆</div>
        <h2 className="onboard-title">Make the commitment.</h2>
        <p className="onboard-body">How many days a week will you show up?</p>
        <div className="commit-options">
          {COMMITMENT_OPTIONS.map(opt => (
            <button
              key={opt.days}
              className={`commit-option${commitment === opt.days ? ' commit-option--active' : ''}`}
              onClick={() => setCommitment(opt.days)}
            >
              <span className="commit-days">{opt.label}</span>
              <span className="commit-sub">{opt.sub}</span>
            </button>
          ))}
        </div>
        <button className="btn-primary onboard-btn" onClick={next}>
          This is my word →
        </button>
        <button className="link-btn onboard-back" onClick={back}>← Back</button>
      </div>
    </div>
  )

  // ── Screen 8 — The Send Off ────────────────────────────────────────────
  return (
    <div className="onboarding-screen">
      {dots}
      <div className="onboard-slide">
        <div className="onboard-icon">🔥</div>
        <h2 className="onboard-title">The work starts now.</h2>
        <p className="onboard-body">Not tomorrow. Not after the weekend. Now.</p>
      </div>
      <button className="btn-primary onboard-btn" onClick={finish}>
        Begin the Work →
      </button>
      <button className="link-btn onboard-back" onClick={back}>← Back</button>
    </div>
  )
}
