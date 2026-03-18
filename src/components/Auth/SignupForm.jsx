import { useState } from 'react'

export default function SignupForm({ onSignup, onSwitch }) {
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await onSignup(email, password, name.trim())
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="auth-form">
        <div className="auth-success">
          <div className="success-icon">✦</div>
          <h2 className="auth-title">Account Created</h2>
          <p className="auth-subtitle">Check your email to confirm your account, then sign in.</p>
          <button className="btn-primary" onClick={onSwitch}>Sign In</button>
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
