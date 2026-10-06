import { useState } from 'react'
import FormField from '../components/FormField.jsx'
import Notice from '../components/Notice.jsx'
import PageHeading from '../components/PageHeading.jsx'

export default function Assessments({ assessments, onCreate }) {
  const [notice, setNotice] = useState('')

  function submit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    onCreate({
      module: `${data.code} — ${data.name}`,
      date: new Date(`${data.date}T00:00:00`).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: `${data.startTime}–${data.endTime}`,
      location: data.location,
      students: Number(data.students),
      invigilator: data.invigilator,
      instructions: data.instructions,
    })
    setNotice(`Assessment scheduled for ${data.code} — ${data.name}.`)
    form.reset()
  }

  return (
    <>
      <PageHeading title="Create Assessment" subtitle="Schedule an assessment and provide its session details." />
      <div className="content-columns">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <h2>Assessment details</h2>
              <p className="muted">Fields marked with * are required.</p>
            </div>
          </div>
          <div className="form-grid two-col">
            <FormField label="Module code *">
              <input name="code" placeholder="e.g. ITSD200" required />
            </FormField>
            <FormField label="Assessment name *">
              <input name="name" placeholder="e.g. Systems Design" required />
            </FormField>
            <FormField label="Assessment date *">
              <input name="date" type="date" required />
            </FormField>
            <FormField label="Start time *">
              <input name="startTime" type="time" required />
            </FormField>
            <FormField label="End time *">
              <input name="endTime" type="time" required />
            </FormField>
            <FormField label="Venue / lab *">
              <select name="location" required>
                <option value="">Select a venue</option>
                <option>Lab 1</option>
                <option>Lab 2</option>
                <option>Lab 3</option>
                <option>Lab 4</option>
                <option>Exam Hall A</option>
              </select>
            </FormField>
            <FormField label="Enrolled students *">
              <input name="students" type="number" min="1" placeholder="e.g. 40" required />
            </FormField>
            <FormField label="Invigilator">
              <input name="invigilator" placeholder="Assign an invigilator" />
            </FormField>
            <FormField label="Instructions" className="full-span">
              <textarea
                name="instructions"
                rows="3"
                placeholder="Add notes or special instructions for this assessment"
              />
            </FormField>
          </div>
          <Notice>{notice}</Notice>
          <button className="button button-primary" type="submit">
            Create assessment <span aria-hidden="true">→</span>
          </button>
        </form>
        <section className="panel upcoming-panel">
          <div className="panel-heading">
            <div>
              <h2>Upcoming assessments</h2>
              <p className="muted">{assessments.length} scheduled sessions</p>
            </div>
          </div>
          <div className="upcoming-list">
            {assessments.map((assessment) => (
              <article className="upcoming-item" key={`${assessment.module}-${assessment.date}`}>
                <span className="date-tile">
                  {assessment.date.split(' ')[0]}
                  <small>{assessment.date.split(' ')[1]}</small>
                </span>
                <div>
                  <strong>{assessment.module}</strong>
                  <small>{assessment.time} · {assessment.location}</small>
                  <small>{assessment.students} students enrolled</small>
                </div>
                <span className="item-arrow">→</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
