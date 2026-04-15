/**
 * MindPillar/WordSelectScreen
 *
 * Shows 5 AI-generated words as large selectable cards.
 * Single-select. "Set My Word →" appears once one is chosen.
 *
 * Props:
 *   words      — string[5] from useMindBrief
 *   aiLoading  — bool   show skeleton cards while generating
 *   onSelect   — (word: string) => void  advance to BattleScreen
 *   onBack     — () => void  return to morning commitment screen
 */
import { useState } from 'react'
import { getWordCategory } from '../../data/mindWordLibrary'

const GOLD  = '#C9A84C'
const BC    = "'Barlow Condensed', sans-serif"
const SERIF = "'Georgia', 'Times New Roman', serif"
const BONE  = '#E8E0D4'
const CARD  = '#161616'
const BORDER = '#2a2a2a'
const MUTED = '#666'

const CSS = `
  @keyframes mind-in {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes word-pulse {
    0%, 100% { opacity: 0.15; }
    50%       { opacity: 0.35; }
  }
`

export default function WordSelectScreen({ words, aiLoading, onSelect, onBack }) {
  const [selected, setSelected] = useState(null)

  function handleCard(word) {
    setSelected(prev => (prev === word ? null : word))
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
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
            fontFamily: BC, fontWeight: 700, fontSize: 11,
            letterSpacing: '4px', color: GOLD, textTransform: 'uppercase', margin: 0,
          }}>
            Today's Word
          </p>
          <div style={{ width: 48 }} />
        </div>
        <p style={{
          fontFamily: SERIF, fontStyle: 'italic',
          fontSize: 13, color: MUTED,
          margin: '10px 0 0', textAlign: 'center',
        }}>
          Choose the posture you'll carry today.
        </p>
      </div>

      {/* Word cards */}
      <div style={{
        flex:    1,
        padding: '20px 20px calc(140px + env(safe-area-inset-bottom))',
        display: 'flex', flexDirection: 'column', gap: 10,
        animation: 'mind-in 0.3s ease',
      }}>
        {aiLoading
          ? Array.from({ length: 5 }, (_, i) => <SkeletonCard key={i} index={i} />)
          : words.map((word, i) => {
              const isSelected = selected === word
              return (
                <div
                  key={word}
                  onClick={() => handleCard(word)}
                  style={{
                    background:   isSelected ? 'rgba(201,168,76,0.06)' : CARD,
                    border:       `1px solid ${isSelected ? GOLD : BORDER}`,
                    borderLeft:   `3px solid ${isSelected ? GOLD : BORDER}`,
                    borderRadius: 0,
                    padding:      '20px 20px',
                    cursor:       'pointer',
                    transition:   'border-color 0.2s, background 0.2s',
                    animation:    `mind-in 0.3s ease ${i * 60}ms both`,
                  }}
                >
                  <p style={{
                    fontFamily:    BC,
                    fontWeight:    700,
                    fontSize:      32,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color:         BONE,
                    margin:        0,
                    lineHeight:    1,
                    transition:    'color 0.2s',
                  }}>
                    {word}
                  </p>
                  <p style={{
                    fontFamily: SERIF, fontStyle: 'italic',
                    fontSize: 12, color: isSelected ? 'rgba(201,168,76,0.7)' : MUTED,
                    margin: '6px 0 0',
                    transition: 'color 0.2s',
                  }}>
                    {getWordCategory(word)}
                  </p>
                </div>
              )
            })}
      </div>

      {/* Fixed footer */}
      <div style={{
        position:   'fixed',
        bottom:     'calc(64px + env(safe-area-inset-bottom))',
        left: 0, right: 0,
        zIndex:     10,
        background: '#0D0D0D',
        borderTop:  `1px solid ${BORDER}`,
      }}>
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected || aiLoading}
          style={{
            width:         '100%',
            height:        56,
            background:    selected && !aiLoading ? GOLD : 'rgba(201,168,76,0.18)',
            color:         '#0D0D0D',
            border:        'none',
            borderRadius:  0,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      17,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        selected && !aiLoading ? 'pointer' : 'not-allowed',
            transition:    'background 0.15s',
          }}
        >
          {aiLoading ? 'Generating your words…' : selected ? 'Set My Word →' : 'Select a word'}
        </button>
      </div>
    </div>
  )
}

function SkeletonCard({ index }) {
  return (
    <div style={{
      background:   CARD,
      border:       `1px solid ${BORDER}`,
      borderRadius: 0,
      padding:      '20px 20px',
    }}>
      <div style={{
        height:      28,
        width:       `${55 + (index % 3) * 15}%`,
        background:  '#1a2030',
        borderRadius: 2,
        animation:   `word-pulse 1.6s ease-in-out ${index * 0.15}s infinite`,
      }} />
      <div style={{
        height:      10,
        width:       '25%',
        background:  '#141a24',
        borderRadius: 2,
        marginTop:   10,
        animation:   `word-pulse 1.6s ease-in-out ${index * 0.15 + 0.1}s infinite`,
      }} />
    </div>
  )
}
