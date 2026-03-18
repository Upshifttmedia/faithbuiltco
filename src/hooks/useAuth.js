import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Canonical app URL ────────────────────────────────────────────────────
// VITE_SITE_URL must be set in Vercel environment variables to
// https://faithbuiltco.vercel.app so that auth emails always link back
// to the correct site regardless of where the code runs.
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin

export function useAuth() {
  const [user, setUser]             = useState(null)
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [profileLoading, setProfileLoading] = useState(true) // true until first fetch completes
  const [profileFetched, setProfileFetched] = useState(false) // true after first fetch completes
  const [authEvent, setAuthEvent]   = useState(null) // e.g. 'PASSWORD_RECOVERY'

  // ── Fetch profile (onboarding_done, display_name, etc.) ────────────
  async function fetchProfile(uid) {
    // Must call setProfileLoading(false) on every exit path — it starts true.
    if (!uid) { setProfile(null); setProfileLoading(false); setProfileFetched(true); return }
    setProfileLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_done, commitment_days, display_name, identity_statement')
      .eq('id', uid)
      .maybeSingle()
    if (error) {
      // Log but don't overwrite profile state on a failed fetch — a stale
      // profile is safer than a null one that wipes onboarding_done.
      console.error('[FaithBuilt] fetchProfile error:', JSON.stringify(error))
    } else {
      setProfile(data ?? null)
      // Mirror to localStorage so the onboarding check survives a failed fetch.
      if (data?.onboarding_done) localStorage.setItem('fb_onboarding_done', '1')
    }
    setProfileLoading(false)
    setProfileFetched(true)
  }

  // ── Session bootstrap ───────────────────────────────────────────────
  const profileFetchedOnce = { current: false }
  useEffect(() => {
    // If localStorage already has onboarding done, set profile optimistically
    // so the app never flashes onboarding for returning users
    if (localStorage.getItem('fb_onboarding_done') === '1') {
      setProfile(prev => ({ ...(prev ?? {}), onboarding_done: true }))
      setProfileFetched(true)
      setProfileLoading(false)
    }

    // Handle email-confirmation / password-reset links with a token in the URL
    const params    = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type      = params.get('type')

    if (tokenHash && type) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ data, error }) => {
        if (!error && data?.session) {
          setUser(data.session.user)
          fetchProfile(data.session.user.id)
          if (type === 'recovery') setAuthEvent('PASSWORD_RECOVERY')
        }
        // Clean the URL so a reload doesn't re-trigger
        window.history.replaceState({}, '', window.location.pathname)
        setLoading(false)
      })
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const u = session?.user ?? null
        setUser(u)
        fetchProfile(u?.id)
        profileFetchedOnce.current = true
        setLoading(false)
      })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (event === 'SIGNED_IN') {
        if (!profileFetchedOnce.current) {
          profileFetchedOnce.current = true
          fetchProfile(u?.id)
        }
      }
      if (event === 'SIGNED_OUT')         setProfile(null)
      if (event === 'PASSWORD_RECOVERY')  setAuthEvent('PASSWORD_RECOVERY')
      if (event === 'SIGNED_IN' && authEvent === 'PASSWORD_RECOVERY') setAuthEvent(null)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth actions ────────────────────────────────────────────────────
  async function signUp(email, password, displayName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        // Always redirect back to the production URL so confirmation
        // emails work correctly even if Supabase Site URL is stale.
        emailRedirectTo: SITE_URL,
      },
    })
    return { data, error }
  }

  async function resendConfirmation(email) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: SITE_URL },
    })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    setAuthEvent(null)
    setProfile(null)
    localStorage.removeItem('fb_onboarding_done')
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  async function forgotPassword(email) {
    // redirectTo must be whitelisted in Supabase dashboard:
    // Authentication → URL Configuration → Redirect URLs
    // Add: https://faithbuiltco.vercel.app
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: SITE_URL,
    })
    return { data, error }
  }

  async function resetPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) setAuthEvent(null)
    return { data, error }
  }

  // Call this after onboarding completes so App can update without a page reload
  function markOnboardingDone() {
    setProfile(prev => ({ ...(prev ?? {}), onboarding_done: true }))
  }

  return {
    user,
    profile,
    loading,
    profileLoading,
    profileFetched,
    authEvent,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    resendConfirmation,
    markOnboardingDone,
  }
}
