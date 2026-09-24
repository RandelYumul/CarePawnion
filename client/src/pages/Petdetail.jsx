import { Link, useParams } from 'react-router-dom'
import { labelOf, formatWhen, ageOf } from '../format.js'

// One pet on its own page. The first box is the photo and info, and the list
// below is every log for this pet.
//
// Like the other pages, it owns no data. summary and rows come from App, so
// a log added on the Logs page shows up here without loading anything again.
// There is no getPet yet, so the pet is found in the list App already has.

// '2021-03-14' to "Mar 14, 2021". Split by hand for the same timezone reason
// as ageOf in format.js.
function formatBirthday(birthdate) {
  const [year, month, day] = String(birthdate).slice(0, 10).split('-').map(Number)
  if (!year || !month || !day) return 'Unknown'
  return new Date(year, month - 1, day).toLocaleDateString([], { dateStyle: 'medium' })
}

export default function PetDetail({ status, slow, summary, rows }) {
  const { id } = useParams()

  // The id in the URL is always a string, the seed ids might not be.
  const pet = summary.find((item) => String(item.id) === id)

  // Logs keep the pet name, not the id, so match by name.
  // rows arrives newest first, so this list does too.
  const logs = pet ? rows.filter((row) => row.pet === pet.name) : []

  if (status === 'loading') {
    return (
      <section className="content">
        <p className="muted">
          Loading{slow ? '. The server may be waking up, which can take up to a minute.' : '...'}
        </p>
      </section>
    )
  }

  // App already shows the error message, so only the back link here.
  if (status === 'error') {
    return (
      <section className="content">
        <Link to="/pets" className="back-link">« Back to pets</Link>
      </section>
    )
  }

  if (!pet) {
    return (
      <section className="content">
        <Link to="/pets" className="back-link">« Back to pets</Link>
        <p className="muted">This pet was not found. It may have been removed.</p>
      </section>
    )
  }

  const age = ageOf(pet.birthdate)

  return (
    <section className="content">
      <Link to="/pets" className="back-link">« Back to pets</Link>

      <article className="card pet-profile">
        {pet.photo
          ? <img className="pet-profile-photo" src={pet.photo} alt="" />
          : <div className="pet-profile-photo pet-photo-empty" aria-hidden="true">🐾</div>}

        <div className="pet-profile-info">
          <h1>{pet.name}</h1>

          <dl className="detail-list">
            <dt>Type</dt><dd>{pet.species}</dd>
            <dt>Breed</dt><dd>{pet.breed || <span className="muted">Not given</span>}</dd>
            <dt>Birthday</dt>
            <dd>
              {pet.birthdate
                ? <>{formatBirthday(pet.birthdate)}{age && <span className="by">, {age} old</span>}</>
                : <span className="muted">Not given</span>}
            </dd>
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
            <dt>Total logs</dt><dd>{logs.length}</dd>
          </dl>
        </div>
      </article>

      <h2 className="section-head">Logs for {pet.name}</h2>

      {logs.length === 0 && (
        <p className="muted">
          Nothing logged for {pet.name} yet. <Link to="/logs">Log care</Link>
        </p>
      )}

      {logs.length > 0 && (
        <ul className="list">
          {logs.map((row) => (
            <li key={row.id} className="card row">
              <div className="row-head">
                {/* The pet is already the page title, so the row leads with the time. */}
                <h3><time dateTime={row.happened_at}>{formatWhen(row.happened_at)}</time></h3>
                <span className={`tag tag-${row.type}`}>{labelOf(row.type)}</span>
              </div>

              {row.note
                ? <p className="note">{row.note}</p>
                : <p className="muted note">No note given.</p>}

              <footer>
                <span>by {row.member}</span>
              </footer>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}