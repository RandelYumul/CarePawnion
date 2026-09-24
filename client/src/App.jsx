import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import {
  listLogs, getLog, createLog, updateLog, deleteLog,
  listPets, createPet, deletePet,
} from './api'
import Navigation from './components/Navigation.jsx'
import Footer from './components/Footer.jsx'
import DemoNotice from './components/DemoNotice.jsx'
import Home from './pages/Home.jsx'
import Logs from './pages/Logs.jsx'
import Pets from './pages/Pets.jsx'

// App owns the data and talks to the API. The pages only own what is on
// screen (forms, detail panel), and hand the work back through the on... props.
// Each handler returns something truthy on success and null/false on failure,
// because that is what the pages check before clearing their forms.

// The quick log buttons have no form, so remember who is logging.
const MEMBER_KEY = 'carepawnion:member'

export default function App() {
  const [status, setStatus] = useState('loading')   // loading | ready | error
  const [rows, setRows] = useState([])
  const [pets, setPets] = useState([])
  const [error, setError] = useState(null)
  const [slow, setSlow] = useState(false)
  const [busy, setBusy] = useState(false)

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

  // ---------- Home page ----------

  // One tap from a pet card. Asks for a name only the first time.
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

  // When was this pet last fed, and when was it last let out.
  // rows arrives newest first, so the first match wins.
  const summary = pets.map((pet) => {
    const mine = rows.filter((row) => row.pet === pet.name)
    return {
      ...pet,
      lastFed: mine.find((row) => row.type === 'fed'),
      lastOut: mine.find((row) => row.type !== 'fed'),
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
              <Home summary={summary} status={status} busy={busy} onLog={handleQuickLog} rows={rows} />
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
                onSave={handleSave}
                onView={handleView}
                onDelete={handleDelete}
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