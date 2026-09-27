import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  listLogs, getLog, createLog, updateLog, deleteLog,
  listPets, createPet, deletePet,
} from './api'
import { isOut, LIMITS } from './format.js'
import Navigation from './components/Navigation.jsx'
import Footer from './components/Footer.jsx'
import DemoNotice from './components/DemoNotice.jsx'
import Home from './pages/Home.jsx'
import Logs from './pages/Logs.jsx'
import Pets from './pages/Pets.jsx'
import PetDetail from './pages/Petdetail.jsx'

// App owns the data and talks to the API. The pages only own what is on
// screen (forms, detail panel), and hand the work back through the on... props.
// Each handler returns something truthy on success and null/false on failure,
// because that is what the pages check before clearing their forms.

// The quick log buttons have no form, so remember who is logging.
const MEMBER_KEY = 'carepawnion:member'

// The hour limits are kept in this browser too, the same way as the member.
const LIMITS_KEY = 'carepawnion:limits'

// Saved limits win over the defaults in format.js. A missing or broken entry
// falls back to the defaults instead of breaking the status board.
function readLimits() {
  try {
    const saved = JSON.parse(localStorage.getItem(LIMITS_KEY))
    if (saved && saved.fed > 0 && saved.out > 0) return saved
  } catch {
    localStorage.removeItem(LIMITS_KEY)
  }
  return LIMITS
}

export default function App() {
  const [status, setStatus] = useState('loading')   // loading | ready | error
  const [rows, setRows] = useState([])
  const [pets, setPets] = useState([])
  const [error, setError] = useState(null)
  const [slow, setSlow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [limits, setLimits] = useState(readLimits)

  async function load() {
    setStatus('loading')
    setError(null)

    // A free-tier API sleeps. If this is taking a while, say so.
    const timer = setTimeout(() => setSlow(true), 3000)

    try {
      const [loadedRows, loadedPets] = await Promise.all([listLogs(), listPets()])
      setRows(loadedRows)
      setPets(loadedPets)
      setStatus('ready')
    } catch (caught) {
      setError(caught)
      setStatus('error')
    } finally {
      clearTimeout(timer)
      setSlow(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ---------- Pets page ----------

  async function handleAddPet(input) {
    setError(null)
    try {
      const created = await createPet(input)
      setPets((previous) => [...previous, created])
      return created
    } catch (caught) {
      setError(caught)
      return null
    }
  }

  // The logs keep the pet NAME, so removing a pet does not erase their history.
  async function handleDeletePet(pet) {
    if (!confirm(`Remove ${pet.name}? Their logs stay in the list.`)) return

    const previous = pets
    setError(null)
    setPets(pets.filter((item) => item.id !== pet.id))   // optimistic
    try {
      await deletePet(pet.id)
    } catch (caught) {
      setPets(previous)
      setError(caught)
    }
  }

  // ---------- Logs page ----------

  // One handler, two jobs. No editingId means create, an editingId means update.
  async function handleSave(input, editingId) {
    setError(null)
    try {
      if (editingId) {
        const updated = await updateLog(editingId, input)
        setRows((previous) => previous.map((row) => (row.id === editingId ? updated : row)))
        return updated
      }
      const created = await createLog(input)
      setRows((previous) => [created, ...previous])
      return created
    } catch (caught) {
      setError(caught)
      return null
    }
  }

  async function handleView(id) {
    setError(null)
    try {
      return await getLog(id)
    } catch (caught) {
      setError(caught)
      return null
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this log?')) return false

    const previous = rows
    setError(null)
    setRows(rows.filter((row) => row.id !== id))   // optimistic
    try {
      await deleteLog(id)
      return true
    } catch (caught) {
      setRows(previous)                            // put it back on failure
      setError(caught)
      return false
    }
  }

  // No API call, since the limits live in this browser only. Returns the
  // limits so the page can close its form, same as the other handlers.
  function handleSetLimits(input) {
    localStorage.setItem(LIMITS_KEY, JSON.stringify(input))
    setLimits(input)
    return input
  }

  // ---------- Home page ----------

  // One tap from a pet card. Asks for a name only the first time.
  // A vet visit is not here on purpose, because it needs the kind and the
  // next date, and those need a form.
  async function handleQuickLog(pet, type) {
    let member = localStorage.getItem(MEMBER_KEY)
    if (!member) {
      member = prompt('Who is logging this?')?.trim()
      if (!member) return
      localStorage.setItem(MEMBER_KEY, member)
    }

    setBusy(true)
    await handleSave({ pet: pet.name, type, member, note: '' }, null)
    setBusy(false)
  }

  // When was this pet last fed, when was it last let out, and where does the
  // vet stand. rows arrives newest first, so the first match wins.
  const summary = pets.map((pet) => {
    const mine = rows.filter((row) => row.pet === pet.name)
    const visits = mine.filter((row) => row.type === 'vet')

    return {
      ...pet,
      lastFed: mine.find((row) => row.type === 'fed'),
      // isOut, not "anything that is not fed", or a check up would count as
      // a bathroom trip and the pet card would turn green for the wrong reason.
      lastOut: mine.find((row) => isOut(row.type)),
      lastVet: visits[0],
      // The newest visit that booked a follow up. A newer visit replaces an
      // older plan, so only the first match counts.
      nextVisit: visits.find((row) => row.next_visit)?.next_visit ?? null,
    }
  })

  return (
    <div className="page">

      <a className="skip-link" href="#main">Skip to content</a>

      <Navigation />

      {/* main, not div, so screen readers know where the screen starts.
          tabIndex -1 lets the skip link move focus here. */}
      <main id="main" className="page-body" tabIndex={-1}>
        {error && (
          <p className="error" role="alert">
            {error.message}{' '}
            {status === 'error' && <button className="ghost" onClick={load}>Try again</button>}
          </p>
        )}

        <Routes>
          <Route
            path="/"
            element={
              <Home summary={summary} status={status} busy={busy} limits={limits} onLog={handleQuickLog} rows={rows} />
            }
          />
          <Route
            path="/logs"
            element={
              <Logs
                status={status}
                slow={slow}
                rows={rows}
                pets={pets}
                summary={summary}
                limits={limits}
                onSave={handleSave}
                onView={handleView}
                onDelete={handleDelete}
                onSetLimits={handleSetLimits}
              />
            }
          />
          <Route path="/logs/new" element={<Navigate to="/logs" replace />} />
          <Route
            path="/pets"
            element={
              <Pets
                status={status}
                slow={slow}
                summary={summary}
                onAdd={handleAddPet}
                onRemove={handleDeletePet}
              />
            }
          />
          {/* One pet on its own page. It reads from summary and rows, so it
              needs no data of its own and no extra API call. */}
          <Route
            path="/pets/:id"
            element={
              <PetDetail status={status} slow={slow} summary={summary} rows={rows} />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <div className="content">
          <DemoNotice />
        </div>
      </main>
      <Footer />
    </div>
  )
}