import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'
import * as logs from './logsRepo.js'
import * as pets from './petsRepo.js'

const app = express()

// CORS before the routes. Middleware registered after a route never sees that
// route's requests, which is the m4 lesson showing up in production.
//
// Name your origins. app.use(cors()) with no options sends
// Access-Control-Allow-Origin: *, which lets any site on the internet call this
// API from a visitor's browser, and is incompatible with cookies.
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))

// 1mb and not 100kb, because a pet photo arrives as a base64 string.
// The client already shrinks it to 400px first.
app.use(express.json({ limit: '1mb' }))

// Is the process alive?
app.get('/healthz', (request, response) => {
  response.json({ ok: true })
})

// Is the database reachable? A different question, and the one that tells you
// in two seconds which half of a problem you have.
app.get('/readyz', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true, db: 'up' })
  } catch (error) {
    console.error('readyz failed:', error.message)
    response.status(503).json({ ok: false, db: 'down' })
  }
})

// Same lists as format.js on the client. The server keeps its own copy
// because the client can be bypassed.
const TYPES = ['fed', 'walk', 'pee', 'poop', 'vet']
const VET_KINDS = ['vaccine', 'checkup', 'treatment']

const text = (value) => (typeof value === 'string' ? value.trim() : '')

// A plain date like '2026-10-04', or empty. Empty is saved as null.
const isDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime())

// Validation lives on the server because the client can be bypassed. The
// browser form is for a fast, friendly message; this is for correctness.
function validateLog(body) {
  const errors = []
  const pet = text(body.pet)
  const type = text(body.type)
  const member = text(body.member)
  const note = text(body.note)
  const nextVisit = text(body.next_visit)

  if (!pet) errors.push('pet is required')
  if (pet.length > 60) errors.push('pet must be 60 characters or fewer')
  if (!TYPES.includes(type)) errors.push(`type must be one of ${TYPES.join(', ')}`)
  if (!member) errors.push('member is required')
  if (member.length > 60) errors.push('member must be 60 characters or fewer')
  if (note.length > 2000) errors.push('note must be 2000 characters or fewer')

  // Only a vet log carries the two vet fields. Every other log gets null,
  // so the shape of a row never changes.
  let vet_kind = null
  let next_visit = null
  if (type === 'vet') {
    vet_kind = text(body.vet_kind)
    if (!VET_KINDS.includes(vet_kind)) {
      errors.push(`vet_kind must be one of ${VET_KINDS.join(', ')}`)
    }
    if (nextVisit && !isDate(nextVisit)) errors.push('next_visit must be a date like 2026-10-04')
    next_visit = nextVisit || null
  }

  return { errors, value: { pet, type, member, note, vet_kind, next_visit } }
}

function validatePet(body) {
  const errors = []
  const name = text(body.name)
  const species = text(body.species)
  const breed = text(body.breed)
  const birthdate = text(body.birthdate)
  const photo = text(body.photo)

  if (!name) errors.push('name is required')
  if (name.length > 60) errors.push('name must be 60 characters or fewer')
  if (!species) errors.push('species is required')
  if (species.length > 40) errors.push('species must be 40 characters or fewer')
  if (breed.length > 60) errors.push('breed must be 60 characters or fewer')
  if (birthdate && !isDate(birthdate)) errors.push('birthdate must be a date like 2021-03-14')
  if (photo && !photo.startsWith('data:image/')) errors.push('photo must be an image')

  return {
    errors,
    value: { name, species, breed, birthdate: birthdate || null, photo: photo || null },
  }
}

// ---------- Logs ----------

app.get('/api/logs', async (request, response, next) => {
  try {
    response.json(await logs.getAll(pool))
  } catch (error) {
    next(error)
  }
})

app.get('/api/logs/:id', async (request, response, next) => {
  try {
    const row = await logs.getById(pool, request.params.id)
    if (!row) return response.status(404).json({ error: 'Not found' })
    response.json(row)
  } catch (error) {
    next(error)
  }
})

app.post('/api/logs', async (request, response, next) => {
  const { errors, value } = validateLog(request.body ?? {})
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })

  try {
    response.status(201).json(await logs.create(pool, value))
  } catch (error) {
    next(error)
  }
})

app.put('/api/logs/:id', async (request, response, next) => {
  const { errors, value } = validateLog(request.body ?? {})
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })

  try {
    const row = await logs.update(pool, request.params.id, value)
    if (!row) return response.status(404).json({ error: 'Not found' })
    response.json(row)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/logs/:id', async (request, response, next) => {
  try {
    const removed = await logs.remove(pool, request.params.id)
    if (!removed) return response.status(404).json({ error: 'Not found' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

// ---------- Pets ----------

app.get('/api/pets', async (request, response, next) => {
  try {
    response.json(await pets.getAll(pool))
  } catch (error) {
    next(error)
  }
})

app.post('/api/pets', async (request, response, next) => {
  const { errors, value } = validatePet(request.body ?? {})
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })

  try {
    response.status(201).json(await pets.create(pool, value))
  } catch (error) {
    next(error)
  }
})

// A rename also renames the pet's logs. See update in petsRepo.js.
app.put('/api/pets/:id', async (request, response, next) => {
  const { errors, value } = validatePet(request.body ?? {})
  if (errors.length > 0) return response.status(400).json({ error: errors.join('; ') })

  try {
    const row = await pets.update(pool, request.params.id, value)
    if (!row) return response.status(404).json({ error: 'Not found' })
    response.json(row)
  } catch (error) {
    next(error)
  }
})

// The logs keep the pet name, so removing a pet does not erase their history.
app.delete('/api/pets/:id', async (request, response, next) => {
  try {
    const removed = await pets.remove(pool, request.params.id)
    if (!removed) return response.status(404).json({ error: 'Not found' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use((request, response) => {
  response.status(404).json({ error: 'No such route' })
})

// The detail goes in your logs; the visitor gets a plain message. Sending a
// stack trace to a stranger tells them about your file layout and dependencies.
app.use((error, request, response, next) => {
  // 22P02 is Postgres saying the id is not a valid uuid. That is bad input
  // from the client, not a server failure.
  if (error.code === '22P02') return response.status(400).json({ error: 'Invalid id' })
  // express.json could not read the body. Also bad input, not a server failure.
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'The request body is not valid JSON' })
  }
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ error: 'The request is too large' })
  }
  console.error(error)
  response.status(500).json({ error: 'Something went wrong on the server' })
})

// The host chooses the port and tells you through PORT. Hardcoding 3000 is the
// commonest reason a first deploy is marked unhealthy and killed.
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})