import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import FormField from '../components/FormField.jsx'
import Notice from '../components/Notice.jsx'

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function submit(event) {
    event.preventDefault()
    setSent(true)
  }

  return (
    <AuthLayout
      eyebrow="◇ Account recovery"
      title="Let’s get you back in."
      description="Request a password reset using your authorised administrator email."
    >
      <form className="auth-form" onSubmit={submit}>
        <span className="eyebrow">Admin portal</span>
        <h2>Forgot password?</h2>
        <p className="muted auth-intro">
          Enter your admin email and we’ll send password reset instructions.
        </p>
        {sent ? (
          <Notice>Password reset instructions have been requested for {email}.</Notice>
        ) : (
          <FormField label="Email address">
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </FormField>
        )}
        {!sent && (
          <button className="button button-red button-full" type="submit">
            Send reset instructions <span aria-hidden="true">→</span>
          </button>
        )}
        <button type="button" className="text-button back-link" onClick={onBack}>
          ← Back to sign in
        </button>
      </form>
    </AuthLayout>
  )
}
