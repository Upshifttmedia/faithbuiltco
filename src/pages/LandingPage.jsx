import ArmorShield from '../components/Dashboard/ArmorShield'

const WALK_FORWARD = `
  @keyframes walkForward {
    0%   { transform:translateX(0px)  translateY(0px)  rotate(0deg);  filter:brightness(10) drop-shadow(0 0 4px #C9A84C); }
    25%  { transform:translateX(3px)  translateY(-2px) rotate(2deg);  filter:brightness(10) drop-shadow(0 0 12px #C9A84C); }
    50%  { transform:translateX(6px)  translateY(0px)  rotate(0deg);  filter:brightness(10) drop-shadow(0 0 4px #C9A84C); }
    75%  { transform:translateX(3px)  translateY(-2px) rotate(-2deg); filter:brightness(10) drop-shadow(0 0 12px #C9A84C); }
    100% { transform:translateX(0px)  translateY(0px)  rotate(0deg);  filter:brightness(10) drop-shadow(0 0 4px #C9A84C); }
  }
  @keyframes lp-pulse {
    0%, 100% { opacity: 0.4; transform: translateY(0); }
    50%       { opacity: 1;   transform: translateY(4px); }
  }
`

// Shared style objects
const BC = "'Barlow Condensed', sans-serif"
const SERIF = "'Georgia', 'Times New Roman', serif"

const goldLabel = {
  fontFamily: BC,
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: '4px',
  color: '#C9A84C',
  textTransform: 'uppercase',
  margin: 0,
}

const sectionHeadline = {
  fontFamily: BC,
  fontWeight: 800,
  fontSize: 36,
  color: '#fff',
  lineHeight: 1.2,
  margin: '16px 0 0',
  textTransform: 'uppercase',
}

const sectionBody = {
  fontFamily: SERIF,
  fontSize: 15,
  color: '#888',
  lineHeight: 1.8,
  margin: '24px auto 0',
  maxWidth: 320,
}

const ctaBtn = {
  display: 'inline-block',
  background: '#C9A84C',
  color: '#000',
  fontFamily: BC,
  fontWeight: 700,
  fontSize: 18,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  padding: '18px 48px',
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  marginTop: 40,
}

