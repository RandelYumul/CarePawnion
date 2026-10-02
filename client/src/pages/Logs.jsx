import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TYPES, LIMITS, VET_KINDS, labelOf, vetKindOf,
  formatWhen, formatTime, formatDate, timeAgo, dayLabel, isDue, isOut, visitLabel,
} from '../format.js'

// The Logs page. A short status board on top, the log form behind a button,
// one log loaded on its own, and the history grouped by day.
//
// App owns the rows and talks to the API. This page owns the form, whether
// the form is open, the limits form, and the detail panel. onSave, onView,
// onDelete and onSetLimits hand the work back to App.

// types is a list, so one submit can log pee and poop at the same time.
// Each checked type still becomes its own log, since a log has one type.
// notes is keyed by type, so each checked type keeps its own note.
// vetKind and nextVisit are only sent when the type is vet.
const EMPTY_FORM = { pet: '', types: ['fed'], member: '', notes: {}, vetKind: 'vaccine', nextVisit: '' }

// Local date, not toISOString, or the earliest allowed next visit is
// yesterday before 8am in PH.
const today = () => new Date().toLocaleDateString('en-CA')

// Same day as now, used for the counts on the status board.
function isToday(iso, now) {
  const date = new Date(iso)
  return date.getFullYear() === now.getFullYear()
    && date.getMonth() === now.getMonth()
    && date.getDate() === now.getDate()
}

// rows arrive newest first, so walking them in order already gives the days
// in order. A new label starts a new group, otherwise the row joins the last.
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

