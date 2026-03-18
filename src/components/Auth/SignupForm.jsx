import { useState } from 'react'

export default function SignupForm({ onSignup, onResend, onSwitch }) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  // 'idle' | 'confirm-email' — 'idle' also covers the immediate-login path
  // (when email confirmation is disabled, onAuthStateChange fires and the
  //  app navigates away automatically — no extra state needed here)
  const [stage, setStage]       = useState('idle')
  const [loading, setLoading]   = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Please enter your name.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    const { data, error: signupError } = await onSignup(email, password, name.trim())
    setLoading(false)

    if (signupError) {
      setError(signupError.message)
      return
    }

    // If Supabase returned a session, email confirmation is disabled —
    // onAuthStateChange will fire SIGNED_IN and the app navigates away.
    // No action needed; just let state update propagate.
    if (data?.session) return

    // No session → email confirmation required
    setStage('confirm-email')
  }

  async function handleResend() {
    setResendLoading(true)
    await onResend(email)
    setResendLoading(false)
    setResendSent(true)
  }

  if (stage === 'confirm-email') {
    return (
      <div className="auth-form">
        <div className="auth-success">
          <div className="success-icon">✦</div>
          <h2 className="auth-title">Check Your Email</h2>
          <p className="auth-subtitle">
            We sent a confirmation link to <strong>{email}</strong>.
            Open it to activate your account, then sign in here.
          </p>

          {resendSent ? (
            <p className="auth-subtitle" style={{ color: 'var(--gold)' }}>
              Resent! Check your inbox (and spam folder).
            </p>
          ) : (
            <button
              className="link-btn"
              onClick={handleResend}
              disabled={resendLoading}
              style={{ fontSize: '0.87rem' }}
            >
              {resendLoading ? 'Sending…' : "Didn't get it? Resend email"}
            </button>
          )}

          <button className="btn-primary" onClick={onSwitch} style={{ marginTop: 8 }}>
            Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 className="auth-title">Start Your Journey</h2>
      <p className="auth-subtitle">Create your FaithBuilt account</p>

      {error && <div className="auth-error">{error}</div>}

      <div className="field-group">
        <label className="field-label">Your Name</label>
        <input
          type="text"
          className="field-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="First name or full name"
          required
          autoComplete="name"
        />
      </div>

      <div className="field-group">
        <label className="field-label">Email</label>
        <input
          type="email"
          className="field-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      <div className="field-group">
        <label className="field-label">Password</label>
        <input
          type="password"
          className="field-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>

      <div className="field-group">
        <label className="field-label">Confirm Password</label>
        <input
          type="password"
          className="field-input"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </form>
  )
}
