import { useState } from 'react'
import AuthLayout from '../components/AuthLayout.jsx'
import FormField from '../components/FormField.jsx'
import Notice from '../components/Notice.jsx'
import { request } from '../api.js'

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [setupToken, setSetupToken] = useState('')
  const [step, setStep] = useState('email')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      if (step === 'email') {
        await request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
        setStep('code')
        setNotice('If this email belongs to an admin account, a verification code has been sent.')
      } else if (step === 'code') {
        const result = await request('/auth/verify-code', { method: 'POST', body: JSON.stringify({ email, code, purpose: 'password_reset' }) })
        setSetupToken(result.setupToken)
        setStep('password')
      } else {
        if (password !== confirmation) throw new Error('Passwords do not match.')
        await request('/auth/set-password', { method: 'POST', body: JSON.stringify({ setupToken, password }) })
        setStep('complete')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AuthLayout eyebrow="◇ Account recovery" title="Let’s get you back in." description="Reset your administrator password securely.">
      <form className="auth-form" onSubmit={submit}>
        <span className="eyebrow">Admin portal</span>
        <h2>{step === 'complete' ? 'Password updated' : 'Forgot password?'}</h2>
        {step === 'complete' ? (
          <>
            <Notice>Your password has been updated. You can now sign in.</Notice>
            <button type="button" className="button button-red button-full" onClick={onBack}>Back to sign in</button>
          </>
        ) : (
          <>
            <p className="muted auth-intro">Enter your email, verify the code, and choose a new password.</p>
            <FormField label="Email address">
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={step !== 'email'} required />
            </FormField>
            {step !== 'email' && <FormField label="Verification code"><input inputMode="numeric" pattern="[0-9]{6}" value={code} onChange={(event) => setCode(event.target.value)} disabled={step === 'password'} required /></FormField>}
            {step === 'password' && (
              <>
                <FormField label="New password"><input type="password" minLength="6" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></FormField>
                <FormField label="Confirm password"><input type="password" minLength="6" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required /></FormField>
              </>
            )}
            <Notice>{notice}</Notice>
            <Notice type="error">{error}</Notice>
            <button className="button button-red button-full" type="submit" disabled={saving}>{saving ? 'Please wait…' : step === 'email' ? 'Send reset code' : step === 'code' ? 'Verify code' : 'Update password'}</button>
          </>
        )}
        {step !== 'complete' && <button type="button" className="text-button back-link" onClick={onBack}>← Back to sign in</button>}
      </form>
    </AuthLayout>
  )
}
