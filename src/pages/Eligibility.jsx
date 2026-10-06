import { useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'

export default function Eligibility({ students, onUpdate }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All students')
  const eligibleCount = students.filter((student) => student.eligible).length
  const shown = students.filter((student) => (
    `${student.name} ${student.number} ${student.course}`.toLowerCase().includes(query.toLowerCase())
    && (filter === 'All students' || (filter === 'Eligible' ? student.eligible : !student.eligible))
  ))

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
          <span><strong>{eligibleCount + 286}</strong><small>Eligible to sit</small></span>
        </div>
        <div className="summary-card">
          <span className="summary-dot amber-dot" />
          <span><strong>{students.length - eligibleCount + 22}</strong><small>Needs review</small></span>
        </div>
        <div className="summary-card">
          <span className="summary-dot blue-dot" />
          <span><strong>312</strong><small>Reviewed this week</small></span>
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
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select aria-label="Filter by eligibility" value={filter} onChange={(event) => setFilter(event.target.value)}>
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
                <tr key={student.number}>
                  <td className="strong-cell">{student.name}</td>
                  <td>{student.number}</td>
                  <td>{student.course}</td>
                  <td>{student.year}</td>
                  <td>{student.clearance}</td>
                  <td>
                    <span className={`badge ${student.eligible ? 'badge-green' : 'badge-amber'}`}>
                      {student.eligible ? 'Eligible' : 'Needs review'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="table-action"
                      type="button"
                      onClick={() => onUpdate(student.number, !student.eligible)}
                    >
                      {student.eligible ? 'Mark for review' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shown.length === 0 && <p className="empty-state">No students match your search.</p>}
        </div>
      </section>
    </>
  )
}
