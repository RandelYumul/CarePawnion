import { useState } from 'react'
import { Link } from 'react-router-dom'
import { labelOf, formatWhen, ageOf } from '../format.js'
import PetForm from '../components/Petform.jsx'

// The Pets page. Every pet in the household, with the add form and Remove.
//
// App owns the data and talks to the API. This page only owns whether the
// add form is open. The form itself is PetForm. onAdd and onRemove hand the
// work back to App.

export default function Pets({ status, slow, summary, onAdd, onRemove }) {
  const [showForm, setShowForm] = useState(false)

  // Close the form only if it worked, so nothing typed is lost on a failure.
  async function handleAdd(input) {
    const added = await onAdd(input)
    if (added) setShowForm(false)
  }

  return (
    <section className="content">
      <div className="page-head">
        <h1>Pets</h1>
        {status === 'ready' && (
          <button className="ghost" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add a pet'}
          </button>
        )}
      </div>

      {showForm && (
        <PetForm submitLabel="Add pet" onSubmit={handleAdd} />
      )}

      {status === 'loading' && (
        <p className="muted">
          Loading{slow ? '. The server may be waking up, which can take up to a minute.' : '...'}
        </p>
      )}

      {status === 'ready' && summary.length === 0 && (
        <p className="muted">No pets yet. Add one before you can log anything.</p>
      )}

      {status === 'ready' && summary.length > 0 && (
        <div className="pet-list">
          {summary.map((pet) => (
            <article key={pet.id} className="card pet-item">
              {/* Same as the pet card, a paw when there is no photo. */}
              {pet.photo
                ? <img className="pet-thumb" src={pet.photo} alt="" />
                : <div className="pet-thumb pet-photo-empty" aria-hidden="true">🐾</div>}

              <h2><Link to={`/pets/${pet.id}`} className="pet-title-link">{pet.name}</Link></h2>
              {/* Skips whatever is empty, so a pet with no breed or birthday
                  does not show stray commas. */}
              <p className="species">
                {[pet.species, pet.breed, ageOf(pet.birthdate)].filter(Boolean).join(', ')}
              </p>

              <dl>
                <dt>Last fed</dt>
                <dd>
                  {pet.lastFed
                    ? <>{formatWhen(pet.lastFed.happened_at)} <span className="by">by {pet.lastFed.member}</span></>
                    : <span className="muted">No record yet</span>}
                </dd>
                <dt>Last out</dt>
                <dd>
                  {pet.lastOut
                    ? <>{labelOf(pet.lastOut.type)}, {formatWhen(pet.lastOut.happened_at)} <span className="by">by {pet.lastOut.member}</span></>
                    : <span className="muted">No record yet</span>}
                </dd>
              </dl>

              <div className="pet-item-actions">
                <button className="ghost danger" onClick={() => onRemove(pet)}>Remove</button>
                <Link to={`/pets/${pet.id}`} className="pet-link">View Details »</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}