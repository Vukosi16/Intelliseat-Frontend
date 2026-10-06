import { useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'

export default function Support({ issues, onResolve }) {
  const [filter, setFilter] = useState('All issues')
  const shown = issues.filter((issue) => (
    filter === 'All issues'
    || (filter === 'Resolved' ? issue.status === 'Resolved' : issue.status !== 'Resolved')
  ))

  return (
    <>
      <PageHeading
        title="Support Queue"
        subtitle="Track reported assessment issues and resolution status."
        action={(
          <span className="queue-count">
            <span className="live-dot" />
            {issues.filter((issue) => issue.status !== 'Resolved').length} open issues
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
        </div>
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
                const badgeColor = issue.status === 'Resolved'
                  ? 'badge-green'
                  : issue.status === 'Open' ? 'badge-red' : 'badge-amber'

                return (
                  <tr key={`${issue.student}-${issue.time}`}>
                    <td className="strong-cell">{issue.issue}</td>
                    <td>{issue.student}</td>
                    <td>{issue.location}</td>
                    <td>{issue.time}</td>
                    <td>
                      <span className={`badge ${badgeColor}`}>{issue.status}</span>
                    </td>
                    <td>
                      {issue.status === 'Resolved'
                        ? <span className="resolved-label">Fixed ✓</span>
                        : (
                          <button
                            type="button"
                            className="table-action"
                            onClick={() => onResolve(issue.student, issue.time)}
                          >
                            Mark fixed
                          </button>
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
