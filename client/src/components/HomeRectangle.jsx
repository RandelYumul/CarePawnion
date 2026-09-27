import { useEffect, useState } from 'react'
import { timeAgo, LIMITS, isDue } from '../format.js'

// The floating bar under the masthead. Three columns now. The time of the last
// log on the left with the shortcut buttons under it, the pets that are hungry
// in the middle, and the pets that need out on the right. Who did it runs along
// the bottom.
//
// Like PetCard, it owns no data. rows and summary both come from App. The only
// thing it keeps is which shortcut is picked, because that only changes what is
// on screen.

// The customizable part. Add, remove or reorder these to change the buttons.
// type matches a log type, or 'all' for everything. name is what the bottom
// line calls it, like "Last pee".
const SHORTCUTS = [
  { type: 'walk', icon: '👟', label: 'Walks', name: 'walk' },
  { type: 'fed', icon: '🥣', label: 'Feedings', name: 'feeding' },
  { type: 'poop', icon: '💩', label: 'Poops', name: 'poop' },
  { type: 'pee', icon: '💧', label: 'Pees', name: 'pee' },
  { type: 'all', icon: 'ALL', label: 'All logs', name: 'activity' },
]

const VERBS = {
  fed: 'fed',
  walk: 'walked',
  pee: 'logged pee for',
  poop: 'logged poop for',
}

const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString()

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

export default function HomeRectangle({ rows, summary, onOpen }) {
  const [now, setNow] = useState(new Date())
  const [selected, setSelected] = useState('all')

  // Tick every 30 seconds, so "3 minutes ago" keeps counting up.
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  // rows arrives newest first, so the first match is the latest of that type.
  const picked = SHORTCUTS.find((item) => item.type === selected)
  const last = selected === 'all' ? rows[0] : rows.find((row) => row.type === selected)

  const lastDate = last && new Date(last.happened_at)

  // Badge number is how many of that type were logged today.
  const countToday = (type) =>
    rows.filter((row) => (type === 'all' || row.type === type) && isToday(row.happened_at)).length

  // Same limits the pet cards use, so a red chip on a card and a pet in this
  // list always mean the same thing.
  const hungry = summary.filter((pet) => isDue(pet.lastFed?.happened_at, LIMITS.fed, now))
  const needsOut = summary.filter((pet) => isDue(pet.lastOut?.happened_at, LIMITS.out, now))

  return (
    <section className="home_rectangle">
      <div className="hr-top">
        <div className="hr-clock">
          <p className="hr-date">
            Last {picked.name}
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

      {/* aria-live so a screen reader hears the new line after a shortcut is pressed. */}
      <p className="hr-last" aria-live="polite">
        {last
          ? <>{last.member} {VERBS[last.type] ?? last.type} {last.pet}.</>
          : `No ${picked.name} logged yet.`}
        {' '}
        <button className="pet-link" onClick={onOpen}>View logs »</button>
      </p>
    </section>
  )
}