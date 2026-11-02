import { useState } from 'react'
import FormField from '../components/FormField.jsx'
import Notice from '../components/Notice.jsx'
import PageHeading from '../components/PageHeading.jsx'

const emptyForm = {
  firstName: '',
  lastName: '',
  studentNumber: '',
  staffNumber: '',
  email: '',
  course: '',
  year: '1',
  clearanceStatus: 'cleared',
  department: '',
  phone: '',
}

export default function CreateUsers({ onCreate, qualifications = [] }) {
  const [role, setRole] = useState('Student')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const selectedCourse = form.course || qualifications[0]?.name || ''
  const selectedQualification = qualifications.find((qualification) => qualification.name === selectedCourse)

  function update(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
      ...(name === 'course' ? { year: '1' } : {}),
    }))
    setError('')
    setNotice('')
  }

  async function submit(event) {
    event.preventDefault()
    const number = role === 'Student' ? form.studentNumber : form.staffNumber
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last names are required.')
      return
    }
    const validNumber = role === 'Student' ? /^\d{9}$/.test(number) : /^INV-\d+$/.test(number)
    if (!validNumber) {
      setError(role === 'Student' ? 'Student number must contain exactly 9 digits.' : 'Staff number must start with INV- followed by digits.')
      return
    }
    const isInstitutionalEmail = /^[^\s@]+@my\.richfield\.ac\.za$/i.test(form.email.trim())
    if (!isInstitutionalEmail && role !== 'Invigilator') {
      setError('Use an institutional @my.richfield.ac.za email address.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const result = await onCreate({
        firstName: form.firstName,
        lastName: form.lastName,
        ...(role === 'Student'
          ? { studentNumber: form.studentNumber, course: selectedCourse, year: Number(form.year), clearanceStatus: form.clearanceStatus }
          : { staffNumber: form.staffNumber, department: form.department, phone: form.phone }),
        email: form.email.trim().toLowerCase(),
        role: role.toLowerCase(),
      })
      setNotice(result?.inviteEmail === 'failed'
        ? 'User created, but the invitation email could not be sent. Please resend it.'
        : `Invitation sent to ${form.email}.`)
      setForm(emptyForm)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function clearForm() {
    setForm(emptyForm)
    setNotice('')
  }

  return (
    <>
      <PageHeading title="Create Users" subtitle="Register a new student or invigilator account." />
      <form className="panel form-panel" onSubmit={submit}>
        <div className="tabs" role="tablist" aria-label="Account type">
          {['Student', 'Invigilator'].map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={role === item}
              className={role === item ? 'selected' : ''}
              onClick={() => { setRole(item); setNotice('') }}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="form-grid two-col">
          <FormField label="First name">
            <input
              name="firstName"
              placeholder="e.g. Evril"
              value={form.firstName}
              onChange={update}
              required
            />
          </FormField>
          <FormField label="Last name">
            <input
              name="lastName"
              placeholder="e.g. Makhavhani"
              value={form.lastName}
              onChange={update}
              required
            />
          </FormField>
          <FormField label={role === 'Student' ? 'Student number' : 'Staff number'}>
            <input
              name={role === 'Student' ? 'studentNumber' : 'staffNumber'}
              placeholder={role === 'Student' ? '402568464' : 'INV-XXXXX'}
              value={role === 'Student' ? form.studentNumber : form.staffNumber}
              onChange={update}
              required
            />
          </FormField>
          <FormField label={role === 'Student' ? 'Institutional email' : 'Email'}>
            <input
              name="email"
              type="email"
              placeholder={role === 'Student'
                ? 'studentnumber@my.richfield.ac.za'
                : 'invigilator@example.com'}
              value={form.email}
              onChange={update}
              required
            />
          </FormField>
          {role === 'Student' ? (
            <>
              <FormField label="Qualification">
                <select name="course" value={selectedCourse} onChange={update} required>
                  <option value="">Select a qualification</option>
                  {qualifications.map((qualification) => (
                    <option key={qualification.name} value={qualification.name}>{qualification.name}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Year">
                <select name="year" value={form.year} onChange={update} required>
                  {Array.from(
                    { length: selectedQualification?.years || 0 },
                    (_, index) => index + 1
                  ).map((year) => <option key={year} value={year}>Year {year}</option>)}
                </select>
              </FormField>
              <FormField label="Financial clearance" className="full-span">
                <select name="clearanceStatus" value={form.clearanceStatus} onChange={update}>
                  <option value="cleared">Cleared</option>
                  <option value="outstanding_fees">Outstanding fees</option>
                  <option value="documents_pending">Documents pending</option>
                </select>
              </FormField>
            </>
          ) : (
            <>
              <FormField label="Department">
                <input
                  name="department"
                  placeholder="e.g. Information Technology"
                  value={form.department}
                  onChange={update}
                  required
                />
              </FormField>
              <FormField label="Contact number">
                <input
                  name="phone"
                  type="tel"
                  placeholder="+27 00 000 0000"
                  value={form.phone}
                  onChange={update}
                  required
                />
              </FormField>
            </>
          )}
        </div>
        <Notice>{notice}</Notice>
        <Notice type="error">{error}</Notice>
        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? 'Sending invitation…' : `Create ${role.toLowerCase()} account`}
          </button>
          <button
            className="button button-outline"
            type="reset"
            onClick={clearForm}
          >
            Clear form
          </button>
        </div>
      </form>
    </>
  )
}
