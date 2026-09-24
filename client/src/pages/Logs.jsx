import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TYPES, labelOf, formatWhen } from '../format.js'

// The Logs page. The log form, one log loaded on its own, and everything
// logged so far.
//
// App owns the rows and talks to the API. This page owns the form and the
// detail panel. onSave, onView and onDelete hand the work back to App.

// types is a list, so one submit can log pee and poop at the same time.
// Each checked type still becomes its own log, since a log has one type.
const EMPTY_FORM = { pet: '', types: ['fed'], member: '', note: '' }

export default function Logs({ status, slow, rows, pets, onSave, onView, onDelete }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  const [detail, setDetail] = useState(null)
  const [detailStatus, setDetailStatus] = useState('idle')  // idle | loading | ready

  // Editing changes one log, so only one type can be checked there.
  function toggleType(value) {
    if (editingId) {
      setForm({ ...form, types: [value] })
      return
    }
    const types = form.types.includes(value)
      ? form.types.filter((item) => item !== value)
      : [...form.types, value]
    setForm({ ...form, types })
  }

  // One form, two jobs. No editingId means create, an editingId means update.
  async function handleSubmit(event) {
    event.preventDefault()
    if (!form.pet.trim() || !form.member.trim() || form.types.length === 0) return

    const base = {
      pet: form.pet.trim(),
      member: form.member.trim(),
      note: form.note.trim(),
    }

    setSaving(true)

    if (editingId) {
      const saved = await onSave({ ...base, type: form.types[0] }, editingId)
      setSaving(false)
      // If it failed, App shows the error and the form keeps what was typed.
      if (!saved) return
      if (detail?.id === editingId) setDetail(saved)
      setEditingId(null)
      setForm(EMPTY_FORM)
      return
    }

    // One log per checked type, one after another. Same pet, person and note.
    const done = []
    for (const type of form.types) {
      const saved = await onSave({ ...base, type }, null)
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
  }

  function startEdit(row) {
    setEditingId(row.id)
    setForm({ pet: row.pet, types: [row.type], member: row.member, note: row.note ?? '' })
    // The form is at the top and the row can be far down the list.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_FORM)
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
      </div>

      {status === 'ready' && pets.length === 0 && (
        <p className="muted">
          No pets yet. <Link to="/pets">Add a pet</Link> before you log anything.
        </p>
      )}

      {pets.length > 0 && (
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

          <p className="field">
            <label htmlFor="note">Note, food type or amount</label>
            <textarea
              id="note"
              value={form.note}
              onChange={(event) => setForm({ ...form, note: event.target.value })}
              maxLength={2000}
              rows={3}
            />
          </p>

          <p className="actions">
            <button type="submit" disabled={saving || form.types.length === 0}>
              {saving
                ? 'Saving...'
                : editingId
                  ? 'Save changes'
                  : form.types.length > 1 ? `Add ${form.types.length} logs` : 'Add log'}
            </button>
            {editingId && (
              <button type="button" className="ghost" onClick={cancelEdit}>Cancel</button>
            )}
          </p>
        </form>
      )}

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
                <dt>Member</dt><dd>{detail.member}</dd>
                <dt>Note</dt><dd>{detail.note || <span className="muted">None given</span>}</dd>
                <dt>Happened</dt><dd>{formatWhen(detail.happened_at)}</dd>
              </dl>
            )}
        </section>
      )}

      <h2 className="section-head">Everything logged</h2>

      {status === 'loading' && (
        <p className="muted">
          Loading{slow ? '. The server may be waking up, which can take up to a minute.' : '...'}
        </p>
      )}

      {status === 'ready' && rows.length === 0 && (
        <p className="muted">Nothing logged yet. Add the first one above.</p>
      )}

      {status === 'ready' && rows.length > 0 && (
        <ul className="list">
          {rows.map((row) => (
            <li key={row.id} className={`card row${editingId === row.id ? ' editing' : ''}`}>
              <div className="row-head">
                <h3>{row.pet}</h3>
                <span className={`tag tag-${row.type}`}>{labelOf(row.type)}</span>
              </div>

              {row.note
                ? <p className="note">{row.note}</p>
                : <p className="muted note">No note given.</p>}

              <footer>
                <time dateTime={row.happened_at}>
                  {formatWhen(row.happened_at)} by {row.member}
                </time>
                <span className="row-buttons">
                  <button className="ghost" onClick={() => handleView(row.id)}>View</button>
                  <button className="ghost" onClick={() => startEdit(row)}>Edit</button>
                  <button className="ghost danger" onClick={() => handleDelete(row.id)}>Delete</button>
                </span>
              </footer>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}