import { useState } from 'react'
import { supabase } from '../lib/supabase'

const SLIDES = [
  {
    icon: '✦',
    title: 'Built on Four Pillars',
    body: "Every day you show up across Faith, Body, Mind, and Stewardship \u2014 four disciplines that forge the man you're becoming.",
  },
  {
    icon: '🔥',
    title: 'Consistency Is Character',
    body: "Show up across all four pillars every day. Your streak is visible proof of who you're becoming.",
  },
  {
    icon: '◆',
    title: 'Discipline Is a Decision',
    body: "FaithBuilt is not a motivator \u2014 it's a mirror. Show up daily and it will reflect exactly who you're becoming.",
  },
]

const COMMITMENT_OPTIONS = [
  { days: 3, label: '3 days / week', sub: 'Getting started' },
  { days: 5, label: '5 days / week', sub: 'Building momentum' },
  { days: 7, label: '7 days / week', sub: 'Full commitment' },
]

const DEFAULT_IDENTITY = 'I am a man of faith, discipline, and character.'

export default function Onboarding({ userId, onComplete }) {
  const [slide, setSlide]               = useState(0)
  const [showName, setShowName]         = useState(false)
  const [showIdentity, setShowIdentity] = useState(false)
  const [showCommit, setShowCommit]     = useState(false)
  const [name, setName]                 = useState('')
  const [commitment, setCommitment]     = useState(7)
  const [identity, setIdentity]         = useState(DEFAULT_IDENTITY)

  function nextSlide() {
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1)
    } else {
      setShowName(true)
    }
  }

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
            id: userId,
            display_name: name.trim(),
            commitment_days: commitment,
            onboarding_done: true,
            identity_statement: identity.trim() || DEFAULT_IDENTITY,
          },
          { onConflict: 'id' }
        )
    }
  }

  // ── Commitment screen ────────────────────────────────────────────────
  if (showCommit) {
    return (
      <div className="onboarding-screen">
        <div className="onboarding-commit">
          <div className="onboard-icon">◆</div>
          <h2 className="onboard-title">Make the Commitment</h2>
          <p className="onboard-body">How many days per week will you show up?</p>

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

          <button className="btn-primary onboard-btn" onClick={finish}>
            Start →
          </button>

          <button className="link-btn onboard-back" onClick={() => { setShowCommit(false); setShowIdentity(true) }}>
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // ── Identity statement screen ────────────────────────────────────────
  if (showIdentity) {
    return (
      <div className="onboarding-screen">
        <div className="onboarding-commit">
          <div className="onboard-icon">✦</div>
          <h2 className="onboard-title">Who Are You Becoming?</h2>
          <p className="onboard-body">
            This statement will anchor every morning. Write it in the present tense — as who you already are.
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

          <button className="btn-primary onboard-btn" onClick={() => setShowCommit(true)}>
            This is who I am {'\u2192'}
          </button>

          <button className="link-btn onboard-back" onClick={() => { setShowIdentity(false); setShowName(true) }}>
            {'\u2190'} Back
          </button>
        </div>
      </div>
    )
  }

  // ── Name screen ──────────────────────────────────────────────────────
  if (showName) {
    return (
      <div className="onboarding-screen">
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
            onClick={() => setShowIdentity(true)}
            disabled={!name.trim()}
          >
            That's me {'\u2192'}
          </button>

          <button className="link-btn onboard-back" onClick={() => { setShowName(false); setSlide(SLIDES.length - 1) }}>
            {'\u2190'} Back
          </button>
        </div>
      </div>
    )
  }

  // ── Intro slides ─────────────────────────────────────────────────────
  const current = SLIDES[slide]

  return (
    <div className="onboarding-screen">
      {/* Progress dots */}
      <div className="onboard-dots">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`onboard-dot${i === slide ? ' onboard-dot--active' : ''}`}
          />
        ))}
      </div>

      <div className="onboard-slide">
        <div className="onboard-icon">{current.icon}</div>
        <h2 className="onboard-title">{current.title}</h2>
        <p className="onboard-body">{current.body}</p>
      </div>

      <button className="btn-primary onboard-btn" onClick={nextSlide}>
        {slide < SLIDES.length - 1 ? 'Next →' : 'Continue →'}
      </button>

      {slide > 0 && (
        <button className="link-btn onboard-back" onClick={() => setSlide(slide - 1)}>
          ← Back
        </button>
      )}
    </div>
  )
}
