import { useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'
import { formatDateTime } from '../date.js'
import { labelFor } from '../statusLabels.js'

export default function Support({
  issues,
  issuesLoading,
  issuesError,
  onRefresh,
  onResolve,
  detail,
  messages,
  detailLoading,
  detailError,
  onSelect,
  onCloseDetail,
  onReply,
}) {
  const [filter, setFilter] = useState('All issues')
  const [reply, setReply] = useState('')
  const [replyError, setReplyError] = useState('')
  const [replySaving, setReplySaving] = useState(false)
  useEffect(() => {
    onRefresh()
    const refreshTimer = window.setInterval(onRefresh, 15000)
    return () => window.clearInterval(refreshTimer)
  }, [onRefresh])

  const shown = issues.filter((issue) => (
    filter === 'All issues'
    || (filter === 'Resolved' ? issue.status === 'resolved' : issue.status !== 'resolved')
  ))

  return (
    <>
      <PageHeading
        title="Support Queue"
        subtitle="Track reported assessment issues and resolution status."
        action={(
          <span className="queue-count">
            <span className="live-dot" />
            {issues.filter((issue) => issue.status === 'open' || issue.status === 'in_progress').length} open issues
          </span>
        )}
      />
      <section className="panel">
        <div className="toolbar">
          <div>
            <h2>Reported issues</h2>
            <p className="muted">Review, update and resolve student support requests.</p>
          </div>
          <select aria-label="Filter support issues" value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option>All issues</option>
            <option>Open issues</option>
            <option>Resolved</option>
          </select>
          <button type="button" className="button button-outline" onClick={onRefresh} disabled={issuesLoading}>
            {issuesLoading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {issuesError && <p className="notice notice-error" role="alert">{issuesError}</p>}
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Issue</th>
                <th>Reported by</th>
                <th>Location</th>
                <th>Time</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((issue) => {
                const badgeColor = issue.status === 'resolved'
                  ? 'badge-green'
                  : issue.status === 'open' ? 'badge-red' : 'badge-amber'

                return (
                  <tr key={issue._id}>
                    <td className="strong-cell">
                      <button type="button" className="table-action issue-link" onClick={() => onSelect(issue._id)}>
                        {issue.description}
                      </button>
                    </td>
                    <td>{issue.reporter.name} ({issue.reporter.role})</td>
                    <td>{issue.venue} · {issue.seat}</td>
                    <td>{formatDateTime(issue.createdAt)}</td>
                    <td>
                      <span className={`badge ${badgeColor}`}>{labelFor('issue', issue.status)}</span>
                    </td>
                    <td>
                      {issue.status === 'resolved'
                        ? <span className="resolved-label">Fixed ✓</span>
                        : (
                          <>
                            {issue.status === 'open' && <button type="button" className="table-action" onClick={() => onResolve(issue._id, 'in_progress')}>In progress</button>}
                            <button type="button" className="table-action" onClick={() => onResolve(issue._id, 'resolved')}>Mark fixed</button>
                          </>
                        )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {shown.length === 0 && <p className="empty-state">No issues in this view.</p>}
        </div>
      </section>
      {detailLoading && <p className="empty-state" role="status">Loading issue details...</p>}
      {detailError && <p className="notice notice-error" role="alert">{detailError}</p>}
      {detail && (
        <section className="panel issue-detail">
          <div className="panel-heading">
            <div>
              <h2>Issue details</h2>
              <p className="muted">{detail.description} · {detail.venue} · {detail.seat}</p>
            </div>
            <button type="button" className="button button-outline" onClick={onCloseDetail}>Close</button>
          </div>
          <div className="detail-summary">
            <span>Reported by <strong>{detail.reporter.name}</strong></span>
            <span>Status <strong>{labelFor('issue', detail.status)}</strong></span>
            <span>{formatDateTime(detail.createdAt)}</span>
          </div>
          <div className="message-list">
            {messages.map((message) => (
              <article className="message-item" key={message._id}>
                <strong>
                  {message.senderId?.firstName
                    ? `${message.senderId.firstName} ${message.senderId.lastName || ''}`.trim()
                    : 'Portal user'}
                </strong>
                <small>{formatDateTime(message.createdAt)}</small>
                <p>{message.body}</p>
              </article>
            ))}
            {!messages.length && <p className="empty-state">No replies have been recorded.</p>}
          </div>
          <form
            className="reply-form"
            onSubmit={async (event) => {
              event.preventDefault()
              if (!reply.trim()) {
                setReplyError('Reply cannot be empty.')
                return
              }
              setReplySaving(true)
              setReplyError('')
              try {
                await onReply(detail._id, reply.trim())
                setReply('')
              } catch (error) {
                setReplyError(error.message)
              } finally {
                setReplySaving(false)
              }
            }}
          >
            <textarea value={reply} onChange={(event) => setReply(event.target.value)} rows="3" placeholder="Write a reply to the reporter" />
            {replyError && <p className="notice notice-error">{replyError}</p>}
            <button className="button button-primary" type="submit" disabled={replySaving}>
              {replySaving ? 'Sending…' : 'Send reply'}
            </button>
          </form>
        </section>
      )}
      <div className="support-note">
        <span>ⓘ</span>
        <p>
          <strong>Keeping the queue up to date</strong>
          <br />
          Mark an issue as fixed once the student confirms their workstation or
          access problem is resolved.
        </p>
      </div>
    </>
  )
}
