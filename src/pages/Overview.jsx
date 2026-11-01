import PageHeading from '../components/PageHeading.jsx'

function StatCard({ icon, color, value, label, note }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${color}`}>{icon}</span>
      <strong>{value}</strong>
      <span>{label}</span>
      <small className="stat-trend">{note}</small>
    </article>
  )
}

export default function Overview({ users, assessments, issues, sessions, onNavigate }) {
  const openIssues = issues.filter((issue) => issue.status !== 'resolved').length
  const checkedIn = sessions.reduce((total, session) => total + Number(session.checked?.split('/')[0] || 0), 0)
  const pendingEligibility = users.filter((user) => user.role === 'student' && user.eligibility === 'needs_review').length

  return (
    <>
      <PageHeading title="Overview" subtitle={new Date().toLocaleDateString()} />
      <div className="stats-grid">
        <StatCard icon="✓" color="blue" value={checkedIn} label="Checked in today" note="From current assessment reports" />
        <StatCard
          icon="◷"
          color="amber"
          value={pendingEligibility}
          label="Pending eligibility"
          note="Across all programmes"
        />
        <StatCard
          icon="⌁"
          color="red"
          value={openIssues}
          label="Open hardware issues"
          note={`${openIssues} in your support queue`}
        />
        <StatCard
          icon="▤"
          color="green"
          value={assessments.length}
          label="Assessments today"
          note="2 currently in progress"
        />
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Today&apos;s sessions</h2>
            <p className="muted">Live assessment attendance</p>
          </div>
          <button
            className="button button-outline button-small"
            type="button"
            onClick={() => onNavigate('reports')}
          >
            View attendance report <span aria-hidden="true">→</span>
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Module</th>
                <th>Type</th>
                <th>Lab</th>
                <th>Time</th>
                <th>Checked in</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.module}>
                  <td className="strong-cell">{session.module}</td>
                  <td>{session.type}</td>
                  <td>{session.lab}</td>
                  <td>{session.time}</td>
                  <td>{session.checked}</td>
                  <td>
                    <span className={`badge ${session.status === 'In progress' ? 'badge-green' : 'badge-amber'}`}>
                      {session.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="overview-bottom">
        <section className="panel activity-panel">
          <div className="panel-heading">
            <div><h2>Recent activity</h2><p className="muted">Latest updates across your portal</p></div>
            <span className="live-dot">Live</span>
          </div>
          <div className="activity-list">
            <div>
              <span className="activity-icon activity-blue">✓</span>
              <p>
                <strong>{checkedIn} students checked in</strong>
                <small>From current assessment reports</small>
              </p>
            </div>
            <div>
              <span className="activity-icon activity-amber">＋</span>
              <p>
                <strong>Eligibility review needed</strong>
                <small>{pendingEligibility} students have pending requirements</small>
              </p>
            </div>
            <div>
              <span className="activity-icon activity-red">⌁</span>
              <p>
                <strong>Support queue status</strong>
                <small>{openIssues} open issue{openIssues === 1 ? '' : 's'}</small>
              </p>
            </div>
          </div>
        </section>
        <section className="panel quick-panel">
          <h2>Quick actions</h2>
          <p className="muted">Get things done faster</p>
          <button type="button" onClick={() => onNavigate('users')}>
            ＋
            <span>
              <strong>Create a user</strong>
              <small>Add a student or invigilator</small>
            </span>
            <b>→</b>
          </button>
          <button type="button" onClick={() => onNavigate('assessments')}>
            ▤
            <span>
              <strong>New assessment</strong>
              <small>Schedule an exam session</small>
            </span>
            <b>→</b>
          </button>
        </section>
      </div>
    </>
  )
}
