import { useEffect, useState } from 'react'
import { timeAgo } from '../format.js'

// The floating bar under the masthead. The time of the last log on the left,
// shortcut buttons on the right, and who did it along the bottom. The left side
// and the bottom line both follow whichever shortcut is picked.
//
// Like PetCard, it owns no data. rows comes from App. The only thing it keeps
// is which shortcut is picked, because that only changes what is on screen.

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

export default function HomeRectangle({ rows, onOpen }) {
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

        <div className="hr-shortcuts">
          {SHORTCUTS.map((item) => {
            const count = item.type === 'all' ? 0 : countToday(item.type)
            const active = item.type === selected
            return (
              <button
                key={item.type}
                className={`hr-shortcut${active ? ' active' : ''}`}
                onClick={() => setSelected(item.type)}
                aria-pressed={active}
                aria-label={`${item.label}, ${count} today`}
              >
                {item.icon}
                {count > 0 && <span className="hr-badge" aria-hidden="true">{count}</span>}
              </button>
            )
          })}
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