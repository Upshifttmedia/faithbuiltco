import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]             = useState(null)
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [authEvent, setAuthEvent]   = useState(null) // e.g. 'PASSWORD_RECOVERY'

  // ── Fetch profile (onboarding_done, display_name, etc.) ────────────
  async function fetchProfile(uid) {
    if (!uid) { setProfile(null); return }
    setProfileLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_done, commitment_days, display_name, reminder_time, identity_statement')
      .eq('id', uid)
      .maybeSingle()
    setProfile(data ?? null)
    // Mirror to localStorage so we don't need a network round-trip next open
    if (data?.onboarding_done) localStorage.setItem('fb_onboarding_done', '1')
    setProfileLoading(false)
  }

  // ── Session bootstrap ───────────────────────────────────────────────
  useEffect(() => {
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
        setLoading(false)
      })
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (event === 'SIGNED_IN')          fetchProfile(u?.id)
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
        emailRedirectTo: window.location.origin,
      },
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
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}?type=recovery`,
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
    authEvent,
    signUp,
    signIn,
    signOut,
    forgotPassword,
    resetPassword,
    markOnboardingDone,
  }
}
