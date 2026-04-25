/**
 * MindPillar/MindBriefScreen
 *
 * Combined single-screen replacement for BattleScreen + WeaponScreen.
 * User names their battle and picks their weapon in one flowing scroll.
 *
 * Props:
 *   word          — chosen word string
 *   wordCategory  — word category string (Posture / Strength / Faith / Warfare)
 *   saveMindBrief — async (word, battle, weaponCategory, weapon) => { error }
 *   onComplete    — (word, battle, weaponCategory, weapon) => void
 *   onBack        — () => void  returns to WordSelectScreen
 */
import { useState } from 'react'
import { getWeaponSuggestions } from '../../data/mindWordLibrary'

const GOLD   = '#C9A84C'
const BC     = "'Barlow Condensed', sans-serif"
const SERIF  = "'Georgia', 'Times New Roman', serif"
const BONE   = '#E8E0D4'
const CARD   = '#161616'
const BORDER = '#2a2a2a'
const MUTED  = '#666'

const CATEGORIES = [
  { key: 'verse',    emoji: '📖', label: 'A Verse'    },
  { key: 'prayer',   emoji: '🙏', label: 'A Prayer'   },
  { key: 'reset',    emoji: '↺',  label: 'A Reset'    },
  { key: 'question', emoji: '❓', label: 'A Question' },
]

const WRITE_OWN = 'Write your own →'

const CSS = `
  @keyframes brief-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .brief-battle-ta::placeholder { color: rgba(255,255,255,0.18); font-style: italic; }
  .brief-battle-ta:focus { border-color: #3a3a3a !important; outline: none; }
  .brief-own-ta::placeholder { color: rgba(255,255,255,0.18); font-style: italic; }
  .brief-own-ta:focus { border-color: #3a3a3a !important; outline: none; }
`

const LABEL_STYLE = {
  fontFamily:    BC,
  fontWeight:    700,
  fontSize:      11,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color:         GOLD,
  margin:        '0 0 6px',
}

