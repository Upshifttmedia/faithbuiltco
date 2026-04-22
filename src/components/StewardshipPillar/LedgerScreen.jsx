/**
 * StewardshipPillar/LedgerScreen
 *
 * Morning entry screen for The Daily Ledger.
 * User writes one money intention and one time intention,
 * optionally filling from the curated prompt library.
 *
 * Props:
 *   getSuggestion  — async (category: 'money' | 'time') => string
 *   saveLedger     — async (money, time) => { error }
 *   onComplete     — (money: string, time: string) => void
 *   onBack         — () => void
 */
import { useState } from 'react'
import { STEWARDSHIP_SCRIPTURE } from '../../data/stewardshipPrompts'

const GOLD   = '#C9A84C'
const BC     = "'Barlow Condensed', sans-serif"
const SERIF  = "'Georgia', 'Times New Roman', serif"
const BONE   = '#E8E0D4'
const BORDER = '#1e1a0e'
const MUTED  = '#555'

const CSS = `
  .ledger-ta::placeholder { color: rgba(255,255,255,0.18); font-style: italic; }
  .ledger-ta:focus { border-color: #3a3020 !important; outline: none; }
`

const LABEL_STYLE = {
  fontFamily:    BC,
  fontWeight:    700,
  fontSize:      14,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color:         GOLD,
  margin:        '0 0 10px',
}

const PROMPT_STYLE = {
  fontFamily: SERIF,
  fontStyle:  'italic',
  fontSize:   13,
  color:      '#888',
  margin:     '0 0 10px',
  lineHeight: 1.6,
}

const TA_STYLE = {
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
}

export default function LedgerScreen({ getSuggestion, saveLedger, onComplete, onBack }) {
  const [moneyText,    setMoneyText]    = useState('')
  const [timeText,     setTimeText]     = useState('')
  const [saving,       setSaving]       = useState(false)
  const [loadingMoney, setLoadingMoney] = useState(false)
  const [loadingTime,  setLoadingTime]  = useState(false)

  const canCommit = moneyText.trim().length >= 10 && timeText.trim().length >= 10

  async function handleMoneySuggestion() {
    setLoadingMoney(true)
    const s = await getSuggestion('money')
    setMoneyText(s)
    setLoadingMoney(false)
  }

  async function handleTimeSuggestion() {
    setLoadingTime(true)
    const s = await getSuggestion('time')
    setTimeText(s)
    setLoadingTime(false)
  }

  async function handleCommit() {
    if (!canCommit || saving) return
    setSaving(true)
    const { error } = await saveLedger(moneyText.trim(), timeText.trim())
    setSaving(false)
    if (!error) onComplete(moneyText.trim(), timeText.trim())
  }

  return (
    <div style={{
      position:  'fixed',
      inset:     0,
      background:'#0D0D0D',
      zIndex:    110,
      display:   'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <style>{CSS}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        padding:   'max(48px, env(safe-area-inset-top)) 20px 0',
        flexShrink: 0,
      }}>
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   16,
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

        <p style={{
          fontFamily:    BC,
          fontWeight:    700,
          fontSize:      22,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color:         GOLD,
          margin:        '0 0 6px',
        }}>
          The Daily Ledger
        </p>
        <p style={{
          fontFamily: SERIF,
          fontStyle:  'italic',
          fontSize:   12,
          color:      MUTED,
          margin:     '0 0 16px',
          lineHeight: 1.6,
        }}>
          "{STEWARDSHIP_SCRIPTURE.verse}" — {STEWARDSHIP_SCRIPTURE.ref}
        </p>
        <div style={{ height: 1, background: '#1e1e1e', marginBottom: 24 }} />
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div style={{
        flex:    1,
        padding: '0 20px calc(180px + env(safe-area-inset-bottom))',
      }}>

        {/* Money section */}
        <p style={LABEL_STYLE}>Money</p>
        <p style={PROMPT_STYLE}>
          What's one intentional money decision for today? Be specific.
        </p>
        <textarea
          className="ledger-ta"
          value={moneyText}
          onChange={e => setMoneyText(e.target.value)}
          placeholder="I will..."
          rows={3}
          style={TA_STYLE}
        />
        <button
          onClick={handleMoneySuggestion}
          disabled={loadingMoney}
          style={{
            background:    'none',
            border:        'none',
            color:         loadingMoney ? '#444' : 'rgba(201,168,76,0.55)',
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        loadingMoney ? 'default' : 'pointer',
            padding:       '6px 0 0',
            display:       'block',
          }}
        >
          {loadingMoney ? '· · ·' : 'Need a prompt? →'}
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: '#1a1a1a', margin: '20px 0' }} />

        {/* Time section */}
        <p style={LABEL_STYLE}>Time</p>
        <p style={PROMPT_STYLE}>
          What one hour today will you protect and name?
        </p>
        <textarea
          className="ledger-ta"
          value={timeText}
          onChange={e => setTimeText(e.target.value)}
          placeholder="I will..."
          rows={3}
          style={TA_STYLE}
        />
        <button
          onClick={handleTimeSuggestion}
          disabled={loadingTime}
          style={{
            background:    'none',
            border:        'none',
            color:         loadingTime ? '#444' : 'rgba(201,168,76,0.55)',
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        loadingTime ? 'default' : 'pointer',
            padding:       '6px 0 0',
            display:       'block',
          }}
        >
          {loadingTime ? '· · ·' : 'Need a prompt? →'}
        </button>
      </div>

      {/* ── Fixed footer ───────────────────────────────────────────────────── */}
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
          disabled={!canCommit || saving}
          style={{
            width:         '100%',
            height:        52,
            background:    canCommit && !saving ? GOLD : 'rgba(201,168,76,0.18)',
            color:         '#0D0D0D',
            border:        'none',
            borderRadius:  0,
            fontFamily:    BC,
            fontWeight:    700,
            fontSize:      17,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor:        canCommit && !saving ? 'pointer' : 'not-allowed',
            transition:    'background 0.15s',
          }}
        >
          {saving ? 'Committing…' : 'Commit to the Ledger'}
        </button>
      </div>
    </div>
  )
}
