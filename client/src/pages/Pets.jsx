import { useState } from 'react'
import { Link } from 'react-router-dom'
import { labelOf, formatWhen, ageOf } from '../format.js'

// The Pets page. Every pet in the household, with the add form and Remove.
//
// App owns the data and talks to the API. This page only owns what is on
// screen, meaning the form and whether it is open. onAdd and onRemove hand
// the work back to App.

// otherSpecies is only used when species is Other. On submit it replaces
// the word "Other", so the pet is saved as "Rabbit" and not "Other".
const EMPTY_PET = { name: '', birthdate: '', breed: '', species: 'Dog', otherSpecies: '', photo: '' }

// Local date, not toISOString, or the max is yesterday before 8am in PH.
const today = () => new Date().toLocaleDateString('en-CA')

// Phone photos are a few MB each. localStorage only holds about 5 MB in total,
// so shrink the photo to 400px and save it as a JPEG text string first.
function shrinkImage(file, size = 400) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      const scale = Math.min(1, size / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)

      const context = canvas.getContext('2d')
      context.fillStyle = '#fff'   // JPEG has no transparency, so no black corners
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)

      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image.'))
    }

    image.src = url
  })
}

export default function Pets({ status, slow, summary, onAdd, onRemove }) {
  const [petForm, setPetForm] = useState(EMPTY_PET)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoError, setPhotoError] = useState(null)

  async function handlePhoto(event) {
    const file = event.target.files[0]
    if (!file) return
    setPhotoError(null)
    try {
      const photo = await shrinkImage(file)
      // Functional update, since the user may have typed while this ran.
      setPetForm((previous) => ({ ...previous, photo }))
    } catch (caught) {
      setPhotoError(caught.message)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const species = petForm.species === 'Other'
      ? petForm.otherSpecies.trim()
      : petForm.species
    if (!petForm.name.trim() || !species) return

    setSaving(true)
    const added = await onAdd({
      name: petForm.name.trim(),
      species,
      breed: petForm.breed.trim(),
      birthdate: petForm.birthdate || null,   // optional, null instead of ''
      photo: petForm.photo,
    })
    setSaving(false)

    // Only clear the form if it worked, so nothing typed is lost on a failure.
    if (added) {
      setPetForm(EMPTY_PET)
      setShowForm(false)
    }
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
        <form onSubmit={handleSubmit} className="card form">
          <div className="fields">
            <p className="field">
              <label htmlFor="pet-name">Name</label>
              <input
                id="pet-name"
                value={petForm.name}
                onChange={(event) => setPetForm({ ...petForm, name: event.target.value })}
                maxLength={80}
                required
              />
            </p>

            <p className="field">
              <label htmlFor="pet-birthdate">Birthday, optional</label>
              <input
                id="pet-birthdate"
                type="date"
                value={petForm.birthdate}
                max={today()}
                onChange={(event) => setPetForm({ ...petForm, birthdate: event.target.value })}
              />
            </p>

            <p className="field">
              <label htmlFor="pet-breed">Breed, optional</label>
              <input
                id="pet-breed"
                value={petForm.breed}
                onChange={(event) => setPetForm({ ...petForm, breed: event.target.value })}
                maxLength={80}
              />
            </p>

            <p className="field">
              <label htmlFor="pet-species">Type of pet</label>
              <select
                id="pet-species"
                value={petForm.species}
                onChange={(event) => setPetForm({ ...petForm, species: event.target.value })}
              >
                <option>Dog</option>
                <option>Cat</option>
                <option>Other</option>
              </select>
            </p>

            {/* Only shows when Other is picked, so Dog and Cat stay one click. */}
            {petForm.species === 'Other' && (
              <p className="field">
                <label htmlFor="pet-other">What kind of pet</label>
                <input
                  id="pet-other"
                  value={petForm.otherSpecies}
                  onChange={(event) => setPetForm({ ...petForm, otherSpecies: event.target.value })}
                  placeholder="Rabbit, bird, fish..."
                  maxLength={40}
                  required
                />
              </p>
            )}

            <p className="field">
              <label htmlFor="pet-photo">Photo, optional</label>
              <input id="pet-photo" type="file" accept="image/*" onChange={handlePhoto} />
              {photoError && <span className="field-error">{photoError}</span>}
            </p>
          </div>

          {petForm.photo && (
            <img className="photo-preview" src={petForm.photo} alt={`Preview of ${petForm.name || 'the pet'}`} />
          )}

          <p className="actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Add pet'}
            </button>
          </p>
        </form>
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