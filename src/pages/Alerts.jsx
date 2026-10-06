import { useState } from 'react'
import FormField from '../components/FormField.jsx'
import Notice from '../components/Notice.jsx'
import PageHeading from '../components/PageHeading.jsx'

export default function Alerts({ onCreate, alerts }) {
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('All students')
  const [notice, setNotice] = useState('')

  function submit(event) {
    event.preventDefault()
    onCreate({
      message: message.trim(),
      audience,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
    setNotice('Your alert has been published to the selected audience.')
    setMessage('')
  }

  return (
    <>
      <PageHeading title="Create Alert" subtitle="Send an important message to students and invigilators." />
      <div className="content-columns alert-columns">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <h2>Alert message</h2>
              <p className="muted">Alerts are displayed in the IntelliSeat student portal.</p>
            </div>
            <span className="stat-icon blue">✉</span>
          </div>
          <FormField label="Send to">
            <select value={audience} onChange={(event) => setAudience(event.target.value)}>
              <option>All students</option>
              <option>All invigilators</option>
              <option>Year 1 students</option>
              <option>Year 2 students</option>
              <option>Year 3 students</option>
            </select>
          </FormField>
          <FormField label="Message">
            <textarea
              rows="6"
              maxLength="280"
              placeholder="Write your alert message here…"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              required
            />
          </FormField>
          <div className="character-count">{message.length} / 280 characters</div>
          <Notice>{notice}</Notice>
          <button className="button button-primary" type="submit" disabled={!message.trim()}>
            Publish alert <span aria-hidden="true">→</span>
          </button>
        </form>
        <section className="panel alert-preview">
          <div className="panel-heading">
            <div>
              <h2>Preview</h2>
              <p className="muted">This is how your alert will appear.</p>
            </div>
          </div>
          <article className="preview-card">
            <div className="preview-top">
              <span className="brand-mark">I</span>
              <span>
                <strong>IntelliSeat notice</strong>
                <small>Just now · {audience}</small>
              </span>
            </div>
            <p>{message || 'Your alert message will appear here once you start typing.'}</p>
            <span className="preview-tag">Important update</span>
          </article>
          <h3>Recent alerts</h3>
          <div className="recent-alerts">
            {alerts.length ? alerts.map((alert, index) => (
              <article key={`${alert.time}-${index}`}>
                <strong>{alert.message}</strong>
                <small>{alert.audience} · {alert.time}</small>
              </article>
            )) : <p className="muted">No alerts have been published yet.</p>}
          </div>
        </section>
      </div>
    </>
  )
}
