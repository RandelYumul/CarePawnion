import { useState } from 'react'

// The pet form, used by the Pets page to add a pet and by the Pet details
// page to edit one. Both need the same fields, so they share this instead of
// keeping two copies.
//
// It owns what is typed. The finished pet goes back through onSubmit, and the
// page decides what happens after, like closing the form. pet is only passed
// when editing, and fills in the fields.

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

// A saved pet back into form fields. Anything that is not Dog or Cat came
// from the Other box, so it goes back there. null becomes '' for the inputs.
function toForm(pet) {
  if (!pet) return EMPTY_PET
  const known = pet.species === 'Dog' || pet.species === 'Cat'
  return {
    name: pet.name,
    birthdate: pet.birthdate ?? '',
    breed: pet.breed ?? '',
    species: known ? pet.species : 'Other',
    otherSpecies: known ? '' : pet.species,
    photo: pet.photo ?? '',
  }
}

export default function PetForm({ pet, submitLabel, onSubmit, onCancel }) {
  const [petForm, setPetForm] = useState(() => toForm(pet))
  const [saving, setSaving] = useState(false)
  const [photoError, setPhotoError] = useState(null)

  // Only when editing. Nothing changed means nothing to save, so the
  // button stays off instead of sending the same pet back.
  const unchanged = Boolean(pet) && JSON.stringify(petForm) === JSON.stringify(toForm(pet))

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
    if (unchanged || !petForm.name.trim() || !species) return

    setSaving(true)
    await onSubmit({
      name: petForm.name.trim(),
      species,
      breed: petForm.breed.trim(),
      birthdate: petForm.birthdate || null,   // optional, null instead of ''
      photo: petForm.photo,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="card form">
      <div className="fields">
        <p className="field">
          <label htmlFor="pet-name">Name</label>
          <input
            id="pet-name"
            value={petForm.name}
            onChange={(event) => setPetForm({ ...petForm, name: event.target.value })}
            maxLength={60}
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
            maxLength={60}
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
        <button type="submit" disabled={saving || unchanged}>
          {saving ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>Cancel</button>
        )}
      </p>
    </form>
  )
}