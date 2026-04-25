import { useState, useEffect } from 'react'
import { useDailyCommit }  from '../hooks/useDailyCommit'
import { useBibleStudy }   from '../hooks/useBibleStudy'
import { useBodyStudy }    from '../hooks/useBodyStudy'
import { useMindBrief }    from '../hooks/useMindBrief'
import Toast                from '../components/Toast'
import { PillarIcon }       from '../components/PillarIcon'
import OnboardingScreen     from '../components/BibleStudy/OnboardingScreen'
import PassageScreen        from '../components/BibleStudy/PassageScreen'
import SOAPScreen           from '../components/BibleStudy/SOAPScreen'
import CompletionScreen     from '../components/BibleStudy/CompletionScreen'
import BodyOnboarding       from '../components/BodyPillar/OnboardingScreen'
import WorkoutCard          from '../components/BodyPillar/WorkoutCard'
import CustomLogScreen      from '../components/BodyPillar/CustomLogScreen'
import WordSelectScreen          from '../components/MindPillar/WordSelectScreen'
import MindBriefScreen           from '../components/MindPillar/MindBriefScreen'
import ConfirmationScreen        from '../components/MindPillar/ConfirmationScreen'
import { getWordCategory }       from '../data/mindWordLibrary'
import { useStewardship }        from '../hooks/useStewardship'
import LedgerScreen              from '../components/StewardshipPillar/LedgerScreen'
import StewardshipConfirmation   from '../components/StewardshipPillar/ConfirmationScreen'
import faithBg         from '/images/pillars/faith-bg.png'
import bodyBg          from '/images/pillars/body-bg.png'
import mindBg          from '/images/pillars/mind-bg.png'
import stewardshipBg   from '/images/pillars/stewardship-bg.png'

// ── Rotating hint texts (7 per pillar, indexed by day of week 0-6) ──
const HINTS = {
  faith: [
    'Today I will pray before I pick up my phone.',
    'Today I will open Scripture for 20 minutes.',
    'Today I will thank God for three specific things.',
    'Today I will memorize one verse.',
    'Today I will pray for someone else by name.',
    'Today I will fast from something and pray instead.',
    'Today I will journal what God has been teaching me.',
  ],
  body: [
    'Today I will move my body for 30 minutes.',
    'Today I will fuel my body with intention.',
    'Today I will sleep 7+ hours tonight.',
    'Today I will drink enough water.',
    'Today I will say no to something that weakens me.',
    'Today I will push past the point I want to stop.',
    'Today I will treat my body like the temple it is.',
  ],
  mind: [
    'Today I will read 20 pages.',
    'Today I will remove one distraction from my environment.',
    'Today I will learn something new.',
    'Today I will practice gratitude in writing.',
    'Today I will protect my focus for 2 hours.',
    'Today I will listen more than I speak.',
    'Today I will reflect before I react.',
  ],
  stewardship: [
    'Today I will review my finances.',
    'Today I will serve someone without an agenda.',
    'Today I will honor my word to someone.',
    'Today I will invest in my future self.',
    'Today I will be present with the people around me.',
    'Today I will own my responsibilities fully.',
    'Today I will do one thing that Future Me will thank me for.',
  ],
}

const PILLARS = [
  {
    key:      'faith',
    icon:     '✝',
    label:    'Faith',
    tagline:  'Walk with intention.',
    bg:       faithBg,
    gradient: 'linear-gradient(165deg, rgba(13,13,13,0.82) 0%, rgba(26,20,0,0.72) 100%)',
    zIndex:   40,
  },
  {
    key:      'body',
    icon:     '💪',
    label:    'Body',
    tagline:  'Honor the temple.',
    bg:       bodyBg,
    gradient: 'linear-gradient(165deg, rgba(13,13,13,0.82) 0%, rgba(9,20,8,0.72) 100%)',
    zIndex:   30,
  },
  {
    key:      'mind',
    icon:     '📖',
    label:    'Mind',
    tagline:  'Sharpen the iron.',
    bg:       mindBg,
    gradient: 'linear-gradient(165deg, rgba(13,13,13,0.82) 0%, rgba(8,13,20,0.72) 100%)',
    zIndex:   20,
  },
  {
    key:      'stewardship',
    icon:     '🌱',
    label:    'Stewardship',
    tagline:  'Build what lasts.',
    bg:       stewardshipBg,
    gradient: 'linear-gradient(165deg, rgba(13,13,13,0.82) 0%, rgba(20,16,8,0.72) 100%)',
    zIndex:   10,
  },
]

