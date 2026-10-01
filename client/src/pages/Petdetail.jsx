import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  labelOf, vetKindOf, formatWhen, formatTime, formatDate,
  dayLabel, ageOf, visitLabel, isVisitDue,
} from '../format.js'
import PetForm from '../components/Petform.jsx'

// One pet on its own page. The profile box on top, the check up box and the
// routine box in the middle, and every log for this pet grouped by day below.
//
// Like the other pages, it owns no data. summary and rows come from App, so
// a log added on the Logs page shows up here without loading anything again.
// There is no getPet yet, so the pet is found in the list App already has.
// Edit swaps the profile box for PetForm, inside this same page, so the app
// stays at five screens.

// 0 to "12 AM", 13 to "1 PM". Written out, because 13:00 is not how the
// house talks about walking the dog.
function hourLabel(hour) {
  if (hour === 0) return '12 AM'
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return '12 PM'
  return `${hour - 12} PM`
}

// Same grouping as the Logs page. rows arrive newest first, so walking them
// in order already gives the days in order.
function groupByDay(rows, now) {
  const groups = []
  for (const row of rows) {
    const label = dayLabel(row.happened_at, now)
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.rows.push(row)
    else groups.push({ label, rows: [row] })
  }
  return groups
}

// When does this pet usually do one thing. Counting single hours is too
// strict, because 6:50 and 7:10 are the same habit, so the busiest three
// hour window is used as the usual time instead.
function routineOf(logs, type) {
  const mine = logs.filter((row) => row.type === type)
  if (mine.length === 0) return null

  const hours = new Array(24).fill(0)
  for (const row of mine) {
    const date = new Date(row.happened_at)
    if (!Number.isNaN(date.getTime())) hours[date.getHours()] += 1
  }

  let start = 0
  let inWindow = -1
  for (let hour = 0; hour < 24; hour += 1) {
    const count = hours[hour] + hours[(hour + 1) % 24] + hours[(hour + 2) % 24]
    if (count > inWindow) {
      inWindow = count
      start = hour
    }
  }

  return {
    type,
    total: mine.length,
    hours,
    busiest: Math.max(...hours),
    start,
    end: (start + 3) % 24,
    inWindow,
  }
}