export default function LandingPage({ onEnter }) {
  return (
    <div style={{ background: '#0a0a0a', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <style>{WALK_FORWARD}</style>

      {/* ── SECTION 1 — HERO ──────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '0 24px 64px',
        background: `linear-gradient(rgba(0,0,0,0.65),rgba(0,0,0,0.65)), url('/bg-splash.jpg') center / cover no-repeat`,
      }}>
        {/* Cross icon */}
        <img
          src="/pickupyourcross.png"
          alt=""
          style={{
            width: 50, height: 50,
            mixBlendMode: 'screen',
            filter: 'brightness(10) drop-shadow(0 0 8px #C9A84C)',
            opacity: 0.7,
            animation: 'walkForward 1.2s ease-in-out infinite',
            marginBottom: 24,
          }}
        />

        {/* Headline */}
        <h1 style={{
          fontFamily: BC,
          fontWeight: 800,
          fontSize: 52,
          color: '#fff',
          lineHeight: 1.1,
          margin: 0,
          textTransform: 'uppercase',
        }}>
          Most men don't<br />collapse in<br />their faith.
        </h1>

        {/* Subheadline */}
        <p style={{
          fontFamily: BC,
          fontWeight: 400,
          fontSize: 18,
          color: '#C9A84C',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: '16px 0 0',
        }}>
          They drift.
        </p>

        {/* Body */}
        <p style={{
          fontFamily: SERIF,
          fontSize: 16,
          color: '#aaa',
          textAlign: 'center',
          maxWidth: 300,
          margin: '24px auto 0',
          lineHeight: 1.7,
        }}>
          FaithBuilt is the daily system<br />that ends the drift.
        </p>

        {/* CTA */}
        <button style={ctaBtn} onClick={onEnter}>
          Begin the Work →
        </button>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}>
          <span style={{
            color: '#C9A84C',
            fontSize: 18,
            animation: 'lp-pulse 1.8s ease-in-out infinite',
            display: 'block',
          }}>↓</span>
          <span style={{ color: '#555', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase' }}>
            scroll
          </span>
        </div>
      </section>

      {/* ── SECTION 2 — THE PROBLEM ───────────────────────────────── */}
      <section style={{ background: '#0a0a0a', padding: '80px 24px', maxWidth: 480, margin: '0 auto' }}>
        <p style={goldLabel}>The Problem</p>
        <h2 style={sectionHeadline}>
          Every other faith app<br />gives you content<br />to consume.
        </h2>
        <p style={sectionBody}>
          Bible plans. Devotionals. Podcasts.{' '}
          More things to read, watch, and listen to.
          <br /><br />
          FaithBuilt is different.
          <br /><br />
          There's nothing to consume here.
          No plan to follow. No content to stream.
          <br /><br />
          Just four pillars, your word, and a daily
          record of who you're becoming.
        </p>
      </section>

      {/* ── SECTION 3 — HOW IT WORKS ──────────────────────────────── */}
      <section style={{ background: '#0f0f0f', padding: '80px 24px', maxWidth: 480, margin: '0 auto' }}>
        <p style={goldLabel}>The Daily Loop</p>
        <h2 style={sectionHeadline}>
          Three moments.<br />One day at a time.
        </h2>

        {[
          {
            phase: 'Morning',
            title: 'Declare who you are today.',
            body: 'Write your commitment across four pillars — Faith, Body, Mind, and Stewardship. Your word. Your standard.',
          },
          {
            phase: 'Throughout the Day',
            title: 'Show up. Check off.',
            body: 'As you complete each pillar, your Armor Shield fills. Four quadrants. All earned.',
          },
          {
            phase: 'Evening',
            title: 'Account for your day.',
            body: 'Did you show up as who you said you were? Honest reflection. Streak locked in. The loop closes.',
          },
        ].map(card => (
          <div key={card.phase} style={{
            background: '#1a1a1a',
            borderLeft: '3px solid #C9A84C',
            borderRadius: 8,
            padding: 20,
            marginTop: 16,
          }}>
            <p style={{ ...goldLabel, fontSize: 10, marginBottom: 10 }}>{card.phase}</p>
            <p style={{
              fontFamily: BC,
              fontWeight: 700,
              fontSize: 18,
              color: '#fff',
              margin: '0 0 8px',
            }}>
              {card.title}
            </p>
            <p style={{
              fontFamily: SERIF,
              fontSize: 13,
              color: '#888',
              margin: 0,
              lineHeight: 1.7,
            }}>
              {card.body}
            </p>
          </div>
        ))}
      </section>

      {/* ── SECTION 4 — THE SHIELD ────────────────────────────────── */}
      <section style={{
        background: '#0a0a0a',
        padding: '80px 24px',
        textAlign: 'center',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        <p style={goldLabel}>Your Armor</p>
        <h2 style={sectionHeadline}>The Armor Shield.</h2>
        <p style={{ ...sectionBody, textAlign: 'center' }}>
          Every day you show up, your shield fills.
          Faith. Body. Mind. Stewardship.
          <br />
          Four disciplines. One man. Built daily.
        </p>

        {/* Shield — all 4 filled */}
        <div style={{ margin: '32px auto 0', display: 'flex', justifyContent: 'center' }}>
          <ArmorShield
            faithConfirmed={true}
            bodyConfirmed={true}
            mindConfirmed={true}
            stewardshipConfirmed={true}
          />
        </div>

        <p style={{
          fontFamily: SERIF,
          fontSize: 13,
          color: '#555',
          fontStyle: 'italic',
          margin: '24px auto 0',
          lineHeight: 1.8,
        }}>
          "Put on the full armor of God."<br />
          <span style={{ letterSpacing: '1px' }}>— Ephesians 6:11</span>
        </p>
      </section>

      {/* ── SECTION 5 — BROTHERHOOD TEASE ─────────────────────────── */}
      <section style={{ background: '#0f0f0f', padding: '80px 24px', maxWidth: 480, margin: '0 auto' }}>
        <p style={goldLabel}>Coming Soon</p>
        <h2 style={sectionHeadline}>
          You weren't built<br />to do this alone.
        </h2>
        <p style={{ ...sectionBody, maxWidth: 300, margin: '24px auto 0' }}>
          Iron sharpens iron.
          <br /><br />
          Accountability squads are coming to FaithBuilt —
          small groups of brothers who show up daily,
          hold each other accountable, and refuse
          to let each other drift.
          <br /><br />
          No man left behind.
        </p>
      </section>

      {/* ── SECTION 6 — FINAL CTA ─────────────────────────────────── */}
      <section style={{
        position: 'relative',
        padding: '100px 24px',
        textAlign: 'center',
        background: `linear-gradient(rgba(0,0,0,0.75),rgba(0,0,0,0.75)), url('/bg-celebration.jpg') center / cover no-repeat`,
      }}>
        <h2 style={{
          fontFamily: BC,
          fontWeight: 800,
          fontSize: 48,
          color: '#fff',
          lineHeight: 1.1,
          margin: 0,
          textTransform: 'uppercase',
        }}>
          The man you're<br />becoming is built<br />one day at a time.
        </h2>

        <p style={{
          fontFamily: BC,
          fontWeight: 400,
          fontSize: 16,
          color: '#C9A84C',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: '16px 0 0',
        }}>
          This is that day.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button style={ctaBtn} onClick={onEnter}>
            Begin the Work →
          </button>
          <p style={{
            fontFamily: SERIF,
            fontSize: 12,
            color: '#666',
            margin: '16px 0 0',
          }}>
            Free to start. No credit card required.
          </p>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{
        background: '#000',
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: BC,
          fontWeight: 700,
          fontSize: 18,
          color: '#fff',
          margin: 0,
        }}>
          FaithBuilt
        </p>
        <p style={{
          fontFamily: BC,
          fontWeight: 400,
          fontSize: 11,
          color: '#C9A84C',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          margin: '4px 0 0',
        }}>
          Faith. Discipline. Daily.
        </p>
        <p style={{
          fontSize: 11,
          color: '#444',
          margin: '16px 0 0',
        }}>
          © 2026 FaithBuilt. Built for the builder in you.
        </p>
      </footer>
    </div>
  )
}
