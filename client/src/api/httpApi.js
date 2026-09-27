// The real client. Every function here talks to YOUR Express API.
//
// This is the file that matters for your finals project. mockApi.js exists so
// you can build the interface before this has anywhere to point.

const BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    // Try to use the API's own message; fall back to the status line.
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // The body was not JSON. The status line is all we have.
    }
    throw new Error(message)
  }

  return response.status === 204 ? null : response.json()
}

export const listLogs = () => request('/api/logs')

export const getLog = (id) => request(`/api/logs/${id}`)

export const createLog = (input) =>
  request('/api/logs', { method: 'POST', body: JSON.stringify(input) })

export const updateLog = (id, input) =>
  request(`/api/logs/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteLog = (id) =>
  request(`/api/logs/${id}`, { method: 'DELETE' })

export const listPets = () => request('/api/pets')

export const createPet = (input) =>
  request('/api/pets', { method: 'POST', body: JSON.stringify(input) })

export const deletePet = (id) =>
  request(`/api/pets/${id}`, { method: 'DELETE' })