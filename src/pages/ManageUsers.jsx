import { useMemo, useState } from 'react'
import PageHeading from '../components/PageHeading.jsx'
import { labelFor } from '../statusLabels.js'
import { canonicalQualification } from '../qualificationCatalog.js'

function fullName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

export default function ManageUsers({ users, onUpdate, onResetPassword, onReactivate, onDelete, qualifications = [] }) {
  const [role, setRole] = useState('student')
  const [search, setSearch] = useState('')
  const [qualificationFilter, setQualificationFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [editing, setEditing] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' })
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const qualificationOptions = [...new Set([
    ...qualifications.map((qualification) => qualification.name),
    ...users.filter((user) => user.role === 'student').map((user) => user.course),
  ].filter(Boolean).map(canonicalQualification))]
  const selectedQualification = qualifications.find((qualification) => qualification.name === qualificationFilter)
  const selectedQualificationYears = users
    .filter((user) => user.role === 'student' && canonicalQualification(user.course) === qualificationFilter)
    .map((user) => Number(user.year))
    .filter(Number.isInteger)
  const selectedQualificationYearCount = Math.max(
    Number(selectedQualification?.years) || 0,
    ...selectedQualificationYears,
  )
  const selectedQualificationHasMultipleYears = selectedQualificationYearCount > 1
  const availableYears = Array.from({ length: selectedQualificationYearCount }, (_, index) => index + 1)

  const visibleUsers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return users
      .filter((user) => user.role === role)
      .filter((user) => role !== 'student' || qualificationFilter === 'all' || canonicalQualification(user.course) === qualificationFilter)
      .filter((user) => role !== 'student' || qualificationFilter === 'all' || !selectedQualificationHasMultipleYears || yearFilter === 'all' || String(user.year) === yearFilter)
      .filter((user) => !query || [
        fullName(user),
        user.email,
        user.studentNumber,
        user.staffNumber,
        user.course,
        user.department,
      ].some((value) => String(value || '').toLowerCase().includes(query)))
      .sort((first, second) => {
        if (role === 'student') {
          const qualificationOrder = canonicalQualification(first.course).localeCompare(canonicalQualification(second.course))
          if (qualificationOrder) return qualificationOrder
          const yearOrder = Number(first.year || 0) - Number(second.year || 0)
          if (yearOrder) return yearOrder
        }
        return fullName(first).localeCompare(fullName(second))
      })
  }, [qualificationFilter, role, search, selectedQualificationHasMultipleYears, users, yearFilter])
  const groupedUsers = role === 'student'
    ? visibleUsers.reduce((groups, user) => {
      const qualification = canonicalQualification(user.course) || 'Unknown qualification'
      const key = `${qualification}-${user.year || 'unknown'}`
      const lastGroup = groups[groups.length - 1]
      if (lastGroup?.key === key) lastGroup.users.push(user)
      else groups.push({ key, qualification, year: user.year || 'Unknown year', users: [user] })
      return groups
    }, [])
    : [{ key: 'all', users: visibleUsers }]
  const editQualifications = editForm.course && !qualifications.some((qualification) => qualification.name === editForm.course)
    ? [...qualifications, { name: editForm.course, years: 4 }]
    : qualifications
  const editYearCount = editQualifications.find((qualification) => qualification.name === editForm.course)?.years || 0

  function changeRole(nextRole) {
    setRole(nextRole)
    setSelected(null)
    setSearch('')
    setQualificationFilter('all')
    setYearFilter('all')
    setEditing(false)
  }

  function startEditing() {
    setEditForm({
      firstName: selected.firstName || '',
      lastName: selected.lastName || '',
      email: selected.email || '',
      studentNumber: selected.studentNumber || '',
      course: selected.course || '',
      year: selected.year || '',
      staffNumber: selected.staffNumber || '',
      department: selected.department || '',
      phone: selected.phone || '',
      clearanceStatus: selected.clearanceStatus || 'cleared',
      eligibility: selected.eligibility || 'needs_review',
      eligibilityReason: selected.eligibilityReason || '',
    })
    setError('')
    setNotice('')
    setEditing(true)
  }

  function startPasswordReset() {
    setPasswordForm({ password: '', confirmPassword: '' })
    setError('')
    setNotice('')
    setResettingPassword(true)
  }

  async function savePassword(event) {
    event.preventDefault()
    if (passwordForm.password.length < 8 || passwordForm.password.length > 72 || !/[A-Za-z]/.test(passwordForm.password) || !/\d/.test(passwordForm.password)) {
      setError('Use 8-72 characters with at least one letter and one number.')
      return
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await onResetPassword(selected._id, passwordForm.password)
      setPasswordForm({ password: '', confirmPassword: '' })
      setResettingPassword(false)
      setNotice('Password updated. The user can sign in with the new password.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const changes = selected.role === 'student'
        ? {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          studentNumber: editForm.studentNumber,
          course: editForm.course,
          year: Number(editForm.year),
          clearanceStatus: editForm.clearanceStatus,
          eligibility: editForm.eligibility,
          eligibilityReason: editForm.eligibilityReason,
        }
        : {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          email: editForm.email,
          staffNumber: editForm.staffNumber,
          department: editForm.department,
          phone: editForm.phone,
        }
      const updated = await onUpdate(selected._id, changes)
      setSelected(updated)
      setEditing(false)
      setNotice('User details updated.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteUser(mode) {
    const confirmation = mode === 'hard'
      ? `Permanently delete ${fullName(selected)} and their linked enrollments, attendance, issues, and related data? This cannot be undone.`
      : `Make ${fullName(selected)} inactive? They will no longer be able to sign in, and you can reactivate them later.`
    if (!window.confirm(confirmation)) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const updated = await onDelete(selected._id, mode)
      if (mode === 'hard') {
        setSelected(null)
        setNotice('User and linked data were permanently deleted.')
      } else {
        setSelected(updated)
        setNotice('User is inactive. You can reactivate them later.')
      }
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function reactivate() {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const updated = await onReactivate(selected._id)
      setSelected(updated)
      setNotice('User reactivated and can sign in again.')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeading
        title="Manage Users"
        subtitle="Search student and invigilator accounts and review their profile details."
      />
      {notice && !selected && <p className="notice" role="status">{notice}</p>}
      <section className="panel">
        <div className="toolbar user-toolbar">
          <div className="tabs" role="tablist" aria-label="User type">
            <button type="button" role="tab" aria-selected={role === 'student'} className={role === 'student' ? 'selected' : ''} onClick={() => changeRole('student')}>
              Students
            </button>
            <button type="button" role="tab" aria-selected={role === 'invigilator'} className={role === 'invigilator' ? 'selected' : ''} onClick={() => changeRole('invigilator')}>
              Invigilators
            </button>
          </div>
          {role === 'student' && (
            <div className="user-group-filters" aria-label="Group students">
              <label className="user-filter">
                <span>Qualification</span>
                <select
                  aria-label="Filter students by qualification"
                  value={qualificationFilter}
                  onChange={(event) => {
                    setQualificationFilter(event.target.value)
                    setYearFilter('all')
                  }}
                >
                  <option value="all">All qualifications</option>
                  {qualificationOptions.map((qualification) => (
                    <option value={qualification} key={qualification}>{qualification}</option>
                  ))}
                </select>
              </label>
              {qualificationFilter !== 'all' && selectedQualificationHasMultipleYears && (
                <label className="user-filter">
                  <span>Year</span>
                  <select aria-label="Filter students by year" value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
                    <option value="all">All years</option>
                    {availableYears.map((year) => <option value={year} key={year}>Year {year}</option>)}
                  </select>
                </label>
              )}
            </div>
          )}
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${role}s`} aria-label={`Search ${role}s`} />
          </label>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>{role === 'student' ? 'Student number' : 'Staff number'}</th>
                <th>Email</th>
                {role === 'student' && <th>Year</th>}
                <th>{role === 'student' ? 'Qualification' : 'Department'}</th>
                <th>Status</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {groupedUsers.flatMap((group) => [
                ...(role === 'student' ? [(
                  <tr className="user-group-row" key={`group-${group.key}`}>
                    <td colSpan={role === 'student' ? 7 : 6}>
                      {group.qualification} · Year {group.year}
                      <span>{group.users.length} student{group.users.length === 1 ? '' : 's'}</span>
                    </td>
                  </tr>
                )] : []),
                ...group.users.map((user) => (
                <tr key={user._id}>
                  <td className="strong-cell">{fullName(user)}</td>
                  <td>{role === 'student' ? user.studentNumber || '—' : user.staffNumber || '—'}</td>
                  <td>{user.email}</td>
                  {role === 'student' && <td>Year {user.year || '—'}</td>}
                  <td>{role === 'student' ? user.course || '—' : user.department || '—'}</td>
                  <td><span className={`badge ${user.isActive === false ? 'badge-red' : 'badge-green'}`}>{user.isActive === false ? 'Inactive' : 'Active'}</span></td>
                  <td><button type="button" className="table-action" onClick={() => setSelected(user)}>Details</button></td>
                </tr>
                )),
              ])}
            </tbody>
          </table>
          {!visibleUsers.length && <p className="empty-state">No {role}s match this search.</p>}
        </div>
      </section>
      {selected && (
        <section className="panel user-detail">
          <div className="panel-heading">
            <div>
              <h2>{fullName(selected)}</h2>
              <p className="muted">{selected.email}</p>
            </div>
            <div className="form-actions">
              <button type="button" className="button button-outline" onClick={() => setSelected(null)}>Close</button>
              {!editing && selected.isActive !== false && <button type="button" className="button button-primary" onClick={startEditing}>Edit</button>}
              {!editing && !resettingPassword && <button type="button" className="button button-outline" onClick={startPasswordReset}>Set new password</button>}
              {!editing && selected.isActive !== false && <button type="button" className="button button-outline" onClick={() => deleteUser('inactive')} disabled={saving}>Make inactive</button>}
              {!editing && selected.isActive === false && <button type="button" className="button button-primary" onClick={reactivate} disabled={saving}>{saving ? 'Reactivating…' : 'Reactivate'}</button>}
              {!editing && <button type="button" className="button button-red" onClick={() => deleteUser('hard')} disabled={saving}>Hard delete</button>}
            </div>
          </div>
          {error && <p className="notice notice-error" role="alert">{error}</p>}
          {editing ? (
            <form className="form-grid two-col" onSubmit={saveEdit}>
              <label className="field"><span>First name</span><input value={editForm.firstName} onChange={(event) => setEditForm({ ...editForm, firstName: event.target.value })} required /></label>
              <label className="field"><span>Last name</span><input value={editForm.lastName} onChange={(event) => setEditForm({ ...editForm, lastName: event.target.value })} required /></label>
              <label className="field"><span>Email</span><input type="email" value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} required /></label>
              {selected.role === 'student' ? (
                <>
                  <label className="field"><span>Student number</span><input value={editForm.studentNumber} onChange={(event) => setEditForm({ ...editForm, studentNumber: event.target.value })} required /></label>
                  <label className="field"><span>Qualification</span><select value={editForm.course} onChange={(event) => setEditForm({ ...editForm, course: event.target.value, year: '1' })} required>{editQualifications.map((qualification) => <option key={qualification.name} value={qualification.name}>{qualification.name}</option>)}</select></label>
                  <label className="field"><span>Year</span><select value={editForm.year} onChange={(event) => setEditForm({ ...editForm, year: event.target.value })} required>{Array.from({ length: editYearCount }, (_, index) => index + 1).map((year) => <option key={year} value={year}>Year {year}</option>)}</select></label>
                  <label className="field"><span>Financial clearance</span><select value={editForm.clearanceStatus} onChange={(event) => setEditForm({ ...editForm, clearanceStatus: event.target.value })}><option value="cleared">Cleared</option><option value="outstanding_fees">Outstanding fees</option><option value="documents_pending">Documents pending</option></select></label>
                  <label className="field"><span>Eligibility</span><select value={editForm.eligibility} onChange={(event) => setEditForm({ ...editForm, eligibility: event.target.value })}><option value="eligible">Eligible</option><option value="needs_review">Needs review</option></select></label>
                  <label className="field"><span>Eligibility reason</span><input value={editForm.eligibilityReason} onChange={(event) => setEditForm({ ...editForm, eligibilityReason: event.target.value })} placeholder="Optional review note" /></label>
                </>
              ) : (
                <>
                  <label className="field"><span>Staff number</span><input value={editForm.staffNumber} onChange={(event) => setEditForm({ ...editForm, staffNumber: event.target.value })} required /></label>
                  <label className="field"><span>Department</span><input value={editForm.department} onChange={(event) => setEditForm({ ...editForm, department: event.target.value })} required /></label>
                  <label className="field"><span>Phone</span><input value={editForm.phone} onChange={(event) => setEditForm({ ...editForm, phone: event.target.value })} required /></label>
                </>
              )}
              <div className="form-actions full-span">
                <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                <button className="button button-outline" type="button" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : resettingPassword ? (
            <form className="form-grid two-col" onSubmit={savePassword}>
              <p className="muted full-span">The current password cannot be viewed. Set a new password for this account.</p>
              <label className="field"><span>New password</span><input type="password" value={passwordForm.password} onChange={(event) => setPasswordForm({ ...passwordForm, password: event.target.value })} autoComplete="new-password" required /></label>
              <label className="field"><span>Confirm new password</span><input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} autoComplete="new-password" required /></label>
              <div className="form-actions full-span">
                <button className="button button-primary" type="submit" disabled={saving}>{saving ? 'Updating…' : 'Update password'}</button>
                <button className="button button-outline" type="button" onClick={() => setResettingPassword(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <div className="detail-summary">
                <span>Role <strong>{labelFor('role', selected.role) || selected.role}</strong></span>
                <span>Status <strong>{selected.isActive === false ? 'Inactive' : 'Active'}</strong></span>
                {selected.role === 'student' && <span>Eligibility <strong>{selected.eligibility || 'Not assessed'}</strong></span>}
              </div>
              <dl className="user-detail-grid">
                <div><dt>First name</dt><dd>{selected.firstName || '—'}</dd></div>
                <div><dt>Last name</dt><dd>{selected.lastName || '—'}</dd></div>
                <div><dt>Phone</dt><dd>{selected.phone || '—'}</dd></div>
                <div><dt>{selected.role === 'student' ? 'Student number' : 'Staff number'}</dt><dd>{selected.studentNumber || selected.staffNumber || '—'}</dd></div>
                <div><dt>{selected.role === 'student' ? 'Course' : 'Department'}</dt><dd>{selected.course || selected.department || '—'}</dd></div>
                <div><dt>{selected.role === 'student' ? 'Year' : 'Account created'}</dt><dd>{selected.year || (selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : '—')}</dd></div>
              </dl>
            </>
          )}
        </section>
      )}
    </>
  )
}
