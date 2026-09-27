import { useEffect, useState } from 'react'
import { timeAgo, LIMITS, isDue } from '../format.js'

// The floating bar under the masthead. Three columns. The time of the last
// log on the left, the pets that are hungry in the middle, and the pets that
// need out on the right. Who did it runs along the bottom.
//
// Like PetCard, it owns no data. rows and summary both come from App. The
// only thing it keeps is the clock, because that is the only thing that
// changes on its own.

// How the bottom line reads. A vet visit is not here, because "took Cobby to
// the vet" puts the pet in the middle and the others put it at the end.
const VERBS = {
  fed: 'fed',
  walk: 'walked',
  pee: 'logged pee for',
  poop: 'logged poop for',
}

// One row in the hungry or bathroom list. Photo on the left, name and how long
// ago on the right. Same paw fallback as PetCard, so a pet with no photo still
// lines up with the others.
function DueRow({ pet, at, now }) {
  return (
    <li className="hr-due-row">
      {pet.photo
        ? <img className="hr-due-photo" src={pet.photo} alt="" />
        : <div className="hr-due-photo hr-due-photo-empty" aria-hidden="true">🐾</div>}

      <div className="hr-due-text">
        <span className="hr-due-name">{pet.name}</span>
        <span className="hr-due-ago">{at ? timeAgo(at, now) : 'No record yet'}</span>
      </div>
    </li>
  )
}

export default function HomeRectangle({ rows, summary, limits = LIMITS, onOpen }) {
  const [now, setNow] = useState(new Date())

  // Tick every 30 seconds, so "3 minutes ago" keeps counting up.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  // rows arrives newest first, so the first one is the latest log.
  const last = rows[0]
  const lastDate = last && new Date(last.happened_at)

  // Same limits the pet cards use, so a red chip on a card and a pet in this
  // list always mean the same thing.
  const hungry = summary.filter((pet) => isDue(pet.lastFed?.happened_at, limits.fed, now))
  const needsOut = summary.filter((pet) => isDue(pet.lastOut?.happened_at, limits.out, now))

  return (
    <section className="home_rectangle">
      <div className="hr-top">
        <div className="hr-clock">
          <p className="hr-date">
            Last activity
            {last && `, ${lastDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}`}
          </p>
          <p className="hr-time">
            {last ? lastDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--:--'}
          </p>
          <p className="hr-ago">{last ? timeAgo(last.happened_at, now) : 'Nothing yet'}</p>
        </div>

        <div className="hr-due">
          <h2 className="hr-due-head">Hungry <span className="hr-due-count">{hungry.length}</span></h2>
          {hungry.length === 0
            ? <p className="hr-due-none">Nobody is hungry.</p>
            : (
              <ul className="hr-due-list">
                {hungry.map((pet) => (
                  <DueRow key={pet.id} pet={pet} at={pet.lastFed?.happened_at} now={now} />
                ))}
              </ul>
            )}
        </div>

        <div className="hr-due">
          <h2 className="hr-due-head">Bathroom <span className="hr-due-count">{needsOut.length}</span></h2>
          {needsOut.length === 0
            ? <p className="hr-due-none">Nobody needs out.</p>
            : (
              <ul className="hr-due-list">
                {needsOut.map((pet) => (
                  <DueRow key={pet.id} pet={pet} at={pet.lastOut?.happened_at} now={now} />
                ))}
              </ul>
            )}
        </div>
      </div>

      {/* aria-live so a screen reader hears the new line after a log is added. */}
      <p className="hr-last" aria-live="polite">
        {!last && 'No activity logged yet.'}
        {last && last.type === 'vet' && <>{last.member} took {last.pet} to the vet.</>}
        {last && last.type !== 'vet' && <>{last.member} {VERBS[last.type] ?? last.type} {last.pet}.</>}
        {' '}
        <button className="pet-link" onClick={onOpen}>View logs »</button>
      </p>
    </section>
  )
}