/**
 * OnboardingScreen — first-time Bible Study setup.
 * Two paths:
 *   "Start fresh"           → guided, John 1
 *   "I'm already studying"  → custom book/chapter/context picker
 *
 * Calls saveOnboarding(path, book, chapter, context) then onComplete().
 */
import { useState } from 'react'
import { ALL_BOOKS, BOOK_CHAPTERS } from '../../data/biblePassages'

const GOLD   = '#C9A84C'
const BC     = "'Barlow Condensed', sans-serif"
const SERIF  = "'Georgia', 'Times New Roman', serif"
const BONE   = '#E8E0D4'

const CONTEXTS = [
  { value: 'personal',       label: 'Personal study' },
  { value: 'sermon',         label: 'Sermon series' },
  { value: 'small-group',    label: 'Small group' },
  { value: 'devotional',     label: 'Devotional plan' },
]

const CSS = `
  @keyframes obs-slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

export default function OnboardingScreen({ saveOnboarding, onComplete, onCancel }) {
  const [selected, setSelected]  = useState(null)   // 'fresh' | 'custom'
  const [book, setBook]          = useState('Genesis')
  const [chapter, setChapter]    = useState(1)
  const [context, setContext]    = useState('personal')
  const [saving, setSaving]      = useState(false)
  const [error, setError]        = useState(null)

  const maxChapter = BOOK_CHAPTERS[book] ?? 1

  // Keep chapter in range when book changes
  function handleBookChange(b) {
    setBook(b)
    setChapter(1)
  }

  async function handleConfirm() {
    if (!selected) return
    setSaving(true)
    setError(null)

    const { error: err } = selected === 'fresh'
      ? await saveOnboarding('guided', 'John', 1, 'personal')
      : await saveOnboarding('custom', book, Math.min(chapter, maxChapter), context)

    setSaving(false)
    if (err) { setError('Something went wrong. Try again.'); return }
    onComplete()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0D0D0D',
      zIndex: 110,
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 20px 0',
        flexShrink: 0,
      }}>
        <button
          onClick={onCancel}
          style={{
            background: 'none', border: 'none',
            color: '#666', fontSize: 24, cursor: 'pointer', padding: '4px 8px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
        <p style={{
          fontFamily: BC, fontWeight: 700, fontSize: 11,
          letterSpacing: '4px', color: GOLD, textTransform: 'uppercase',
          margin: 0,
        }}>
          Bible Study
        </p>
        <div style={{ width: 40 }} />
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        padding: '32px 24px 48px',
        display: 'flex', flexDirection: 'column',
        animation: 'obs-slide-up 0.35s ease',
        maxWidth: 480, width: '100%', margin: '0 auto', boxSizing: 'border-box',
      }}>
        {/* Headline */}
        <h2 style={{
          fontFamily: BC, fontWeight: 800, fontSize: 32,
          color: BONE, textTransform: 'uppercase',
          letterSpacing: '1px', lineHeight: 1.15,
          margin: '0 0 8px',
        }}>
          Where are you<br />in the Word?
        </h2>
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 14, color: '#888', margin: '0 0 32px',
        }}>
          Open my eyes, that I may behold wondrous things out of your law.
          <br />— Psalm 119:18
        </p>

        {/* Option cards */}
        <OptionCard
          active={selected === 'fresh'}
          onSelect={() => setSelected('fresh')}
          label="START FRESH"
          title="Begin in John"
          body="We'll guide you through the Gospel of John, one chapter at a time. A good place for any man to start."
        />

        <OptionCard
          active={selected === 'custom'}
          onSelect={() => setSelected('custom')}
          label="ALREADY STUDYING"
          title="Continue where you are"
          body="Tell us what book and chapter you're in and we'll pick up there."
        />

        {/* Custom picker — revealed when "already studying" is selected */}
        {selected === 'custom' && (
          <div style={{
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            padding: '20px 16px',
            marginBottom: 16,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            {/* Book */}
            <div>
              <label style={labelStyle}>Book</label>
              <select
                value={book}
                onChange={e => handleBookChange(e.target.value)}
                style={selectStyle}
              >
                {ALL_BOOKS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div>
              <label style={labelStyle}>Chapter</label>
              <input
                type="number"
                min={1}
                max={maxChapter}
                value={chapter}
                onChange={e => setChapter(Math.max(1, Math.min(maxChapter, Number(e.target.value))))}
                style={{ ...selectStyle, width: 80 }}
              />
              <span style={{ color: '#555', fontSize: 12, marginLeft: 8 }}>
                of {maxChapter}
              </span>
            </div>

            {/* Context */}
            <div>
              <label style={labelStyle}>Context</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {CONTEXTS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setContext(c.value)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 6,
                      border: `1px solid ${context === c.value ? GOLD : '#2a2a2a'}`,
                      background: context === c.value ? 'rgba(201,168,76,0.1)' : '#0D0D0D',
                      color: context === c.value ? GOLD : '#666',
                      fontFamily: BC, fontWeight: 700, fontSize: 12,
                      letterSpacing: '1px', textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p style={{ color: '#e05252', fontSize: 13, textAlign: 'center', margin: '0 0 16px' }}>
            {error}
          </p>
        )}

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!selected || saving}
          style={{
            width: '100%',
            padding: '18px 0',
            background: selected && !saving ? GOLD : 'rgba(201,168,76,0.25)',
            border: 'none', borderRadius: 4,
            color: '#000',
            fontFamily: BC, fontWeight: 700, fontSize: 17,
            letterSpacing: '2px', textTransform: 'uppercase',
            cursor: selected && !saving ? 'pointer' : 'not-allowed',
            transition: 'background 0.2s ease',
            marginTop: 8,
          }}
        >
          {saving ? 'Saving…' : 'Begin →'}
        </button>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────

function OptionCard({ active, onSelect, label, title, body }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: active ? 'rgba(201,168,76,0.06)' : '#161616',
        border: `1px solid ${active ? GOLD : '#2a2a2a'}`,
        borderLeft: `3px solid ${active ? GOLD : '#2a2a2a'}`,
        borderRadius: 8,
        padding: '18px 16px',
        marginBottom: 12,
        cursor: 'pointer',
        transition: 'border-color 0.2s ease, background 0.2s ease',
      }}
    >
      <p style={{
        fontFamily: BC, fontWeight: 700, fontSize: 10,
        letterSpacing: '3px', color: active ? GOLD : '#555',
        textTransform: 'uppercase', margin: '0 0 6px',
        transition: 'color 0.2s ease',
      }}>
        {label}
      </p>
      <p style={{
        fontFamily: BC, fontWeight: 700, fontSize: 18,
        color: active ? BONE : '#888',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        margin: '0 0 6px',
        transition: 'color 0.2s ease',
      }}>
        {title}
      </p>
      <p style={{
        fontFamily: SERIF, fontStyle: 'italic',
        fontSize: 13, color: '#666',
        margin: 0, lineHeight: 1.6,
      }}>
        {body}
      </p>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: BC, fontWeight: 700, fontSize: 11,
  letterSpacing: '2px', textTransform: 'uppercase',
  color: '#888', marginBottom: 6,
}

const selectStyle = {
  background: '#0D0D0D',
  border: '1px solid #2a2a2a',
  borderRadius: 6,
  color: BONE,
  fontSize: 15,
  padding: '10px 12px',
  width: '100%',
  outline: 'none',
  colorScheme: 'dark',
}
