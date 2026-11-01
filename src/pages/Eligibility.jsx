import { useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'
import { labelFor } from '../statusLabels.js'

export default function Eligibility({ students, onUpdate }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All students')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState('')
  const pageSize = 25
  const eligibleCount = students.filter((student) => student.eligibility === 'eligible').length
  const filtered = students.filter((student) => (
    `${student.firstName} ${student.lastName} ${student.studentNumber} ${student.course}`.toLowerCase().includes(query.toLowerCase())
    && (filter === 'All students' || (filter === 'Eligible' ? student.eligibility === 'eligible' : student.eligibility === 'needs_review'))
  ))
  const shown = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <>
      <PageHeading
        title="Student Eligibility"
        subtitle="Review student clearance before assessment day."
        action={(
          <button className="button button-primary" type="button" onClick={() => window.print()}>
            Download list <span aria-hidden="true">↓</span>
          </button>
        )}
      />
      <div className="eligibility-summary">
        <div className="summary-card">
          <span className="summary-dot green-dot" />
          <span><strong>{eligibleCount}</strong><small>Eligible to sit</small></span>
        </div>
        <div className="summary-card">
          <span className="summary-dot amber-dot" />
          <span><strong>{students.length - eligibleCount}</strong><small>Needs review</small></span>
        </div>
        <div className="summary-card">
          <span className="summary-dot blue-dot" />
          <span><strong>{students.filter((student) => student.eligibilityReviewedAt).length}</strong><small>Reviewed this week</small></span>
        </div>
      </div>
      <section className="panel">
        <div className="toolbar">
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search students"
              placeholder="Search by name, student number or course"
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(1) }}
            />
          </label>
          <select aria-label="Filter by eligibility" value={filter} onChange={(event) => { setFilter(event.target.value); setPage(1) }}>
            <option>All students</option>
            <option>Eligible</option>
            <option>Needs review</option>
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Student number</th>
                <th>Course</th>
                <th>Year</th>
                <th>Clearance</th>
                <th>Eligibility</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((student) => (
                <tr key={student._id}>
                <td className="strong-cell">{student.firstName} {student.lastName}</td>
                <td>{student.studentNumber}</td>
                  <td>{student.course}</td>
                  <td>{student.year}</td>
                  <td>{labelFor('clearanceStatus', student.clearanceStatus)}</td>
                  <td>
                    <span className={`badge ${student.eligibility === 'eligible' ? 'badge-green' : 'badge-amber'}`}>
                      {labelFor('eligibility', student.eligibility)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="table-action"
                      type="button"
                      disabled={saving === student._id}
                      onClick={async () => {
                        setSaving(student._id)
                        setError('')
                        try {
                          await onUpdate(student._id, student.eligibility === 'eligible' ? 'needs_review' : 'eligible', '')
                        } catch (requestError) {
                          setError(requestError.message)
                        } finally {
                          setSaving('')
                        }
                      }}
                    >
                      {student.eligibility === 'eligible' ? 'Mark for review' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="empty-state">No students match your search.</p>}
        </div>
        {error && <p className="notice notice-error">{error}</p>}
        {filtered.length > pageSize && <div className="pagination"><button type="button" className="button button-outline button-small" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page} of {Math.ceil(filtered.length / pageSize)}</span><button type="button" className="button button-outline button-small" disabled={page >= Math.ceil(filtered.length / pageSize)} onClick={() => setPage((current) => current + 1)}>Next</button></div>}
      </section>
    </>
  )
}
