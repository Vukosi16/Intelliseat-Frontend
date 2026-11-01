import { useState } from 'react'
import FormField from '../components/FormField.jsx'
import Notice from '../components/Notice.jsx'
import PageHeading from '../components/PageHeading.jsx'
import { formatDateTime } from '../date.js'

export default function Alerts({ onCreate, alerts, onRead }) {
  const [message, setMessage] = useState('')
  const [audience, setAudience] = useState('all_students')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    if (!message.trim() || message.trim().length > 280) {
      setError('Enter an alert between 1 and 280 characters.')
      return
    }
    setError('')
    setNotice('')
    try {
      await onCreate({
        message: message.trim(),
        audienceType: audience.startsWith('year_students') ? 'year_students' : audience,
        ...(audience.startsWith('year_') ? { year: Number(audience.slice(-1)) } : {}),
      })
      setNotice('Your alert has been published to the selected audience.')
      setMessage('')
    } catch (error) {
      setError(error.message)
    }
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
              <option value="all_students">All students</option>
              <option value="all_invigilators">All invigilators</option>
              <option value="year_students_1">Year 1 students</option>
              <option value="year_students_2">Year 2 students</option>
              <option value="year_students_3">Year 3 students</option>
              <option value="year_students_4">Year 4 students</option>
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
          <Notice type="error">{error}</Notice>
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
            {alerts.length ? alerts.map((alert) => (
              <article className={alert.read ? 'alert-read' : 'alert-unread'} key={alert._id}>
                <strong>{alert.message}</strong>
                <small>{alert.audienceType} · {formatDateTime(alert.createdAt)}</small>
                {!alert.read && <button type="button" className="table-action" onClick={() => onRead(alert._id)}>Mark as read</button>}
              </article>
            )) : <p className="muted">No alerts have been published yet.</p>}
          </div>
        </section>
      </div>
    </>
  )
}
