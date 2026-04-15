/**
 * MindPillar/WeaponScreen
 *
 * User selects a weapon category (Verse / Prayer / Reset / Question)
 * then picks one of 3 suggestions (or writes their own).
 *
 * Props:
 *   word     — chosen word string
 *   battle   — named battle string
 *   onCommit — async (weaponCategory, weapon) => void
 *   onBack   — () => void
 *   saving   — bool  loading state for commit button
 */
import { useState } from 'react'
import { getWeaponSuggestions } from '../../data/mindWordLibrary'

const GOLD   = '#C9A84C'
const BC     = "'Barlow Condensed', sans-serif"
const SERIF  = "'Georgia', 'Times New Roman', serif"
const BONE   = '#E8E0D4'
const CARD   = '#161616'
const BORDER = '#2a2a2a'
const MUTED  = '#555'

const CATEGORIES = [
  { key: 'verse',    emoji: '📖', label: 'A Verse'     },
  { key: 'prayer',   emoji: '🙏', label: 'A Prayer'    },
  { key: 'reset',    emoji: '↺',  label: 'A Reset'     },
  { key: 'question', emoji: '❓', label: 'A Question'  },
]

const CSS = `
  @keyframes weapon-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .weapon-own-textarea::placeholder { color: rgba(255,255,255,0.18); font-style: italic; }
  .weapon-own-textarea:focus { border-color: #2a3a50 !important; outline: none; }
`

export default function WeaponScreen({ word, battle, onCommit, onBack, saving = false }) {
  const [category,    setCategory]    = useState(null)
  const [suggestion,  setSuggestion]  = useState(null)   // selected suggestion text
  const [customText,  setCustomText]  = useState('')
  const [showCustom,  setShowCustom]  = useState(false)

  const suggestions = category ? getWeaponSuggestions(word, category) : []
  const WRITE_OWN   = 'Write your own →'

  const resolvedWeapon = showCustom ? customText.trim() : suggestion
  const canCommit = !saving && (
    (showCustom && customText.trim().length > 4) ||
    (!showCustom && suggestion && suggestion !== WRITE_OWN)
  )

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

  return (
    <div style={{
      position:   'fixed', inset: 0,
      background: '#0D0D0D',
      zIndex:     110,
      display:    'flex', flexDirection: 'column',
      overflowY:  'auto',
    }}>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{
        paddingTop:    'max(48px, env(safe-area-inset-top))',
        paddingLeft:   20,
        paddingRight:  20,
        paddingBottom: 14,
        flexShrink:    0,
        borderBottom:  `1px solid ${BORDER}`,
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none',
            color: MUTED, fontFamily: BC, fontWeight: 700,
            fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', cursor: 'pointer', padding: 0,
          }}
        >
          ← Back
        </button>
        <p style={{
          fontFamily: BC, fontWeight: 700, fontSize: 15,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: GOLD, margin: 0,
        }}>
          {word}
        </p>
        <div style={{ width: 48 }} />
      </div>

      {/* Body */}
      <div style={{
        flex:    1,
        padding: '24px 20px 140px',
        animation: 'weapon-in 0.3s ease',
      }}>

        {/* 2×2 category grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr',
          gap:                 10,
          marginBottom:        24,
        }}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat.key
            return (
              <button
                key={cat.key}
                onClick={() => handleCategorySelect(cat.key)}
                style={{
                  height:        80,
                  background:    isActive ? 'rgba(201,168,76,0.06)' : CARD,
                  border:        `1px solid ${isActive ? GOLD : BORDER}`,
                  borderRadius:  0,
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  justifyContent:'center',
                  gap:           6,
                  cursor:        'pointer',
                  transition:    'border-color 0.2s, background 0.2s',
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{cat.emoji}</span>
                <span style={{
                  fontFamily:    BC,
                  fontWeight:    700,
                  fontSize:      13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color:         isActive ? GOLD : '#6677aa',
                  transition:    'color 0.2s',
                }}>
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Suggestions */}
        {category && (
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           8,
          }}>
            {suggestions.map((s, i) => {
              const isWriteOwn = s === WRITE_OWN
              const isSelected = !isWriteOwn && suggestion === s

              return (
                <div key={i}>
                  <div
                    onClick={() => handleSuggestionSelect(s)}
                    style={{
                      background:   isSelected ? '#1a1a1a' : '#161616',
                      border:       `1px solid ${isSelected ? GOLD : BORDER}`,
                      borderLeft:   `${isSelected ? 2 : 1}px solid ${isSelected ? GOLD : BORDER}`,
                      borderRadius: 0,
                      padding:      '14px 16px',
                      cursor:       'pointer',
                      transition:   'border-color 0.2s',
                    }}
                  >
                    {isWriteOwn ? (
                      <p style={{
                        fontFamily: SERIF, fontStyle: 'italic',
                        fontSize: 13, color: '#445566',
                        margin: 0,
                      }}>
                        {s}
                      </p>
                    ) : (
                      <p style={{
                        fontFamily: SERIF, fontStyle: 'italic',
                        fontSize: 13,
                        color: isSelected ? BONE : '#7788aa',
                        margin: 0, lineHeight: 1.7,
                        transition: 'color 0.2s',
                      }}>
                        {s}
                      </p>
                    )}
                  </div>

                  {/* Custom textarea — revealed when "Write your own" is tapped */}
                  {isWriteOwn && showCustom && (
                    <textarea
                      className="weapon-own-textarea"
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      placeholder="Write your own weapon here…"
                      rows={3}
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
                        padding:      '12px 16px',
                        resize:       'none',
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Fixed footer */}
      <div style={{
        position:      'fixed',
        bottom:        0, left: 0, right: 0,
        zIndex:        10,
        background:    '#0D0D0D',
        borderTop:     `1px solid ${BORDER}`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <button
          onClick={() => canCommit && onCommit(category, resolvedWeapon)}
          disabled={!canCommit}
          style={{
            width:         '100%',
            height:        56,
            background:    canCommit ? GOLD : 'rgba(201,168,76,0.18)',
            color:         '#0D0D0D',
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
