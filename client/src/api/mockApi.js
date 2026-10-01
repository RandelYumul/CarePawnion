// The simulated backend.
//
// Same function names, same return types, and the same shape of failure as
// httpApi.js, so your components cannot tell the difference. Data lives in the
// visitor's own browser and goes no further.
//
// This exists so the template's GitHub Pages link works on day one and so you
// can build the interface before your API is deployed. It is NOT a finished
// project. See content/extending-your-app page 3.

import seed from './seed.json'

// The key carries a version. Vet logs added two fields to a row, and a
// browser that already visited the old build has the old rows saved. Bumping
// the key hands those visitors the new seed instead of a list with no vet
// visits in it.
const KEY = 'carepawnion:logs:v2'

// A real network is not instant. Keeping this delay is what forces you to build
// a loading state now, while it is cheap, instead of discovering you need one
// the day you switch to the real API.
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

function seedRows() {
  const nameOf = (id) => seed.pets.find((pet) => pet.id === id)?.name ?? 'Unknown'

  const feedings = seed.feedings.map((row) => ({
    id: row.id,
    pet: nameOf(row.pet_id),
    type: 'fed',
    member: row.member,
    note: row.food,
    vet_kind: null,
    next_visit: null,
    happened_at: row.happened_at,
  }))

  const outings = seed.outings.map((row) => ({
    id: row.id,
    pet: nameOf(row.pet_id),
    type: row.type,
    member: row.member,
    note: row.note,
    vet_kind: null,
    next_visit: null,
    happened_at: row.happened_at,
  }))

  // A vet visit is a log like any other. The two extra fields are the only
  // difference, and every other row carries them as null so the shape of a
  // row never changes.
  const visits = seed.vet.map((row) => ({
    id: row.id,
    pet: nameOf(row.pet_id),
    type: 'vet',
    member: row.member,
    note: row.note,
    vet_kind: row.kind,
    next_visit: row.next_visit || null,
    happened_at: row.happened_at,
  }))

  return [...feedings, ...outings, ...visits]
}

function read() {
  const stored = localStorage.getItem(KEY)
  if (stored) {
    try {
      const parsed = JSON.parse(stored)
      // Valid JSON is not the same as the right shape. An older version of
      // this file stored the seed object here, and an object has no .slice.
      if (Array.isArray(parsed)) return parsed
      localStorage.removeItem(KEY)
    } catch {
      // Corrupted storage. Start again rather than crashing the app.
      localStorage.removeItem(KEY)
    }
  }
  const rows = seedRows()
  localStorage.setItem(KEY, JSON.stringify(rows))
  return rows
}

function write(rows) {
  localStorage.setItem(KEY, JSON.stringify(rows))
  return rows
}

export async function listLogs() {
  await delay()
  return read().slice().sort((a, b) => b.happened_at.localeCompare(a.happened_at))
}

const PETS_KEY = 'carepawnion:pets'

// Same read/write pair as the logs, because pets are now editable data and
// not a fixed list baked into the seed.
function readPets() {
  const stored = localStorage.getItem(PETS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      localStorage.removeItem(PETS_KEY)
    }
  }
  localStorage.setItem(PETS_KEY, JSON.stringify(seed.pets))
  return seed.pets
}

function writePets(pets) {
  localStorage.setItem(PETS_KEY, JSON.stringify(pets))
  return pets
}

export async function listPets() {
  await delay()
  return readPets()
}

export async function createPet(input) {
  await delay()
  const created = { ...input, id: crypto.randomUUID() }
  writePets([...readPets(), created])
  return created
}

// Same as the server, a rename also renames the logs, since a log keeps the
// pet name and would lose its pet otherwise.
export async function updatePet(id, input) {
  await delay()
  const pets = readPets()
  const index = pets.findIndex((pet) => String(pet.id) === String(id))
  if (index === -1) throw new Error('Not found')

  const oldName = pets[index].name
  pets[index] = { ...pets[index], ...input }
  writePets(pets)

  if (oldName !== pets[index].name) {
    write(read().map((row) => (row.pet === oldName ? { ...row, pet: pets[index].name } : row)))
  }
  return pets[index]
}

export async function deletePet(id) {
  await delay()
  writePets(readPets().filter((pet) => String(pet.id) !== String(id)))
}

export async function getLog(id) {
  await delay()
  const found = read().find((row) => String(row.id) === String(id))
  if (!found) throw new Error('Not found')
  return found
}

export async function createLog(input) {
  await delay()
  const created = {
    vet_kind: null,
    next_visit: null,
    ...input,
    id: crypto.randomUUID(),
    happened_at: new Date().toISOString(),
  }
  write([...read(), created])
  return created
}

export async function updateLog(id, input) {
  await delay()
  const rows = read()
  const index = rows.findIndex((row) => String(row.id) === String(id))
  if (index === -1) throw new Error('Not found')
  rows[index] = { ...rows[index], ...input }
  write(rows)
  return rows[index]
}

export async function deleteLog(id) {
  await delay()
  write(read().filter((row) => String(row.id) !== String(id)))
}