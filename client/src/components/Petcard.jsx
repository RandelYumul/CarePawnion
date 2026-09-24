// One pet on the status board. The photo is the whole top of the card, the
// beige block underneath holds the name, the type, breed and age, and the two
// quick log buttons.
//
// The card owns no state. Everything it shows comes from props, and the two
// buttons hand the work back to whoever rendered it. That keeps createLog in
// one place instead of in every card.
//
// Each button is green if it was done within the limit in format.js, and red
// if the pet is due. The time ago is also written out, so the colour is not
// the only thing saying it.

import { LIMITS, isDue, timeAgo, ageOf } from '../format.js'

export default function PetCard({ pet, onLog, onView, busy = false, now = new Date() }) {
  const fedDue = isDue(pet.lastFed?.happened_at, LIMITS.fed, now)
  const outDue = isDue(pet.lastOut?.happened_at, LIMITS.out, now)
  const age = ageOf(pet.birthdate, now)

  return (
    <article className="pet-card">
      {/* Photos are decorative here, the name right below says who it is,
          so alt stays empty rather than repeating it to a screen reader. */}
      {pet.photo
        ? <img className="pet-photo" src={pet.photo} alt="" />
        : <div className="pet-photo pet-photo-empty" aria-hidden="true">🐾</div>}

      <div className="pet-body">
        <h2 className="pet-name">{pet.name}</h2>

        <dl className="pet-meta">
          <dt>Type</dt><dd>{pet.species}</dd>
          {pet.breed && (<><dt>Breed</dt><dd>{pet.breed}</dd></>)}
          {age && (<><dt>Age</dt><dd>{age}</dd></>)}
          <dt>Fed</dt>
          <dd>{pet.lastFed ? timeAgo(pet.lastFed.happened_at, now) : 'Not yet'}</dd>
          <dt>Out</dt>
          <dd>{pet.lastOut ? timeAgo(pet.lastOut.happened_at, now) : 'Not yet'}</dd>
        </dl>

        <div className="pet-actions">
          {/* One tap logs it. No form, no typing, because the whole point is
              to record it before you walk away and forget. */}
          <button
            className={`chip ${fedDue ? 'chip-due' : 'chip-ok'}`}
            title={fedDue ? `Due, over ${LIMITS.fed} hours since last fed` : 'Fed recently'}
            onClick={() => onLog(pet, 'fed')}
            disabled={busy}
          >
            Fed
          </button>

          <button
            className={`chip ${outDue ? 'chip-due' : 'chip-ok'}`}
            title={outDue ? `Due, over ${LIMITS.out} hours since last out` : 'Out recently'}
            onClick={() => onLog(pet, 'poop')}
            disabled={busy}
          >
            Bathroom
          </button>

          <button className="pet-link" onClick={() => onView(pet)}>
            View Details »
          </button>
        </div>
      </div>
    </article>
  )
}