import { useState } from 'react'
import Notice from '../components/Notice.jsx'
import PageHeading from '../components/PageHeading.jsx'

export default function Venues({ venues, seats, selectedVenue, loading, error, onSelect, onConditionChange }) {
  const [conditionError, setConditionError] = useState('')
  const [savingSeat, setSavingSeat] = useState('')

  async function updateCondition(seat, condition) {
    setSavingSeat(seat._id)
    setConditionError('')
    try {
      await onConditionChange(seat._id, condition)
    } catch (requestError) {
      setConditionError(requestError.message)
    } finally {
      setSavingSeat('')
    }
  }

  return (
    <>
      <PageHeading title="Venues and Seats" subtitle="Labs 1–5 each have 50 seats. Review workstation conditions here." />
      {error && <Notice type="error">{error}</Notice>}
      {conditionError && <Notice type="error">{conditionError}</Notice>}
      <div className="content-columns venue-layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Venues</h2>
              <p className="muted">{venues.length} labs available</p>
            </div>
          </div>
          <div className="venue-list">
            {venues.map((venue) => (
              <button type="button" className={`venue-item ${selectedVenue?._id === venue._id ? 'selected' : ''}`} key={venue._id} onClick={() => onSelect(venue)}>
                <span>
                  <strong>{venue.name}</strong>
                  <small>50 seats</small>
                </span>
                <span>→</span>
              </button>
            ))}
            {!venues.length && <p className="empty-state">No labs are available.</p>}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{selectedVenue ? selectedVenue.name : 'Select a venue'}</h2>
              <p className="muted">{selectedVenue ? `${seats.length} seats loaded` : 'Choose a venue to view its seat layout.'}</p>
            </div>
          </div>
          {loading && <p className="empty-state" role="status">Loading seats...</p>}
          {selectedVenue && !loading && (
            <div className="seat-grid">
              {seats.map((seat) => (
                <article className={`seat-card ${seat.condition}`} key={seat._id}>
                  <strong>{seat.label}</strong>
                  <span>{seat.condition === 'faulty' ? 'Faulty' : 'Working'}</span>
                  <select aria-label={`Condition for ${seat.label}`} value={seat.condition} disabled={savingSeat === seat._id} onChange={(event) => updateCondition(seat, event.target.value)}>
                    <option value="working">Working</option>
                    <option value="faulty">Faulty</option>
                  </select>
                  {seat.condition === 'faulty' && seat.faultyReason && <small>{seat.faultyReason}</small>}
                </article>
              ))}
              {!seats.length && <p className="empty-state">No seats are configured for this venue.</p>}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