export default function MindBriefScreen({
  word,
  wordCategory,
  saveMindBrief,
  onComplete,
  onBack,
}) {
  const [battle,     setBattle]     = useState('')
  const [category,   setCategory]   = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [customText, setCustomText] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [saving,     setSaving]     = useState(false)

  const suggestions    = category ? getWeaponSuggestions(word, category) : []
  const resolvedWeapon = showCustom ? customText.trim() : suggestion
  const battleReady    = battle.trim().length >= 10
  const weaponReady    = (showCustom && customText.trim().length >= 10)
                      || (!showCustom && suggestion && suggestion !== WRITE_OWN)
  const canCommit      = !saving && battleReady && weaponReady

  function handleCategorySelect(key) {
    setCategory(key)
    setSuggestion(null)
    setCustomText('')
    setShowCustom(false)
  }

  function handleSuggestionSelect(s) {
    if (s === WRITE_OWN) {
      setSuggestion(null)
      setShowCustom(true)
    } else {
      setSuggestion(s)
      setShowCustom(false)
      setCustomText('')
    }
  }

  async function handleCommit() {
    if (!canCommit) return
    setSaving(true)
    const { error } = await saveMindBrief(word, battle.trim(), category, resolvedWeapon)
    setSaving(false)
    if (!error) onComplete(word, battle.trim(), category, resolvedWeapon)
  }

  return (
    <div style={{
      position:      'fixed',
      inset:         0,
      background:    '#0D0D0D',
      zIndex:        110,
      display:       'flex',
      flexDirection: 'column',
      overflow:      'hidden',
    }}>
      <style>{CSS}</style>

      {/* ── Header — stays put, never scrolls ──────────────────────────── */}
      <div style={{
        paddingTop:    'max(48px, env(safe-area-inset-top))',
        paddingLeft:   20,
        paddingRight:  20,
        paddingBottom: 14,
        flexShrink:    0,
        borderBottom:  `1px solid ${BORDER}`,
      }}>
        <button
          onClick={onBack}
          style={{
            background:    'none',
            border:        'none',
            color:         MUTED,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        'pointer',
            padding:       0,
          }}
        >
          ← Back
        </button>
      </div>

      {/* ── Scrollable body ────────────────────────────────────────────── */}
      <div style={{
        flex:                    1,
        overflowY:               'auto',
        WebkitOverflowScrolling: 'touch',
        padding:                 '20px 20px calc(140px + env(safe-area-inset-bottom))',
        animation:               'brief-in 0.3s ease',
      }}>

        {/* § 1 — Word */}
        <p style={{
          fontFamily:    BC,
          fontWeight:    700,
          fontSize:      42,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color:         GOLD,
          margin:        '0 0 4px',
          lineHeight:    1,
        }}>
          {word}
        </p>
        <p style={{
          fontFamily: SERIF,
          fontStyle:  'italic',
          fontSize:   12,
          color:      MUTED,
          margin:     0,
        }}>
          {wordCategory}
        </p>
        <div style={{ height: 1, background: '#1e1e1e', margin: '16px 0' }} />

        {/* § 2 — Battle */}
        <p style={LABEL_STYLE}>Name Your Battle</p>
        <p style={{
          fontFamily: SERIF,
          fontStyle:  'italic',
          fontSize:   13,
          color:      MUTED,
          margin:     '0 0 10px',
          lineHeight: 1.7,
        }}>
          What's most likely to pull you off this posture today? Be specific.
        </p>
        <textarea
          className="brief-battle-ta"
          value={battle}
          onChange={e => setBattle(e.target.value)}
          placeholder="The meeting I've been avoiding. The comparison trap. The noise I can't silence."
          rows={3}
          style={{
            width:        '100%',
            boxSizing:    'border-box',
            background:   '#111',
            border:       `1px solid ${BORDER}`,
            borderRadius: 0,
            color:        BONE,
            fontFamily:   SERIF,
            fontStyle:    'italic',
            fontSize:     14,
            lineHeight:   1.6,
            padding:      '12px 14px',
            resize:       'none',
            minHeight:    80,
          }}
        />
        {battle.length > 0 && !battleReady && (
          <p style={{
            fontFamily: SERIF,
            fontStyle:  'italic',
            fontSize:   11,
            color:      '#333',
            margin:     '6px 0 0',
            textAlign:  'right',
          }}>
            Keep going — be specific.
          </p>
        )}

        <div style={{ height: 1, background: '#1e1e1e', margin: '20px 0' }} />

        {/* § 3 — Weapon */}
        <p style={LABEL_STYLE}>Choose Your Weapon</p>

        {/* 2×2 category grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 10,
          marginBottom:        16,
        }}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => handleCategorySelect(cat.key)}
                style={{
                  height:        64,
                  background:    isActive ? 'rgba(201,168,76,0.06)' : CARD,
                  border:        `1px solid ${isActive ? GOLD : BORDER}`,
                  borderRadius:  0,
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  justifyContent:'center',
                  gap:           5,
                  cursor:        'pointer',
                  transition:    'border-color 0.2s, background 0.2s',
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1 }}>{cat.emoji}</span>
                <span style={{
                  fontFamily:    BC,
                  fontWeight:    700,
                  fontSize:      11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color:         isActive ? GOLD : BONE,
                  transition:    'color 0.2s',
                }}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Suggestions — smooth expand when category selected */}
        <div style={{
          maxHeight:  category ? 1200 : 0,
          overflow:   'hidden',
          transition: 'max-height 0.3s ease-out',
        }}>
          {suggestions.map((s, i) => {
            const isWriteOwn = s === WRITE_OWN
            const isSelected = !isWriteOwn && suggestion === s
            return (
              <div key={i} style={{ marginBottom: 8 }}>
                <div
                  onClick={() => handleSuggestionSelect(s)}
                  style={{
                    background:   isSelected ? '#1a1a1a' : CARD,
                    border:       `1px solid ${isSelected ? GOLD : BORDER}`,
                    borderLeft:   `${isSelected ? 2 : 1}px solid ${isSelected ? GOLD : BORDER}`,
                    borderRadius: 0,
                    padding:      '12px 14px',
                    cursor:       'pointer',
                    transition:   'border-color 0.2s, background 0.2s',
                  }}
                >
                  <p style={{
                    fontFamily: SERIF,
                    fontStyle:  'italic',
                    fontSize:   13,
                    margin:     0,
                    lineHeight: 1.7,
                    color:      isWriteOwn ? '#445566'
                              : isSelected ? BONE
                              : '#888',
                    transition: 'color 0.2s',
                  }}>
                    {s}
                  </p>
                </div>

                {/* Inline custom textarea — shown when Write your own is tapped */}
                {isWriteOwn && showCustom && (
                  <textarea
                    className="brief-own-ta"
                    value={customText}
                    onChange={e => setCustomText(e.target.value)}
                    placeholder="Write your own weapon here…"
                    rows={3}
                    autoFocus
                    style={{
                      width:        '100%',
                      boxSizing:    'border-box',
                      background:   '#111',
                      border:       `1px solid ${BORDER}`,
                      borderTop:    'none',
                      borderRadius: 0,
                      color:        BONE,
                      fontFamily:   SERIF,
                      fontStyle:    'italic',
                      fontSize:     14,
                      lineHeight:   1.7,
                      padding:      '12px 14px',
                      resize:       'none',
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Fixed footer ───────────────────────────────────────────────── */}
      <div style={{
        position:      'fixed',
        bottom:        0,
        left:          0,
        right:         0,
        zIndex:        10,
        background:    '#0D0D0D',
        borderTop:     `1px solid ${BORDER}`,
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
      }}>
        <button
          onClick={handleCommit}
          disabled={!canCommit}
          style={{
            width:         '100%',
            height:        52,
            background:    canCommit ? GOLD : 'rgba(201,168,76,0.18)',
            color:         canCommit ? '#0D0D0D' : 'rgba(0,0,0,0.4)',
            border:        'none',
            borderRadius:  0,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      17,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        canCommit ? 'pointer' : 'not-allowed',
            transition:    'background 0.15s',
          }}
        >
          {saving ? 'Saving…' : "I'm Armed. Commit."}
        </button>
      </div>
    </div>
  )
}
