import { useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'

export default function Reports({ sessions }) {
  const [range, setRange] = useState('Today')
  // Keep a couple of sample rows visible alongside the live session records.
  const reportSessions = [
    ...sessions,
    {
      module: 'DBS210 — Database Systems',
      lab: 'Lab 1',
      time: '14:00–16:00',
      checked: '32/36',
      status: 'Upcoming',
    },
    {
      module: 'PRG120 — Programming Fundamentals',
      lab: 'Lab 3',
      time: '08:00–10:00',
      checked: '30/34',
      status: 'Completed',
    },
  ]

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
        <select aria-label="Report date range" value={range} onChange={(event) => setRange(event.target.value)}>
          <option>Today</option>
          <option>This week</option>
          <option>This month</option>
        </select>
        <span className="report-date">15 September 2026</span>
      </div>
      <div className="stats-grid report-stats">
        <article className="stat-card">
          <span className="stat-icon blue">✓</span>
          <strong>312</strong>
          <span>Students checked in</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon amber">◷</span>
          <strong>24</strong>
          <span>Late arrivals</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon red">⌁</span>
          <strong>7</strong>
          <span>Issues reported</span>
        </article>
        <article className="stat-card">
          <span className="stat-icon green">▤</span>
          <strong>{sessions.length + 3}</strong>
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
                <th>Venue</th>
                <th>Time</th>
                <th>Attendance</th>
                <th>Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportSessions.map((session) => {
                const [checkedIn, enrolled] = session.checked.split('/').map(Number)
                const attendanceRate = Math.round(checkedIn / enrolled * 100)
                const statusColor = session.status === 'In progress'
                  ? 'badge-green'
                  : session.status === 'Completed' ? 'badge-blue' : 'badge-amber'

                return (
                  <tr key={session.module}>
                    <td className="strong-cell">{session.module}</td>
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel issue-report">
        <div>
          <span className="stat-icon red">⌁</span>
          <span>
            <strong>7 issues reported today</strong>
            <small>4 resolved · 2 in progress · 1 open</small>
          </span>
        </div>
        <span className="badge badge-green">57% resolved</span>
      </section>
    </>
  )
}
