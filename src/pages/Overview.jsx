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
  const openIssues = issues.filter((issue) => issue.status !== 'Resolved').length

  return (
    <>
      <PageHeading title="Overview" subtitle="Tuesday, 15 September 2026" />
      <div className="stats-grid">
        <StatCard icon="✓" color="blue" value="312" label="Checked in today" note="↑ 8% from yesterday" />
        <StatCard
          icon="◷"
          color="amber"
          value={users.filter((user) => !user.eligible).length + 22}
          label="Pending eligibility"
          note="Across all programmes"
        />
        <StatCard
          icon="⌁"
          color="red"
          value={openIssues + 4}
          label="Open hardware issues"
          note={`${openIssues} in your support queue`}
        />
        <StatCard
          icon="▤"
          color="green"
          value={assessments.length + 3}
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
                <strong>38 students checked in</strong>
                <small>ITSD200 · Systems Design <span>· 09:46</span></small>
              </p>
            </div>
            <div>
              <span className="activity-icon activity-amber">＋</span>
              <p>
                <strong>Eligibility review needed</strong>
                <small>22 students have pending requirements <span>· 09:20</span></small>
              </p>
            </div>
            <div>
              <span className="activity-icon activity-red">⌁</span>
              <p>
                <strong>Hardware issue reported</strong>
                <small>Lab 2 · Workstation PC 14 <span>· 09:18</span></small>
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
