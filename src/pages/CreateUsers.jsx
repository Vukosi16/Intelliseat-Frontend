import { useState } from 'react'
import FormField from '../components/FormField.jsx'
import Notice from '../components/Notice.jsx'
import PageHeading from '../components/PageHeading.jsx'

const emptyForm = {
  firstName: '',
  lastName: '',
  number: '',
  email: '',
  course: 'Diploma in IT',
  year: 'Year 1',
  clearance: 'Cleared',
  department: '',
  phone: '',
}

export default function CreateUsers({ onCreate }) {
  const [role, setRole] = useState('Student')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState(emptyForm)

  function update(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  function submit(event) {
    event.preventDefault()
    onCreate({
      ...form,
      role,
      name: `${form.firstName} ${form.lastName}`,
      eligible: form.clearance === 'Cleared',
    })
    setNotice(`${role} account created for ${form.firstName} ${form.lastName}.`)
    setForm(emptyForm)
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
              name="number"
              placeholder={role === 'Student' ? '402568464' : 'INV-XXXXX'}
              value={form.number}
              onChange={update}
              required
            />
          </FormField>
          <FormField label="Institutional email">
            <input
              name="email"
              type="email"
              placeholder="name@richfield.ac.za"
              value={form.email}
              onChange={update}
              required
            />
          </FormField>
          {role === 'Student' ? (
            <>
              <FormField label="Course">
                <select name="course" value={form.course} onChange={update}>
                  <option>Diploma in IT</option>
                  <option>Diploma in Networking</option>
                  <option>Higher Certificate in IT</option>
                  <option>Bachelor of IT</option>
                </select>
              </FormField>
              <FormField label="Year">
                <select name="year" value={form.year} onChange={update}>
                  <option>Year 1</option>
                  <option>Year 2</option>
                  <option>Year 3</option>
                  <option>Year 4</option>
                </select>
              </FormField>
              <FormField label="Financial clearance" className="full-span">
                <select name="clearance" value={form.clearance} onChange={update}>
                  <option>Cleared</option>
                  <option>Outstanding fees</option>
                  <option>Documents pending</option>
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
        <div className="form-actions">
          <button className="button button-primary" type="submit">Create {role.toLowerCase()} account</button>
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