const DOW = new Date().getDay()

const todayLabel = new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric',
})

export default function MorningCommitment({ navigate, userId, identityStatement, onAllComplete }) {
  const { commit, loading, saveMorning } = useDailyCommit(userId)
  const { settings, passage, loading: bsLoading, saveOnboarding, saveSOAP, markCarried } =
    useBibleStudy(userId)
  const {
    settings:     bodySettings,
    todayWorkout,
    todayLog,
    aiBrief,
    aiLoading,
    aiError,
    loading:      bodyLoading,
    saveOnboarding: saveBodyOnboarding,
    acceptWorkout,
    generateAIBrief,
    swapWorkout,
  } = useBodyStudy(userId)

  const {
    todayLog:   mindLog,
    words:      mindWords,
    loading:    mindLoading,
    aiLoading:  mindAiLoading,
    generateWords,
    saveMindBrief,
  } = useMindBrief(userId)

  const {
    todayLog:    stewardshipLog,
    loading:     stewardshipLoading,
    saveLedger,
    getSuggestion,
  } = useStewardship(userId)

  const identity = identityStatement || 'I am a man of faith, discipline, and character.'

  const [texts, setTexts]                       = useState({ faith: '', body: '', mind: '', stewardship: '' })
  const [phase, setPhase]                       = useState('form')   // 'form' | 'committed'
  const [justCommitted, setJust]                = useState(false)
  const [saving, setSaving]                     = useState(false)
  const [toast, setToast]                       = useState(null)
  const [bsScreen, setBsScreen]                 = useState(null)     // null | 'onboarding' | 'passage' | 'soap' | 'complete'
  const [bodyScreen, setBodyScreen]             = useState(null)     // null | 'onboarding' | 'workout' | 'custom'
  const [mindScreen,       setMindScreen]       = useState(null)  // null | 'words' | 'brief' | 'confirm'
  const [mindWord,         setMindWord]         = useState(null)
  const [mindWordCategory, setMindWordCategory] = useState(null)
  const [stewardshipScreen, setStewardshipScreen] = useState(null)  // null | 'ledger' | 'confirm'
  const [stewardshipMoney,  setStewardshipMoney]  = useState(null)
  const [stewardshipTime,   setStewardshipTime]   = useState(null)
  const [swapUsed, setSwapUsed]                 = useState(false)
  const [accepting, setAccepting]               = useState(false)
  const [expandedKey, setExpandedKey]           = useState(null)     // which pillar is open
  const [confirmedPillars, setConfirmedPillars] = useState(new Set())

  function openBibleStudy() {
    if (bsLoading) return
    setBsScreen(settings?.onboarding_complete ? 'passage' : 'onboarding')
  }

  function openBodyPillar() {
    if (bodyLoading) return
    if (!bodySettings?.onboarding_complete) {
      setBodyScreen('onboarding')
    } else if (bodySettings?.gym_mode === 'custom') {
      setBodyScreen('custom')
    } else {
      setBodyScreen('workout')
      // Trigger AI brief if not already generated
      if (todayWorkout && !aiBrief && !aiLoading) {
        generateAIBrief(todayWorkout)
      }
    }
  }

  async function handleAcceptWorkout() {
    if (!todayWorkout) return
    setAccepting(true)
    const { error } = await acceptWorkout(todayWorkout)
    setAccepting(false)
    if (error) {
      setToast({ message: "Couldn't save workout. Check your connection.", type: 'error' })
      return
    }
    confirmPillar('body')
    setBodyScreen(null)
  }

  function handleSwapWorkout() {
    setSwapUsed(true)
    swapWorkout()
  }

  function openMindPillar() {
    if (mindLoading) return
    // If already completed today, show confirmation summary
    if (mindLog?.word) {
      setMindWord(mindLog.word)
      setMindBattle(mindLog.battle)
      setMindScreen('confirm')
      return
    }
    // Kick off word generation if not already started
    if (mindWords.length === 0 && !mindAiLoading) {
      generateWords()
    }
    setMindScreen('words')
  }

  function handleMindComplete(word, battle, weaponCategory, weapon) {
    confirmPillar('mind')
    setMindScreen('confirm')
  }

  function openStewardshipPillar() {
    if (stewardshipLoading) return
    if (stewardshipLog?.money_intention) {
      setStewardshipMoney(stewardshipLog.money_intention)
      setStewardshipTime(stewardshipLog.time_intention)
      setStewardshipScreen('confirm')
      return
    }
    setStewardshipScreen('ledger')
  }

  function handleLedgerComplete(money, time) {
    setStewardshipMoney(money)
    setStewardshipTime(time)
    confirmPillar('stewardship')
    setStewardshipScreen('confirm')
  }

  // Re-generate AI brief when workout changes due to swap
  useEffect(() => {
    if (todayWorkout && bodyScreen === 'workout' && !aiLoading) {
      generateAIBrief(todayWorkout)
    }
  }, [todayWorkout])  // eslint-disable-line react-hooks/exhaustive-deps

  function toggleExpand(key) {
    setExpandedKey(prev => (prev === key ? null : key))
  }

  function confirmPillar(key) {
    setConfirmedPillars(prev => new Set([...prev, key]))
    setExpandedKey(null)
  }

  // Pre-fill & jump to committed view if already done today
  useEffect(() => {
    if (loading || !commit?.morning_done) return
    setTexts({
      faith:       commit.faith_commitment       ?? '',
      body:        commit.body_commitment        ?? '',
      mind:        commit.mind_commitment        ?? '',
      stewardship: commit.stewardship_commitment ?? '',
    })
    setPhase('committed')
  }, [loading, commit])  // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss "Committed." splash after 2 s
  useEffect(() => {
    if (!justCommitted || phase !== 'committed') return
    const t = setTimeout(() => navigate('dashboard'), 2000)
    return () => clearTimeout(t)
  }, [justCommitted, phase, navigate])

  async function handleCommit() {
    setSaving(true)
    const { error } = await saveMorning(texts)
    setSaving(false)
    if (error) {
      setToast({ message: "Couldn't save your commitment. Check your connection and try again.", type: 'error' })
      return
    }
    onAllComplete?.()
    setJust(true)
    setPhase('committed')
  }

  if (loading) {
    return <div className="loader-screen"><div className="loader-icon">✦</div></div>
  }

  // ── "Committed." full-screen splash ─────────────────────────────────
  if (phase === 'committed' && justCommitted) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#070707',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}>
        <style>{`@keyframes mc-fade-in { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }`}</style>
        <div style={{ fontSize: 56, marginBottom: 24, animation: 'mc-fade-in 0.4s ease' }}>✦</div>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 40, fontWeight: 800, letterSpacing: 3,
          color: '#C9A84C', margin: 0,
          animation: 'mc-fade-in 0.4s ease 0.1s both',
        }}>
          Committed.
        </h1>
        <p style={{
          color: '#888', fontSize: 16, marginTop: 16,
          textAlign: 'center', padding: '0 40px', lineHeight: 1.6,
          animation: 'mc-fade-in 0.4s ease 0.2s both',
        }}>
          Now go be who you said you are.
        </p>
      </div>
    )
  }

  // ── Already committed — static review ───────────────────────────────
  if (phase === 'committed') {
    return (
      <div className="app-shell">
        <header className="top-bar">
          <button className="back-btn" onClick={() => navigate('dashboard')} aria-label="Back">
            ← Back
          </button>
          <div className="brand"><span className="brand-mark">✦</span></div>
        </header>
        <main className="main-content">
          <p className="mc-date">{todayLabel}</p>
          <div className="mc-celebrate-top" style={{ paddingBottom: 8 }}>
            <div className="mc-celebrate-mark">✦</div>
            <p className="mc-celebrate-heading">Committed.</p>
            <p className="mc-celebrate-sub">You already showed up this morning.</p>
          </div>
          <div className="mc-review" style={{ marginTop: 24 }}>
            <p className="mc-review-heading">Your commitments for today</p>
            {PILLARS.map(p => {
              const val = texts[p.key]
              if (!val) return null
              return (
                <div key={p.key} className="mc-review-row">
                  <span className="mc-review-icon"><PillarIcon pillar={p.key} size={20} color="#C9A84C" /></span>
                  <div>
                    <p className="mc-review-label">{p.label}</p>
                    <p className="mc-review-text">{val}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <button className="btn-primary mc-back-btn" onClick={() => navigate('dashboard')}>
            Back to Dashboard
          </button>
        </main>
      </div>
    )
  }

  // ── New atmospheric pillar layout ────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0D0D0D',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes pillar-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes commit-btn-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pillar-textarea::placeholder { color: rgba(255,255,255,0.22); font-style: italic; }
        .pillar-textarea:focus { border-color: #3a3a3a !important; outline: none; }
      `}</style>

      {/* ── Bible Study overlays ─────────────────────────────────────── */}
      {bsScreen === 'onboarding' && (
        <OnboardingScreen
          saveOnboarding={saveOnboarding}
          onComplete={() => setBsScreen('passage')}
          onCancel={() => setBsScreen(null)}
        />
      )}
      {bsScreen === 'passage' && (
        <PassageScreen
          passage={passage}
          markCarried={markCarried}
          onJournal={() => setBsScreen('soap')}
          onCarried={() => setBsScreen(null)}
          onBack={() => setBsScreen(null)}
        />
      )}
      {bsScreen === 'soap' && (
        <SOAPScreen
          passage={passage}
          saveSOAP={saveSOAP}
          onComplete={() => setBsScreen('complete')}
          onBack={() => setBsScreen('passage')}
        />
      )}
      {bsScreen === 'complete' && (
        <CompletionScreen onDone={() => setBsScreen(null)} />
      )}

      {/* ── Body Pillar overlays ─────────────────────────────────────── */}
      {bodyScreen === 'onboarding' && (
        <BodyOnboarding
          saveOnboarding={saveBodyOnboarding}
          onComplete={() => {
            setBodyScreen(bodySettings?.gym_mode === 'custom' ? 'custom' : 'workout')
            if (todayWorkout) generateAIBrief(todayWorkout)
          }}
          onCancel={() => setBodyScreen(null)}
        />
      )}
      {bodyScreen === 'workout' && todayWorkout && (
        <WorkoutCard
          workout={todayWorkout}
          aiBrief={aiBrief}
          aiLoading={aiLoading}
          aiError={aiError}
          onAccept={handleAcceptWorkout}
          onSwap={handleSwapWorkout}
          onBack={() => setBodyScreen(null)}
          onSettings={() => setBodyScreen('onboarding')}
          swapUsed={swapUsed}
          accepting={accepting}
        />
      )}
      {bodyScreen === 'custom' && (
        <CustomLogScreen
          acceptWorkout={acceptWorkout}
          onComplete={() => { confirmPillar('body'); setBodyScreen(null) }}
          onCancel={() => setBodyScreen(null)}
        />
      )}

      {/* ── Mind Pillar overlays ─────────────────────────────────────── */}
      {mindScreen === 'words' && (
        <WordSelectScreen
          words={mindWords}
          aiLoading={mindAiLoading}
          onSelect={word => {
            setMindWord(word)
            setMindWordCategory(getWordCategory(word))
            setMindScreen('brief')
          }}
          onBack={() => setMindScreen(null)}
        />
      )}
      {mindScreen === 'brief' && (
        <MindBriefScreen
          word={mindWord}
          wordCategory={mindWordCategory}
          saveMindBrief={saveMindBrief}
          onComplete={handleMindComplete}
          onBack={() => setMindScreen('words')}
        />
      )}
      {mindScreen === 'confirm' && (
        <ConfirmationScreen
          word={mindLog?.word ?? mindWord}
          battle={mindLog?.battle}
          weaponCategory={mindLog?.weapon_category}
          weapon={mindLog?.weapon}
          onDone={() => setMindScreen(null)}
        />
      )}

      {/* ── Stewardship Pillar overlays ──────────────────────────────────── */}
      {stewardshipScreen === 'ledger' && (
        <LedgerScreen
          getSuggestion={getSuggestion}
          saveLedger={saveLedger}
          onComplete={handleLedgerComplete}
          onBack={() => setStewardshipScreen(null)}
        />
      )}
      {stewardshipScreen === 'confirm' && (
        <StewardshipConfirmation
          moneyIntention={stewardshipMoney ?? stewardshipLog?.money_intention}
          timeIntention={stewardshipTime  ?? stewardshipLog?.time_intention}
          onDone={() => setStewardshipScreen(null)}
        />
      )}

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div style={{
        paddingTop: 'env(safe-area-inset-top)',
        background: '#0D0D0D',
        flexShrink: 0,
        position: 'relative',
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px 0',
        }}>
          <button
            onClick={() => navigate('dashboard')}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.4)', fontSize: 13,
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', cursor: 'pointer', padding: 0,
            }}
          >
            ← Back
          </button>
          <span style={{ color: '#C9A84C', fontSize: 18 }}>✦</span>
        </div>
        <div style={{ padding: '6px 28px 14px' }}>
          <p style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 11, fontWeight: 700,
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.15em', textTransform: 'uppercase',
            margin: 0,
          }}>{todayLabel}</p>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic', fontSize: 13,
            color: 'rgba(255,255,255,0.38)',
            margin: '4px 0 0', lineHeight: 1.5,
          }}>{identity}</p>
        </div>
      </div>

      {/* ── Scrollable pillar sections ────────────────────────────────── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: confirmedPillars.size === 4
          ? 'calc(136px + env(safe-area-inset-bottom))'
          : 'calc(80px + env(safe-area-inset-bottom))',
      }}>
        {PILLARS.map((pillar, i) => {
          const isExpanded  = expandedKey === pillar.key
          const isConfirmed = confirmedPillars.has(pillar.key)

          return (
            <div
              key={pillar.key}
              style={{
                position: 'relative',
                zIndex: pillar.zIndex,
                backgroundImage: `${pillar.gradient}, url(${pillar.bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                borderLeft: isConfirmed ? '1px solid #C9A84C' : '1px solid transparent',
                backgroundColor: isConfirmed ? 'rgba(201,168,76,0.04)' : 'transparent',
                borderRadius: 0,
                animation: `pillar-in 300ms ease-out ${i * 80}ms both`,
              }}
            >
              {/* Collapsed header — always visible, tappable */}
              <div
                onClick={() => {
                  if (pillar.key === 'body')        return openBodyPillar()
                  if (pillar.key === 'mind')        return openMindPillar()
                  if (pillar.key === 'stewardship') return openStewardshipPillar()
                  toggleExpand(pillar.key)
                }}
                style={{
                  minHeight: '28vh',
                  padding: '40px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {/* Pillar icon */}
                <span style={{
                  fontSize: 28,
                  lineHeight: 1,
                  marginBottom: 12,
                  display: 'block',
                  textAlign: 'center',
                }}>
                  {pillar.icon}
                </span>

                {/* Pillar name */}
                <h2 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 700,
                  fontSize: 56,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#FFFFFF',
                  margin: 0,
                  lineHeight: 1,
                }}>
                  {pillar.label}
                </h2>

                {/* Tagline */}
                <p style={{
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.45)',
                  margin: '8px 0 0',
                }}>
                  {pillar.tagline}
                </p>

                {/* Bottom affordance — hidden when expanded */}
                {!isExpanded && (
                  <div style={{ marginTop: 20 }}>
                    <p style={{
                      fontFamily:    "'Barlow Condensed', sans-serif",
                      fontSize:      11,
                      fontWeight:    700,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color:         isConfirmed ? '#C9A84C' : 'rgba(201,168,76,0.5)',
                      margin:        0,
                    }}>
                      {pillar.key === 'body'        && bodyLoading        ? '· · ·'
                        : pillar.key === 'mind'       && mindLoading        ? '· · ·'
                        : pillar.key === 'stewardship'&& stewardshipLoading ? '· · ·'
                        : isConfirmed ? '✓ Committed' : '+ Tap to Commit'}
                    </p>
                    {/* Show chosen word beneath MIND when confirmed */}
                    {pillar.key === 'mind' && isConfirmed && (mindLog?.word || mindWord) && (
                      <p style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle:  'italic',
                        fontSize:   13,
                        color:      'rgba(201,168,76,0.7)',
                        margin:     '5px 0 0',
                      }}>
                        {mindLog?.word ?? mindWord}
                      </p>
                    )}

                    {/* Show first 4 words of money intention beneath STEWARDSHIP when confirmed */}
                    {pillar.key === 'stewardship' && isConfirmed
                      && (stewardshipLog?.money_intention || stewardshipMoney) && (
                      <p style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle:  'italic',
                        fontSize:   13,
                        color:      'rgba(201,168,76,0.7)',
                        margin:     '5px 0 0',
                      }}>
                        {(stewardshipLog?.money_intention ?? stewardshipMoney)
                          .split(' ').slice(0, 4).join(' ') + '…'}
                      </p>
                    )}

                    {/* Show accepted workout type beneath BODY when confirmed */}
                    {pillar.key === 'body' && isConfirmed && (todayLog?.workout_type || todayWorkout?.type) && (
                      <p style={{
                        fontFamily:    "'Barlow Condensed', sans-serif",
                        fontSize:      12,
                        fontWeight:    700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color:         'rgba(255,255,255,0.35)',
                        margin:        '5px 0 0',
                      }}>
                        {todayLog?.workout_type ?? todayWorkout?.type}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded panel */}
              <div style={{
                overflow: 'hidden',
                maxHeight: isExpanded ? 520 : 0,
                transition: 'max-height 200ms ease-out',
              }}>
                <div style={{ padding: '0 24px 28px' }}>
                  <textarea
                    className="pillar-textarea"
                    value={texts[pillar.key]}
                    onChange={e => setTexts(prev => ({ ...prev, [pillar.key]: e.target.value }))}
                    placeholder={HINTS[pillar.key][DOW]}
                    rows={3}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      background: '#111',
                      border: '1px solid #2a2a2a',
                      borderRadius: 0,
                      color: '#E8E0D4',
                      fontFamily: 'Georgia, serif',
                      fontStyle: 'italic',
                      fontSize: 14,
                      lineHeight: 1.6,
                      padding: '12px 14px',
                      resize: 'none',
                    }}
                  />

                  {/* Bible Study CTA — Faith pillar only */}
                  {pillar.key === 'faith' && (
                    <div style={{
                      paddingTop: 12,
                      marginTop: 4,
                      marginBottom: 16,
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <button
                        onClick={e => { e.stopPropagation(); openBibleStudy() }}
                        style={{
                          background: 'none', border: 'none',
                          color: '#C9A84C', fontSize: 13,
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 700, letterSpacing: '1px',
                          textTransform: 'uppercase',
                          cursor: 'pointer', padding: 0,
                        }}
                      >
                        Open in the Word today →
                      </button>
                      <p style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle: 'italic', fontSize: 11,
                        color: '#555', margin: '3px 0 0',
                      }}>
                        "Open my eyes to see wondrous things." — Psalm 119:18
                      </p>
                    </div>
                  )}

                  {/* Mind Pillar brief CTA — Mind pillar only */}
                  {pillar.key === 'mind' && (
                    <div style={{
                      paddingTop:   12,
                      marginTop:    4,
                      marginBottom: 16,
                      borderTop:    '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <button
                        onClick={e => { e.stopPropagation(); openMindPillar() }}
                        style={{
                          background:    'none',
                          border:        'none',
                          color:         '#C9A84C',
                          fontSize:      13,
                          fontFamily:    "'Barlow Condensed', sans-serif",
                          fontWeight:    700,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          cursor:        'pointer',
                          padding:       0,
                        }}
                      >
                        {mindLog?.word ? `${mindLog.word} — view brief →` : 'Start your Mind Brief →'}
                      </button>
                      <p style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle:  'italic',
                        fontSize:   11,
                        color:      '#555',
                        margin:     '3px 0 0',
                      }}>
                        {mindLog?.word
                          ? 'Your word, your battle, your weapon for today.'
                          : 'Choose your word. Name your battle. Pick your weapon.'}
                      </p>
                    </div>
                  )}

                  {/* Stewardship Pillar ledger CTA — Stewardship pillar only */}
                  {pillar.key === 'stewardship' && (
                    <div style={{
                      paddingTop:   12,
                      marginTop:    4,
                      marginBottom: 16,
                      borderTop:    '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <button
                        onClick={e => { e.stopPropagation(); openStewardshipPillar() }}
                        style={{
                          background:    'none',
                          border:        'none',
                          color:         '#C9A84C',
                          fontSize:      13,
                          fontFamily:    "'Barlow Condensed', sans-serif",
                          fontWeight:    700,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          cursor:        'pointer',
                          padding:       0,
                        }}
                      >
                        {stewardshipLog?.money_intention
                          ? 'View today\'s ledger →'
                          : 'Open the Ledger →'}
                      </button>
                      <p style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle:  'italic',
                        fontSize:   11,
                        color:      '#555',
                        margin:     '3px 0 0',
                      }}>
                        {stewardshipLog?.money_intention
                          ? 'Two intentions committed.'
                          : 'Name your money. Name your time.'}
                      </p>
                    </div>
                  )}

                  {/* Body Pillar workout CTA — Body pillar only */}
                  {pillar.key === 'body' && (
                    <div style={{
                      paddingTop:   12,
                      marginTop:    4,
                      marginBottom: 16,
                      borderTop:    '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <button
                        onClick={e => { e.stopPropagation(); openBodyPillar() }}
                        style={{
                          background:    'none',
                          border:        'none',
                          color:         '#C9A84C',
                          fontSize:      13,
                          fontFamily:    "'Barlow Condensed', sans-serif",
                          fontWeight:    700,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          cursor:        'pointer',
                          padding:       0,
                        }}
                      >
                        {todayLog
                          ? `${todayLog.workout_type} — view session →`
                          : 'View today\'s workout →'}
                      </button>
                      <p style={{
                        fontFamily: 'Georgia, serif',
                        fontStyle:  'italic',
                        fontSize:   11,
                        color:      '#555',
                        margin:     '3px 0 0',
                      }}>
                        {todayLog
                          ? 'Log your completion in the evening reflection.'
                          : 'Your body is the temple. Train it accordingly.'}
                      </p>
                    </div>
                  )}

                  {/* Per-pillar confirm button */}
                  <button
                    onClick={e => { e.stopPropagation(); confirmPillar(pillar.key) }}
                    style={{
                      width: '100%',
                      height: 48,
                      background: '#C9A84C',
                      color: '#0D0D0D',
                      border: 'none',
                      borderRadius: 0,
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      marginTop: pillar.key === 'faith' ? 0 : 16,
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* ── Progress indicator — visible when 1–3 pillars confirmed ── */}
        {confirmedPillars.size > 0 && confirmedPillars.size < 4 && (
          <div style={{
            display:        'flex',
            gap:            6,
            padding:        '20px 28px',
            justifyContent: 'center',
          }}>
            {PILLARS.map(p => (
              <div
                key={p.key}
                style={{
                  flex:       1,
                  height:     2,
                  background: confirmedPillars.has(p.key) ? '#C9A84C' : '#222',
                  transition: 'background 0.3s ease',
                  borderRadius: 1,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── "Commit to Today" — only when all 4 pillars confirmed ──── */}
      {confirmedPillars.size === 4 && (
        <div style={{
          position:  'fixed',
          bottom:    'calc(64px + env(safe-area-inset-bottom))',
          left: 0, right: 0,
          zIndex:    60,
          background: '#0D0D0D',
          animation: 'commit-btn-in 300ms ease-out both',
        }}>
          <button
            onClick={handleCommit}
            disabled={saving}
            style={{
              width:         '100%',
              height:        56,
              background:    saving ? '#9a7a2e' : '#C9A84C',
              color:         '#0D0D0D',
              border:        'none',
              borderRadius:  0,
              fontFamily:    "'Barlow Condensed', sans-serif",
              fontWeight:    700,
              fontSize:      17,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor:        saving ? 'default' : 'pointer',
              transition:    'background 150ms ease',
            }}
          >
            {saving ? 'Committing…' : 'Commit to Today'}
          </button>
        </div>
      )}
    </div>
  )
}
