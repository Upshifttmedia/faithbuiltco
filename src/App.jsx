import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useNotifications } from './hooks/useNotifications'
import { getLocalDate } from './lib/dateUtils'
import SplashScreen from './components/SplashScreen'
import AuthPage from './pages/AuthPage'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import MorningCommitment from './pages/MorningCommitment'
import EveningReflection from './pages/EveningReflection'
import DriftScreen from './pages/DriftScreen'
import History from './pages/History'
import Profile from './pages/Profile'
import CommunityFeed from './pages/CommunityFeed'
import BottomNav from './components/Nav/BottomNav'
import NotificationPrompt from './components/Community/NotificationPrompt'
import ResetPassword from './components/Auth/ResetPassword'

const TODAY_PAGES    = ['dashboard', 'checkin', 'evening']
const LAST_OPEN_KEY  = 'fb_last_app_open'
const DRIFT_DAYS     = 3

// Read ?fb_page param once on load to set initial page.
// Falls back to sessionStorage so a refresh restores the user's current page.
function getInitialPage() {
  const params = new URLSearchParams(window.location.search)
  const fbPage = params.get('fb_page')
  if (fbPage === 'evening') {
    // Clean URL so reload doesn't re-trigger
    window.history.replaceState({}, '', window.location.pathname)
    return 'evening'
  }
  return sessionStorage.getItem('fb_current_page') || 'dashboard'
}

export default function App() {
  const {
    user,
    profile,
    loading,
    profileLoading,
    profileFetched,
    authEvent,
    resetPassword,
    markOnboardingDone,
  } = useAuth()

  const [page, setPage]           = useState(getInitialPage)
  const [showDrift, setShowDrift] = useState(false)

  // ── Splash: show for at least 2 s and while auth is resolving ─────
  const [splashReady, setSplashReady] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSplashReady(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // ── Drift detection: show if app not opened in 3+ days ────────────
  useEffect(() => {
    if (!user) return
    const today    = getLocalDate()
    const lastOpen = localStorage.getItem(LAST_OPEN_KEY)
    if (lastOpen && lastOpen !== today) {
      const msPerDay = 1000 * 60 * 60 * 24
      const diffDays = Math.round(
        (new Date(today + 'T12:00:00') - new Date(lastOpen + 'T12:00:00')) / msPerDay
      )
      if (diffDays >= DRIFT_DAYS) setShowDrift(true)
    }
    localStorage.setItem(LAST_OPEN_KEY, today)
  }, [user])

  // Mirror onboarding_done to localStorage as soon as it's confirmed from DB.
  // Covers users who completed onboarding on another device/browser where
  // localStorage was never set — ensures the optimistic check works on next load.
  useEffect(() => {
    if (profileFetched && profile?.onboarding_done) {
      localStorage.setItem('fb_onboarding_done', '1')
    }
  }, [profileFetched, profile])

  const { showPrompt, reminderTime, requestAndSave, dismissPrompt, maybeTriggerPrompt } =
    useNotifications(user?.id)

  function navigate(to) {
    sessionStorage.setItem('fb_current_page', to)
    setPage(to)
  }

  // Show splash until timer fires, auth resolves, AND profile fetch is complete.
  // profileFetched must be true before any routing decision — otherwise a user
  // with onboarding_done=true in the DB will briefly see onboarding while the
  // profile is still loading (profile=null → onboarding_done=undefined → show onboarding).
  if (!splashReady || loading || profileLoading || !profileFetched) {
    return <SplashScreen />
  }

  if (!user) return <AuthPage />

  if (authEvent === 'PASSWORD_RECOVERY') {
    return <ResetPassword onResetPassword={resetPassword} />
  }

  const onboardingDone =
    localStorage.getItem('fb_onboarding_done') === '1' ||
    profile?.onboarding_done === true

  console.log('[FaithBuilt] routing decision:', { profileFetched, onboardingDone, page })

  if (!onboardingDone) {
    return (
      <Onboarding
        userId={user.id}
        onComplete={() => {
          markOnboardingDone()
          navigate('dashboard')
        }}
      />
    )
  }

  // ── Drift Screen — shown before dashboard if away 3+ days ─────────
  if (showDrift) {
    return (
      <DriftScreen
        onReturn={() => {
          setShowDrift(false)
          navigate('checkin')
        }}
      />
    )
  }

  const identityStatement =
    profile?.identity_statement || 'I am a man of faith, discipline, and character.'

  const activeTab = TODAY_PAGES.includes(page) ? 'today' : page

  function handleTabPress(tab) {
    if (tab === 'today') navigate('dashboard')
    else navigate(tab)
  }

  return (
    <div className="app-root">
      <div className="page-area">
        {page === 'dashboard' && (
          <Dashboard navigate={navigate} userId={user.id} />
        )}
        {page === 'checkin' && (
          <MorningCommitment
            navigate={navigate}
            userId={user.id}
            identityStatement={identityStatement}
            onAllComplete={maybeTriggerPrompt}
          />
        )}
        {page === 'evening' && (
          <EveningReflection
            navigate={navigate}
            userId={user.id}
          />
        )}
        {page === 'history'   && <History userId={user.id} />}
        {page === 'community' && <CommunityFeed />}
        {page === 'profile'   && <Profile navigate={navigate} />}
      </div>

      <BottomNav activeTab={activeTab} onTab={handleTabPress} />

      {showPrompt && (
        <NotificationPrompt
          reminderTime={reminderTime}
          onSave={requestAndSave}
          onDismiss={dismissPrompt}
        />
      )}
    </div>
  )
}
