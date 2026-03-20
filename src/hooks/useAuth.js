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
    // Must call setProfileLoading(false) + setProfileFetched(true) on EVERY
    // exit path — they start as true/false respectively and gate App.jsx routing.
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
      // Cross-device fix: even on error, if localStorage already has the flag
      // from a previous successful fetch on this device, keep it intact.
      // If localStorage is also empty (truly new device + network error) the
      // user will see onboarding — that is the safest fallback.
    } else {
      // ORDER MATTERS: localStorage.setItem is synchronous and must run
      // BEFORE setProfileFetched(true) so that when React flushes the batch
      // and App.jsx re-renders, localStorage already reflects onboarding_done.
      setProfile(data ?? null)
      if (data?.onboarding_done === true) {
        localStorage.setItem('fb_onboarding_done', '1')
        console.log('[FaithBuilt] fetchProfile: onboarding_done=true, localStorage set')
      } else {
        console.log('[FaithBuilt] fetchProfile: onboarding_done=', data?.onboarding_done, '(ls unchanged)')
      }
    }
    // setProfileLoading + setProfileFetched batched last — App.jsx only
    // unblocks after both profile state AND localStorage are already updated.
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
      console.log('[FaithBuilt] token_hash detected:', type, tokenHash ? 'present' : 'missing')

      // A new signup confirmation — clear any stale onboarding flag so the
      // new user sees onboarding, not a cached state from a previous user.
      if (type === 'signup') {
        localStorage.removeItem('fb_onboarding_done')
      }

      supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(({ data, error }) => {
        console.log('[FaithBuilt] verifyOtp result:', data, error)
        if (!error && data?.session) {
          const u = data.session.user
          setUser(u)

          // BUG 1 FIX: save display_name now that we have an authenticated session.
          // The upsert in signUp() runs before email is confirmed — no session yet —
          // so RLS (auth.uid() = id) silently blocks it. Here the session is valid.
          const displayName = u.user_metadata?.display_name
          if (displayName) {
            supabase
              .from('profiles')
              .upsert({ id: u.id, display_name: displayName }, { onConflict: 'id' })
              .select()
              .then(({ data: d, error: e }) =>
                console.log('[FaithBuilt] display_name saved on confirm:', JSON.stringify(d), e ? JSON.stringify(e) : 'ok')
              )
          }

          fetchProfile(u.id)
          // BUG 2 FIX: mark as fetched so onAuthStateChange SIGNED_IN (which fires
          // right after verifyOtp) does not trigger a second fetchProfile call.
          profileFetchedOnce.current = true

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
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        setProfileFetched(true)
        setProfileLoading(false)
        profileFetchedOnce.current = false
      }
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
    // Attempt to write display_name immediately. This only succeeds when
    // Supabase is configured for instant signup (no email confirmation) because
    // that's the only case where data.session exists here. When email confirmation
    // is required there is no session yet and RLS will block this — the
    // verifyOtp handler in the useEffect picks it up instead.
    if (!error && data?.user && data?.session) {
      console.log('[FaithBuilt] instant confirm — saving display name:', displayName)
      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: data.user.id, display_name: displayName }, { onConflict: 'id' })
        .select()
      console.log('[FaithBuilt] signUp upsert result:', JSON.stringify(upsertData), JSON.stringify(upsertError))
    }
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
  async function markOnboardingDone() {
    setProfile(prev => ({ ...(prev ?? {}), onboarding_done: true }))
    localStorage.setItem('fb_onboarding_done', '1')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.id) {
      await supabase
        .from('profiles')
        .update({ onboarding_done: true })
        .eq('id', session.user.id)
    }
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