export default function Logs({ status, slow, rows, pets, summary, limits, onSave, onView, onDelete, onSetLimits }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  // Kept as text while typing, so clearing the box does not turn into 0.
  const [limitsForm, setLimitsForm] = useState({ fed: '', out: '' })
  const [showLimits, setShowLimits] = useState(false)

  const [detail, setDetail] = useState(null)
  const [detailStatus, setDetailStatus] = useState('idle')  // idle | loading | ready

  const now = new Date()
  const groups = groupByDay(rows, now)
  const todayRows = rows.filter((row) => isToday(row.happened_at, now))

  // A vet visit carries its own fields, so the form changes shape for it.
  const isVet = form.types.includes('vet')

  function toggleType(value) {
    // Editing changes one log, so only one type can be checked there.
    if (editingId) {
      setForm({ ...form, types: [value] })
      return
    }
    // A vet visit is on its own. Pee and poop go together fine, but a check
    // up with a next date cannot be half of a pair.
    if (value === 'vet') {
      setForm({ ...form, types: isVet ? [] : ['vet'] })
      return
    }
    const kept = form.types.filter((item) => item !== 'vet')
    const types = kept.includes(value)
      ? kept.filter((item) => item !== value)
      : [...kept, value]
    setForm({ ...form, types })
  }

  // Both vet fields are always sent, set for a vet visit and null for
  // everything else. Sending null clears them when a log is edited from a
  // vet visit into something else, and it keeps every row the same shape.
  function vetFieldsFor(type) {
    return type === 'vet'
      ? { vet_kind: form.vetKind, next_visit: form.nextVisit || null }
      : { vet_kind: null, next_visit: null }
  }

  // One form, two jobs. No editingId means create, an editingId means update.
  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.pet.trim() || !form.member.trim() || form.types.length === 0) return

    // Each checked type keeps its own note, so Fed and Poop do not share one.
    const noteFor = (type) => (form.notes[type] ?? '').trim()

    const base = {
      pet: form.pet.trim(),
      member: form.member.trim(),
    }

    setSaving(true)

    if (editingId) {
      const type = form.types[0]
      const saved = await onSave({ ...base, type, note: noteFor(type), ...vetFieldsFor(type) }, editingId)
      setSaving(false)
      // If it failed, App shows the error and the form keeps what was typed.
      if (!saved) return
      if (detail?.id === editingId) setDetail(saved)
      setEditingId(null)
      setForm(EMPTY_FORM)
      setShowForm(false)
      return
    }

    // One log per checked type, one after another. Same pet and person, each
    // with its own note.
    const done = []
    for (const type of form.types) {
      const saved = await onSave({ ...base, type, note: noteFor(type), ...vetFieldsFor(type) }, null)
      if (!saved) {
        // Uncheck the ones that already saved, so trying again does not
        // log them twice.
        setForm({ ...form, types: form.types.filter((item) => !done.includes(item)) })
        setSaving(false)
        return
      }
      done.push(type)
    }
    setSaving(false)

    // Keep the pet and the member, since the next log is usually the same person.
    setForm({ ...EMPTY_FORM, pet: form.pet, member: form.member })
    setShowForm(false)
  }

  // Only one form open at a time, so the top of the page stays short.
  function toggleForm() {
    setShowLimits(false)
    setShowForm(!showForm)
  }

  // Opens with the current limits filled in, so a small change stays small.
  function toggleLimits() {
    setShowForm(false)
    setLimitsForm({ fed: String(limits.fed), out: String(limits.out) })
    setShowLimits(!showLimits)
  }

  function handleLimitsSubmit(event) {
    event.preventDefault()
    const fed = Number(limitsForm.fed)
    const out = Number(limitsForm.out)
    if (!Number.isInteger(fed) || !Number.isInteger(out) || fed < 1 || out < 1) return

    onSetLimits({ fed, out })
    setShowLimits(false)
  }

  function resetLimits() {
    onSetLimits(LIMITS)
    setShowLimits(false)
  }

  function startEdit(row) {
    setShowLimits(false)
    setEditingId(row.id)
    setForm({
      pet: row.pet,
      types: [row.type],
      member: row.member,
      notes: { [row.type]: row.note ?? '' },
      vetKind: row.vet_kind ?? 'vaccine',
      // The input needs 'YYYY-MM-DD', and the API may hand back a full date.
      nextVisit: row.next_visit ? String(row.next_visit).slice(0, 10) : '',
    })
    setShowForm(true)
    // The form is at the top and the row can be far down the list.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  // getLog exists so a detail page can load one row without the whole list.
  async function handleView(id) {
    setDetailStatus('loading')
    const found = await onView(id)
    if (found) {
      setDetail(found)
      setDetailStatus('ready')
    } else {
      setDetailStatus('idle')
    }
  }

  async function handleDelete(id) {
    const deleted = await onDelete(id)
    if (!deleted) return
    if (detail?.id === id) {
      setDetail(null)
      setDetailStatus('idle')
    }
    if (editingId === id) cancelEdit()
  }

  return (
    <section className="content">
      <div className="page-head">
        <h1>Logs</h1>
        {!editingId && (
          <span className="row-buttons">
            {pets.length > 0 && (
              <button className="ghost" onClick={toggleForm}>
                {showForm ? 'Cancel' : 'Log care'}
              </button>
            )}
            <button className="ghost" onClick={toggleLimits}>
              {showLimits ? 'Cancel' : 'Set limits'}
            </button>
          </span>
        )}
      </div>

      {status === 'ready' && pets.length === 0 && (
        <p className="muted">
          No pets yet. <Link to="/pets">Add a pet</Link> before you log anything.
        </p>
      )}

      {/* Numbers first, then the forms. On a phone the CSS flips this, so a
          form opens right under its button instead of below every stat card. */}
      <div className="logs-top">
        {/* The numbers people actually come here for. The list below is the
            proof, this is the answer. */}
        {status === 'ready' && summary.length > 0 && (
          <div className="logs-stats">
            <p className="stat-line">
              {todayRows.length === 0
                ? 'Nothing logged today yet.'
                : `${todayRows.length} log${todayRows.length === 1 ? '' : 's'} today, ${rows.length} in total.`}
            </p>

            <div className="stat-grid">
              {summary.map((pet) => {
                const mine = todayRows.filter((row) => row.pet === pet.name)
                const fedToday = mine.filter((row) => row.type === 'fed').length
                const outToday = mine.filter((row) => isOut(row.type)).length
                const fedDue = isDue(pet.lastFed?.happened_at, limits.fed, now)
                const outDue = isDue(pet.lastOut?.happened_at, limits.out, now)

                return (
                  <article key={pet.id} className="card stat-card">
                    <h3>{pet.name}</h3>

                    <dl className="stat-list">
                      <dt>Last fed</dt>
                      <dd className={fedDue ? 'stat-due' : 'stat-ok'}>
                        {pet.lastFed ? timeAgo(pet.lastFed.happened_at, now) : 'No record yet'}
                      </dd>
                      <dt>Last out</dt>
                      <dd className={outDue ? 'stat-due' : 'stat-ok'}>
                        {pet.lastOut ? timeAgo(pet.lastOut.happened_at, now) : 'No record yet'}
                      </dd>
                      {/* Only when a follow up was actually booked, so a pet
                          with no vet history shows nothing instead of a blank. */}
                      {pet.nextVisit && (
                        <>
                          <dt>Next vet</dt>
                          <dd>{formatDate(pet.nextVisit)}, {visitLabel(pet.nextVisit, now)}</dd>
                        </>
                      )}
                    </dl>

                    <p className="stat-today">
                      Today, fed {fedToday} time{fedToday === 1 ? '' : 's'} and
                      {' '}out {outToday} time{outToday === 1 ? '' : 's'}.
                    </p>
                  </article>
                )
              })}
            </div>
          </div>
        )}

        {/* How many hours before a pet turns red. The same limits drive the
            pet cards and the Hungry and Bathroom lists on Home. */}
        {showLimits && (
          <form onSubmit={handleLimitsSubmit} className="card form">
            <h2>Set limits</h2>
            <p className="muted">
              Hours before a pet shows as due. Saved on this device only.
            </p>

            <div className="fields">
              <p className="field">
                <label htmlFor="limit-fed">Hours between meals</label>
                <input
                  id="limit-fed"
                  type="number"
                  min={1}
                  max={72}
                  step={1}
                  value={limitsForm.fed}
                  onChange={(event) => setLimitsForm({ ...limitsForm, fed: event.target.value })}
                  required
                />
              </p>

              <p className="field">
                <label htmlFor="limit-out">Hours between bathroom trips</label>
                <input
                  id="limit-out"
                  type="number"
                  min={1}
                  max={72}
                  step={1}
                  value={limitsForm.out}
                  onChange={(event) => setLimitsForm({ ...limitsForm, out: event.target.value })}
                  required
                />
              </p>
            </div>

            <p className="actions">
              <button type="submit">Save limits</button>
              <button type="button" className="ghost" onClick={resetLimits}>
                Use defaults, {LIMITS.fed} and {LIMITS.out} hours
              </button>
            </p>
          </form>
        )}

        {/* The form only opens when someone is logging, so the page starts on
            the numbers and not on empty fields. */}
        {pets.length > 0 && showForm && (
          <form onSubmit={handleSubmit} className="card form">
            <h2>{editingId ? 'Edit log' : 'Log care'}</h2>

            <div className="fields">
              <p className="field">
                <label htmlFor="pet">Pet</label>
                <select
                  id="pet"
                  value={form.pet}
                  onChange={(event) => setForm({ ...form, pet: event.target.value })}
                  required
                >
                  <option value="">Choose a pet</option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.name}>{pet.name}</option>
                  ))}
                </select>
              </p>

              {/* Checkboxes, not a select, so pee and poop can go in together. */}
              <fieldset className="field type-picks">
                <legend>{editingId ? 'What you did' : 'What you did, pick one or more'}</legend>
                {TYPES.map((item) => (
                  <label key={item.value} className="type-pick">
                    <input
                      type="checkbox"
                      checked={form.types.includes(item.value)}
                      onChange={() => toggleType(item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </fieldset>

              <p className="field">
                <label htmlFor="member">Who did it</label>
                <input
                  id="member"
                  value={form.member}
                  onChange={(event) => setForm({ ...form, member: event.target.value })}
                  maxLength={80}
                  required
                />
              </p>
            </div>

            {/* The two vet fields only appear once Vet is picked, so the form
                stays short for the everyday logs. */}
            {isVet && (
              <div className="fields vet-fields">
                <p className="field">
                  <label htmlFor="vet-kind">Kind of visit</label>
                  <select
                    id="vet-kind"
                    value={form.vetKind}
                    onChange={(event) => setForm({ ...form, vetKind: event.target.value })}
                  >
                    {VET_KINDS.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                </p>

                <p className="field">
                  <label htmlFor="next-visit">Next check up, optional</label>
                  <input
                    id="next-visit"
                    type="date"
                    value={form.nextVisit}
                    min={today()}
                    onChange={(event) => setForm({ ...form, nextVisit: event.target.value })}
                  />
                </p>
              </div>
            )}

            {/* One note per checked type. With one type it reads the same as before. */}
            {form.types.map((type) => (
              <p key={type} className="field">
                <label htmlFor={`note-${type}`}>
                  {type === 'vet'
                    ? 'Details, vaccine name or what the vet said'
                    : form.types.length > 1
                      ? `Note for ${labelOf(type)}`
                      : 'Note, food type or amount'}
                </label>
                <textarea
                  id={`note-${type}`}
                  value={form.notes[type] ?? ''}
                  onChange={(event) =>
                    setForm({ ...form, notes: { ...form.notes, [type]: event.target.value } })}
                  maxLength={2000}
                  rows={form.types.length > 1 ? 2 : 3}
                />
              </p>
            ))}

            <p className="actions">
              <button type="submit" disabled={saving || form.types.length === 0}>
                {saving
                  ? 'Saving...'
                  : editingId
                    ? 'Save changes'
                    : form.types.length > 1 ? `Add ${form.types.length} logs` : 'Add log'}
              </button>
              <button type="button" className="ghost" onClick={cancelEdit}>Cancel</button>
            </p>
          </form>
        )}
      </div>

      {detailStatus !== 'idle' && (
        <section className="card detail">
          <div className="detail-head">
            <h2>One log, loaded on its own</h2>
            <button className="ghost" onClick={() => { setDetail(null); setDetailStatus('idle') }}>
              Close
            </button>
          </div>
          {detailStatus === 'loading'
            ? <p className="muted">Loading...</p>
            : (
              <dl className="detail-list">
                <dt>Id</dt><dd><code>{detail.id}</code></dd>
                <dt>Pet</dt><dd>{detail.pet}</dd>
                <dt>Type</dt><dd>{labelOf(detail.type)}</dd>
                {/* Only a vet visit has these two, so they are skipped for
                    every other type instead of showing an empty row. */}
                {detail.type === 'vet' && (
                  <>
                    <dt>Kind of visit</dt><dd>{vetKindOf(detail.vet_kind)}</dd>
                    <dt>Next check up</dt>
                    <dd>
                      {detail.next_visit
                        ? <>{formatDate(detail.next_visit)} <span className="by">{visitLabel(detail.next_visit, now)}</span></>
                        : <span className="muted">None booked</span>}
                    </dd>
                  </>
                )}
                <dt>Member</dt><dd>{detail.member}</dd>
                <dt>Note</dt><dd>{detail.note || <span className="muted">None given</span>}</dd>
                <dt>Happened</dt><dd>{formatWhen(detail.happened_at)}</dd>
              </dl>
            )}
        </section>
      )}

      <h2 className="section-head">History</h2>

      {status === 'loading' && (
        <p className="muted">
          Loading{slow ? '. The server may be waking up, which can take up to a minute.' : '...'}
        </p>
      )}

      {status === 'ready' && rows.length === 0 && (
        <p className="muted">Nothing logged yet. Use the Log care button above.</p>
      )}

      {/* One card per day instead of one card per log. A day is what people
          scan for, and the rows inside stay one line each. */}
      {status === 'ready' && rows.length > 0 && groups.map((group) => (
        <section key={group.label} className="card day-group">
          <div className="day-head">
            <h3>{group.label}</h3>
            <span className="muted">{group.rows.length} log{group.rows.length === 1 ? '' : 's'}</span>
          </div>

          <ul className="list day-rows">
            {group.rows.map((row) => (
              <li key={row.id} className={`log-row${editingId === row.id ? ' editing' : ''}`}>
                <time className="log-time" dateTime={row.happened_at}>
                  {formatTime(row.happened_at)}
                </time>

                <span className={`tag tag-${row.type}`}>{labelOf(row.type)}</span>

                {/* Vaccine or check up, right beside the Vet tag, because
                    "Vet" on its own does not say what happened. */}
                {row.type === 'vet' && row.vet_kind && (
                  <span className="log-kind">{vetKindOf(row.vet_kind)}</span>
                )}

                <span className="log-pet">{row.pet}</span>
                <span className="log-member">by {row.member}</span>

                {row.note && <span className="log-note">{row.note}</span>}

                {row.type === 'vet' && row.next_visit && (
                  <span className="log-next">Next {formatDate(row.next_visit)}</span>
                )}

                <span className="row-buttons">
                  <button className="ghost" onClick={() => handleView(row.id)}>View</button>
                  <button className="ghost" onClick={() => startEdit(row)}>Edit</button>
                  <button className="ghost danger" onClick={() => handleDelete(row.id)}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  )
}