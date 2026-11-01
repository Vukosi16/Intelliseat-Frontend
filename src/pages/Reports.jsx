import PageHeading from '../components/PageHeading.jsx'
import { formatDate, formatDateTime } from '../date.js'

export default function Reports({
  sessions,
  range,
  onRangeChange,
  loading,
  error,
  selectedSession,
  attendance,
  absences,
  attendanceLoading,
  attendanceError,
  onSelectSession,
  onCloseAttendance,
}) {
  const reportSessions = sessions
  const totals = reportSessions.reduce((result, session) => {
    const [checkedIn, enrolled] = session.checked.split('/').map(Number)
    return {
      checkedIn: result.checkedIn + (checkedIn || 0),
      enrolled: result.enrolled + (enrolled || 0),
    }
  }, { checkedIn: 0, enrolled: 0 })

  return (
    <>
      <PageHeading
        title="Reports"
        subtitle="Attendance and incident reporting across assessment sessions."
        action={(
          <button className="button button-outline" type="button" onClick={() => window.print()}>
            Export report <span aria-hidden="true">↓</span>
          </button>
        )}
      />
      <div className="toolbar report-toolbar">
        <span className="muted">Showing report for</span>
        <select aria-label="Report date range" value={range} onChange={(event) => onRangeChange(event.target.value)}>
          <option>Today</option>
          <option>This week</option>
          <option>This month</option>
          <option>All time</option>
        </select>
        <span className="report-date">{range} · {new Date().toLocaleDateString()}</span>
      </div>
      {loading && <p className="empty-state" role="status">Loading report data...</p>}
      {error && <p className="notice notice-error" role="alert">Could not load reports: {error}</p>}
      <div className="stats-grid report-stats">
        <article className="stat-card">
          <span className="stat-icon blue">✓</span>
          <strong>{totals.checkedIn}</strong>
          <span>Students checked in</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon amber">◷</span>
          <strong>—</strong>
          <span>Late arrivals</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon red">⌁</span>
          <strong>—</strong>
          <span>Issues reported</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon green">▤</span>
          <strong>{sessions.length}</strong>
          <span>Sessions scheduled</span>
        </article>
      </div>
      <section className="panel report-panel">
        <div className="panel-heading">
          <div>
            <h2>Session attendance</h2>
            <p className="muted">Check-in totals for each assessment session</p>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Type</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Time</th>
                <th>Attendance</th>
                <th>Rate</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {reportSessions.map((session) => {
                const [checkedIn, enrolled] = session.checked.split('/').map(Number)
                const attendanceRate = enrolled ? Math.round(checkedIn / enrolled * 100) : 0
                const statusColor = session.status === 'In progress'
                  ? 'badge-green'
                  : session.status === 'Completed' ? 'badge-blue' : 'badge-amber'

                return (
                  <tr key={session._id || session.module}>
                    <td className="strong-cell">{session.module}</td>
                    <td>{session.type}</td>
                    <td>{formatDate(session.date)}</td>
                    <td>{session.lab}</td>
                    <td>{session.time}</td>
                    <td>{session.checked}</td>
                    <td>
                      <span className="rate-track"><span style={{ width: `${attendanceRate}%` }} /></span>
                      <span className="rate-text">{attendanceRate}%</span>
                    </td>
                    <td>
                      <span className={`badge ${statusColor}`}>{session.status}</span>
                    </td>
                    <td>
                      <button
                        className="table-action"
                        type="button"
                        onClick={() => onSelectSession(session)}
                      >
                        View attendance
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {reportSessions.length === 0 && !loading && <p className="empty-state">No report data is available for this range.</p>}
        </div>
      </section>
      {selectedSession && (
        <section className="panel report-panel">
          <div className="panel-heading">
            <div>
              <h2>Attendance details</h2>
              <p className="muted">
                {selectedSession.module} · {formatDate(selectedSession.date)} · {selectedSession.lab}
              </p>
            </div>
            <button className="button button-outline button-small" type="button" onClick={onCloseAttendance}>
              Close
            </button>
          </div>
          {attendanceLoading && <p className="empty-state" role="status">Loading attendance records...</p>}
          {attendanceError && <p className="notice notice-error" role="alert">Could not load attendance: {attendanceError}</p>}
          {!attendanceLoading && !attendanceError && (
            <>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Student number</th>
                      <th>Seat</th>
                      <th>Attendance</th>
                      <th>Check-in time</th>
                      <th>Verified by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record._id}>
                        <td className="strong-cell">{record.student.name}</td>
                        <td>{record.student.studentNumber}</td>
                        <td>{record.seat}</td>
                        <td>{record.status === 'expelled' ? 'Expelled' : record.checkedIn ? 'Present' : 'Absent'}</td>
                        <td>{record.verifiedAt ? formatDateTime(record.verifiedAt) : '—'}</td>
                        <td>{record.verifiedBy || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!attendance.length && <p className="empty-state">No attendance records were found for this assessment.</p>}
              </div>
              <div className="panel-heading">
                <div>
                  <h3>Reported absentees</h3>
                  <p className="muted">Absence reports submitted by students for this assessment.</p>
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Student number</th>
                      <th>Reason</th>
                      <th>Details</th>
                      <th>Reported</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absences.map((absence) => {
                      const student = absence.studentId || {}
                      return (
                        <tr key={absence._id}>
                          <td className="strong-cell">
                            {[student.firstName, student.lastName].filter(Boolean).join(' ') || 'Unknown student'}
                          </td>
                          <td>{student.studentNumber || '—'}</td>
                          <td>{absence.reason}</td>
                          <td>{absence.details || '—'}</td>
                          <td>{absence.createdAt ? formatDateTime(absence.createdAt) : '—'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {!absences.length && <p className="empty-state">No absences were reported for this assessment.</p>}
              </div>
            </>
          )}
        </section>
      )}
      <section className="panel issue-report">
        <div>
          <span className="stat-icon red">⌁</span>
          <span>
            <strong>{reportSessions.reduce((total, session) => total + session.incidents, 0)} pending attendance records</strong>
            <small>Expulsions recorded: {reportSessions.reduce((total, session) => total + session.expelled, 0)}.</small>
          </span>
        </div>
        <span className="badge badge-green">Backend totals</span>
      </section>
    </>
  )
}
