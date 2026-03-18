import { useState } from 'react'

export default function ForgotPassword({ onForgotPassword, onBack }) {
  const [email, setEmail]     = useState('')
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await onForgotPassword(email)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="auth-form">
        <div className="auth-success">
          <div className="success-icon">✦</div>
          <h2 className="auth-title">Check Your Email</h2>
          <p className="auth-subtitle">
            We sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
          </p>
          <button className="btn-primary" onClick={onBack}>Back to Sign In</button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

      {error && <div className="auth-error">{error}</div>}

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

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Sending…' : 'Send Reset Link'}
      </button>

      <p className="auth-switch">
        <button type="button" className="link-btn" onClick={onBack}>
          ← Back to Sign In
        </button>
      </p>
    </form>
  )
}
