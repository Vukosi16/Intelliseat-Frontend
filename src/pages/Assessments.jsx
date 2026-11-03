import { useState } from 'react'
import FormField from '../components/FormField.jsx'
import Notice from '../components/Notice.jsx'
import PageHeading from '../components/PageHeading.jsx'
import { formatDate } from '../date.js'
import { formatAssessmentTitle } from '../assessmentDisplay.js'

export default function Assessments({
  assessments,
  venues,
  modules,
  qualifications = [],
  onCreate,
  onUpdate,
  onCancel,
  onDelete,
  onRestore,
  detail,
  students,
  mapSeats = [],
  detailLoading,
  detailError,
  onSelect,
  onCloseDetail,
}) {
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionSaving, setActionSaving] = useState(false)
  const [actionError, setActionError] = useState('')
  const [qualification, setQualification] = useState('')
  const [qualificationYear, setQualificationYear] = useState('')
  const [assessmentType, setAssessmentType] = useState('')
  const [editing, setEditing] = useState(null)

  const qualificationOptions = qualifications
  const availableYears = qualifications.find((item) => item.name === qualification)?.years || 0
  const filteredModules = (modules || []).filter((module) =>
    (!qualification || module.course === qualification) &&
    (!qualificationYear || String(module.year) === qualificationYear)
  )
  const allocationsBySeat = new Map(
    (students || [])
      .filter((allocation) => allocation.seatId && allocation.status !== 'expelled')
      .map((allocation) => [String(allocation.seatId), allocation])
  )

  function startEditing(assessment) {
    setEditing(assessment)
    setQualification(assessment.qualification || '')
    setQualificationYear(String(assessment.qualificationYear || ''))
    setAssessmentType(assessment.type || '')
    setError('')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function stopEditing() {
    setEditing(null)
    setQualification('')
    setQualificationYear('')
    setAssessmentType('')
    setError('')
    setNotice('')
  }

  async function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    if (!data.moduleName?.trim() || !data.qualification || !data.qualificationYear || !data.date || !data.startTime || !data.endTime || !data.venueId) {
      setError('Complete all required assessment fields.')
      return
    }
    if (data.endTime <= data.startTime) {
      setError('End time must be after the start time.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const values = {
        _id: editing?._id || crypto.randomUUID(),
        moduleName: data.moduleName.trim(),
        qualification: data.qualification,
        qualificationYear: Number(data.qualificationYear),
        name: data.moduleName.trim(),
        type: assessmentType,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        venueId: data.venueId,
        invigilatorId: data.invigilatorId || null,
        instructions: data.instructions,
      }
      if (editing) {
        await onUpdate(editing._id, values)
        stopEditing()
        setNotice(`Assessment updated: ${data.moduleName.trim()}.`)
      } else {
        await onCreate(values)
        setNotice(`Assessment scheduled for ${data.moduleName.trim()}.`)
        form.reset()
        setQualification('')
        setQualificationYear('')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function restoreSelected() {
    setActionSaving(true)
    setActionError('')
    try {
      await onRestore(detail._id)
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setActionSaving(false)
    }
  }

  async function cancelSelected() {
    setActionSaving(true)
    setActionError('')
    try {
      await onCancel(detail._id)
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setActionSaving(false)
    }
  }

  async function deleteSelected() {
    setActionSaving(true)
    setActionError('')
    try {
      await onDelete(detail._id)
      setEditing(null)
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setActionSaving(false)
    }
  }

  return (
    <>
      <PageHeading title="Assessments" subtitle="Schedule, review, edit, and cancel assessment sessions." />
      <div className="content-columns">
        <form className="panel form-panel" key={editing?._id || 'new-assessment'} onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <h2>{editing ? 'Edit assessment' : 'Schedule an assessment'}</h2>
              <p className="muted">Fields marked with * are required.</p>
            </div>
          </div>
          <div className="form-grid two-col">
            <FormField label="Qualification *">
              <select
                name="qualification"
                value={qualification}
                onChange={(event) => { setQualification(event.target.value); setQualificationYear('') }}
                required
              >
                <option value="">Select a qualification</option>
                {qualificationOptions.map((option) => <option key={option.name} value={option.name}>{option.name}</option>)}
              </select>
            </FormField>
            <FormField label="Qualification year *">
              <select name="qualificationYear" value={qualificationYear} onChange={(event) => setQualificationYear(event.target.value)} required>
                <option value="">Select a year</option>
                {Array.from({ length: availableYears }, (_, index) => index + 1).map((year) => <option key={year} value={year}>Year {year}</option>)}
              </select>
            </FormField>
            <FormField label="Module type / assessment name *">
              <input
                name="moduleName"
                list="qualification-modules"
                placeholder="Select or enter a module name"
                defaultValue={editing?.moduleId?.name || editing?.name || ''}
                required
              />
              <datalist id="qualification-modules">
                {filteredModules.map((module) => (
                  <option key={module._id} value={module.name} label={module.code} />
                ))}
              </datalist>
              <small className="muted">If the module is not listed, enter its name to add it for this qualification and year.</small>
            </FormField>
            <FormField label="Assessment type *">
              <select name="type" value={assessmentType} onChange={(event) => setAssessmentType(event.target.value)} required>
                <option value="">Select assessment type</option>
                <option value="CA Test">CA Test</option>
                <option value="Exam">Exam</option>
                <option value="Mock Assessment">Mock Assessment</option>
                <option value="Class Exercise">Class Exercise</option>
              </select>
            </FormField>
            <FormField label="Assessment date *">
              <input name="date" type="date" defaultValue={editing?.date || ''} required />
            </FormField>
            <FormField label="Start time *">
              <input name="startTime" type="time" defaultValue={editing?.startTime || ''} required />
            </FormField>
            <FormField label="End time *">
              <input name="endTime" type="time" defaultValue={editing?.endTime || ''} required />
            </FormField>
            <FormField label="Venue / lab *">
              <select name="venueId" defaultValue={editing?.venue?._id || ''} required>
                <option value="">Select a venue</option>
                {(venues || []).map((venue) => <option key={venue._id} value={venue._id}>{venue.name}</option>)}
              </select>
            </FormField>
            <FormField label="Instructions" className="full-span">
              <textarea
                name="instructions"
                rows="3"
                placeholder="Add notes or special instructions for this assessment"
                defaultValue={editing?.instructions || ''}
              />
            </FormField>
          </div>
          <Notice>{notice}</Notice>
          <Notice type="error">{error}</Notice>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? (editing ? 'Saving changes…' : 'Creating assessment…') : (editing ? 'Save changes' : 'Create assessment')} <span aria-hidden="true">→</span>
          </button>
          {editing && <button className="button button-outline" type="button" onClick={stopEditing}>Stop editing</button>}
        </form>
        <section className="panel upcoming-panel">
          <div className="panel-heading">
            <div>
              <h2>All assessments</h2>
              <p className="muted">{assessments.length} assessment sessions</p>
            </div>
          </div>
          <div className="upcoming-list">
            {assessments.map((assessment) => (
              <button
                className="upcoming-item"
                key={assessment._id}
                type="button"
                onClick={() => { setActionError(''); onSelect(assessment._id) }}
                aria-label={`View details for ${formatAssessmentTitle(assessment)}`}
              >
                <span className="date-tile">
                  {formatDate(assessment.date).split(' ')[0]}
                  <small>{formatDate(assessment.date).split(' ')[1]}</small>
                </span>
                <div>
                  <strong>{formatAssessmentTitle(assessment)}</strong>
                  <small>{assessment.type || 'Type not set'}</small>
                  <small>{assessment.startTime}–{assessment.endTime} · {assessment.venue.name}</small>
                  <small>{assessment.status === 'cancelled' ? 'Cancelled' : 'Enrollment loaded from the module'}</small>
                </div>
                <span className="item-arrow">→</span>
              </button>
            ))}
            {!assessments.length && <p className="empty-state">No assessments are available.</p>}
          </div>
        </section>
      </div>
      {detailLoading && <p className="empty-state" role="status">Loading assessment details...</p>}
      {detailError && <Notice type="error">{detailError}</Notice>}
      {detail && (
        <section className="panel assessment-detail">
          <div className="panel-heading">
            <div>
              <h2>{formatAssessmentTitle(detail)}</h2>
              <p className="muted">
                {detail.type || 'Type not set'} · {formatDate(detail.date)} · {detail.startTime}–{detail.endTime} · {detail.venue?.name || 'Unassigned venue'}
              </p>
            </div>
            <button className="button button-outline" type="button" onClick={onCloseDetail}>Close</button>
          </div>
          <div className="assessment-actions">
            {detail.status === 'cancelled' ? (
              <>
                <button className="button button-primary" type="button" onClick={restoreSelected} disabled={actionSaving}>
                  {actionSaving ? 'Restoring…' : 'Restore assessment'}
                </button>
                <button
                  className="button button-danger"
                  type="button"
                  disabled={actionSaving || students.length > 0}
                  title={students.length ? 'Assessments with attendance history cannot be permanently deleted.' : ''}
                  onClick={() => {
                    if (window.confirm('Permanently delete this assessment? This cannot be undone.')) deleteSelected()
                  }}
                >
                  Delete permanently
                </button>
              </>
            ) : (
              <>
                <button className="button button-outline" type="button" onClick={() => startEditing(detail)} disabled={actionSaving}>
                  Edit assessment
                </button>
                <button
                  className="button button-danger"
                  type="button"
                  disabled={actionSaving}
                  onClick={() => {
                    if (window.confirm('Cancel this assessment? It will be removed from student and invigilator schedules, but its attendance history will be kept.')) {
                      cancelSelected()
                    }
                  }}
                >
                  {actionSaving ? 'Cancelling…' : 'Cancel assessment'}
                </button>
                <button
                  className="button button-danger"
                  type="button"
                  disabled={actionSaving || students.length > 0}
                  title={students.length ? 'Assessments with attendance history cannot be permanently deleted.' : ''}
                  onClick={() => {
                    if (window.confirm('Permanently delete this assessment? This cannot be undone.')) deleteSelected()
                  }}
                >
                  Delete permanently
                </button>
              </>
            )}
          </div>
          <Notice type="error">{actionError}</Notice>
          <div className="detail-summary">
            <span><strong>{students.length}</strong> allocated</span>
            <span><strong>{students.filter((student) => student.checkedIn).length}</strong> checked in</span>
            <span><strong>{detail.status || 'Scheduled'}</strong> status</span>
          </div>
          <dl className="assessment-meta">
            <div><dt>Qualification</dt><dd>{detail.qualification || '—'} · Year {detail.qualificationYear || '—'}</dd></div>
                <div><dt>Module</dt><dd>{detail.moduleId?.name || detail.name || '—'}</dd></div>
            <div><dt>Assessment type</dt><dd>{detail.type || 'Type not set'}</dd></div>
            <div><dt>Lab</dt><dd>{detail.venue?.name || 'Unassigned venue'}</dd></div>
            <div><dt>Date and time</dt><dd>{formatDate(detail.date)} · {detail.startTime || '--:--'}–{detail.endTime || '--:--'}</dd></div>
          </dl>
          {detail.instructions && <p className="muted">{detail.instructions}</p>}
          <div className="assessment-map-heading">
            <div>
              <h3>Lab map · {detail.venue?.name || 'Venue'}</h3>
              <p className="muted">Seat status and allocation for this assessment.</p>
            </div>
            <div className="assessment-map-legend" aria-label="Lab map legend">
              <span><i className="map-dot vacant" />Vacant</span>
              <span><i className="map-dot allocated" />Allocated</span>
              <span><i className="map-dot checked-in" />Checked in</span>
              <span><i className="map-dot faulty" />Faulty</span>
            </div>
          </div>
          <div className="assessment-seat-grid">
            {mapSeats.map((seat) => {
              const allocation = allocationsBySeat.get(String(seat._id))
              const state = seat.condition === 'faulty'
                ? 'faulty'
                : allocation?.checkedIn
                  ? 'checked-in'
                  : allocation
                    ? 'allocated'
                    : 'vacant'
              return (
                <article className={`assessment-seat ${state}`} key={seat._id} title={allocation?.student.name || state}>
                  <strong>{seat.label}</strong>
                  <span>{state === 'checked-in' ? 'Checked in' : state === 'allocated' ? 'Allocated' : state === 'faulty' ? 'Faulty' : 'Vacant'}</span>
                  {allocation && <small>{allocation.student.name}</small>}
                </article>
              )
            })}
            {!mapSeats.length && <p className="empty-state">No seats are available for this lab.</p>}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Student number</th>
                  <th>Seat</th>
                  <th>Eligibility</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((allocation) => (
                  <tr key={allocation._id}>
                    <td className="strong-cell">{allocation.student.name}</td>
                    <td>{allocation.student.studentNumber}</td>
                    <td>{allocation.seat}</td>
                    <td>{allocation.student.eligibility}</td>
                    <td>{allocation.checkedIn ? 'Checked in' : 'Not checked in'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!students.length && <p className="empty-state">No seat allocations have been created for this assessment.</p>}
          </div>
        </section>
      )}
    </>
  )
}