export default function PetDetail({ status, slow, summary, rows, onEdit }) {
  const { id } = useParams()
  const [editing, setEditing] = useState(false)

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

  // Close the form only if it worked, so nothing typed is lost on a failure.
  async function handleEdit(input) {
    const saved = await onEdit(pet.id, input)
    if (saved) setEditing(false)
  }

  const now = new Date()
  const age = ageOf(pet.birthdate, now)
  const groups = groupByDay(logs, now)

  // Every vet visit for this pet, newest first. pet.nextVisit already holds
  // the date from the newest visit that booked one, so it is not worked out
  // again here.
  const visits = logs.filter((row) => row.type === 'vet')
  const visitDue = isVisitDue(pet.nextVisit, now)

  // Bathroom first, since that is what the routine box is for. Vet is left
  // out, because a check up twice a year has no usual hour.
  const routines = ['pee', 'poop', 'walk', 'fed']
    .map((type) => routineOf(logs, type))
    .filter(Boolean)

  return (
    <section className="content">
      <Link to="/pets" className="back-link">« Back to pets</Link>

      {editing
        ? (
          <>
            <h1>Edit {pet.name}</h1>
            <PetForm
              pet={pet}
              submitLabel="Save changes"
              onSubmit={handleEdit}
              onCancel={() => setEditing(false)}
            />
          </>
        )
        : (
        <article className="card pet-profile">
          {pet.photo
            ? <img className="pet-profile-photo" src={pet.photo} alt="" />
            : <div className="pet-profile-photo pet-photo-empty" aria-hidden="true">🐾</div>}

          <div className="pet-profile-info">
            {/* Name on the left, Edit details in the top right corner. */}
            <div className="pet-profile-head">
              <h1>{pet.name}</h1>
              <button className="ghost" onClick={() => setEditing(true)}>Edit details</button>
            </div>
            <p className="species">
              {[pet.species, pet.breed, age].filter(Boolean).join(', ')}
            </p>

            {/* The three things people open this page for, before the full list. */}
            <div className="pet-stats">
              <div className="pet-stat">
                <span className="pet-stat-label">Last fed</span>
                <strong>{pet.lastFed ? formatWhen(pet.lastFed.happened_at) : 'No record yet'}</strong>
                {pet.lastFed && <span className="by">by {pet.lastFed.member}</span>}
              </div>
              <div className="pet-stat">
                <span className="pet-stat-label">Last out</span>
                <strong>
                  {pet.lastOut
                    ? `${labelOf(pet.lastOut.type)}, ${formatWhen(pet.lastOut.happened_at)}`
                    : 'No record yet'}
                </strong>
                {pet.lastOut && <span className="by">by {pet.lastOut.member}</span>}
              </div>
              <div className="pet-stat">
                <span className="pet-stat-label">Total logs</span>
                <strong>{logs.length}</strong>
                <span className="by">since the first entry</span>
              </div>
            </div>

            <dl className="detail-list">
              <dt>Birthday</dt>
              <dd>
                {pet.birthdate
                  ? formatDate(pet.birthdate)
                  : <span className="muted">Not given</span>}
              </dd>
            </dl>
          </div>
        </article>
        )}

      <h2 className="section-head">Check ups</h2>

      {visits.length === 0 && (
        <p className="muted">
          No vet visit logged for {pet.name} yet. <Link to="/logs">Log one</Link>
        </p>
      )}

      {visits.length > 0 && (
        <div className="card vet-box">
          {/* The next date is the whole reason this box exists, so it sits on
              top and turns red once the day has passed. */}
          <div className={`vet-next${visitDue ? ' vet-due' : ''}`}>
            <span className="vet-next-label">Next check up</span>
            {pet.nextVisit
              ? (
                <>
                  <strong className="vet-next-date">{formatDate(pet.nextVisit)}</strong>
                  <span className="vet-next-when">{visitLabel(pet.nextVisit, now)}</span>
                </>
              )
              : <strong className="vet-next-date">None booked</strong>}
          </div>

          <ul className="list vet-list">
            {visits.map((visit) => (
              <li key={visit.id} className="vet-row">
                <div className="vet-row-head">
                  <span className="tag tag-vet">{vetKindOf(visit.vet_kind)}</span>
                  <strong className="vet-when">{formatWhen(visit.happened_at)}</strong>
                  <span className="by">by {visit.member}</span>
                </div>

                {visit.note && <p className="note">{visit.note}</p>}

                {visit.next_visit && (
                  <p className="vet-booked muted">
                    Booked a follow up for {formatDate(visit.next_visit)}.
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="section-head">Usual times</h2>

      {routines.length === 0 && (
        <p className="muted">
          Nothing to read yet. The usual times appear once {pet.name} has a few logs.
        </p>
      )}

      {routines.length > 0 && (
        <div className="card routine">
          <p className="muted routine-intro">
            Each bar is one hour of the day, counted from every log so far.
            Taller means it happens more often at that hour.
          </p>

          {routines.map((routine) => (
            <div key={routine.type} className="routine-row">
              <div className="routine-head">
                <span className={`tag tag-${routine.type}`}>{labelOf(routine.type)}</span>
                <strong className="routine-usual">
                  Usually {hourLabel(routine.start)} to {hourLabel(routine.end)}
                </strong>
                <span className="muted routine-count">
                  {routine.inWindow} of {routine.total} log{routine.total === 1 ? '' : 's'}
                </span>
              </div>

              {/* 24 bars, one per hour. The height is a share of the busiest
                  hour, so a quiet pet still gets a readable shape. */}
              <div className="routine-bars" role="img"
                aria-label={`${labelOf(routine.type)} happens most often between ${hourLabel(routine.start)} and ${hourLabel(routine.end)}`}>
                {routine.hours.map((count, hour) => (
                  <span
                    key={hour}
                    className={`routine-bar${count > 0 ? ' filled' : ''}`}
                    title={`${hourLabel(hour)}, ${count} log${count === 1 ? '' : 's'}`}
                  >
                    <span
                      className="routine-bar-fill"
                      style={{ height: `${count === 0 ? 4 : (count / routine.busiest) * 100}%` }}
                    />
                  </span>
                ))}
              </div>

              <div className="routine-scale">
                <span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-head">Logs for {pet.name}</h2>

      {logs.length === 0 && (
        <p className="muted">
          Nothing logged for {pet.name} yet. <Link to="/logs">Log care</Link>
        </p>
      )}

      {/* One card per day instead of one card per log, the same as the Logs
          page, so the two lists read alike. */}
      {groups.map((group) => (
        <section key={group.label} className="card day-group">
          <div className="day-head">
            <h3>{group.label}</h3>
            <span className="muted">{group.rows.length} log{group.rows.length === 1 ? '' : 's'}</span>
          </div>

          <ul className="list day-rows">
            {group.rows.map((row) => (
              <li key={row.id} className="log-row">
                <time className="log-time" dateTime={row.happened_at}>
                  {formatTime(row.happened_at)}
                </time>

                <span className={`tag tag-${row.type}`}>{labelOf(row.type)}</span>

                {row.type === 'vet' && row.vet_kind && (
                  <span className="log-kind">{vetKindOf(row.vet_kind)}</span>
                )}

                <span className="log-member">by {row.member}</span>

                {row.note && <span className="log-note">{row.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}