import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import FormField from '../components/FormField.jsx'
import Notice from '../components/Notice.jsx'

export default function Login({ onLogin, onForgot }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event) {
    event.preventDefault()
    if (!email.trim() || !password) {
      setError('Enter your email address and password to continue.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onLogin({ email, password })
    } catch {
      setError('Incorrect email or password')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthLayout
      eyebrow="◇ Secure administration"
      title="Manage every assessment with confidence."
      description="Control users, assessments and live examination sessions from one secure workspace."
    >
      <form className="auth-form" onSubmit={submit}>
        <span className="eyebrow">Admin portal</span>
        <h2>Welcome back</h2>
        <p className="muted auth-intro">Sign in with your authorised administrator account.</p>
        <FormField label="Email address">
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </FormField>
        <FormField label="Password">
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </FormField>
        <div className="forgot-row">
          <button type="button" className="text-button" onClick={onForgot}>Forgot password?</button>
        </div>
        <Notice type="error">{error}</Notice>
        <button className="button button-red button-full" type="submit" disabled={saving}>
          {saving ? 'Signing in…' : 'Sign in to Dashboard'} <span aria-hidden="true">→</span>
        </button>
        <p className="auth-footnote">
          Admin accounts are provisioned by IT — self-registration is not available.
        </p>
      </form>
    </AuthLayout>
  )
}
