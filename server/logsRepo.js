// The data-access layer for logs, the same shape as m5a3.
//
// Every query is parameterised: values go in the array, never into the string.
// This is the single most important habit in database code, and it is what
// stops "'; DROP TABLE logs; --" in a form field from being a real problem.

// Named columns instead of SELECT *. pg turns a DATE into a JS Date at
// midnight, which can move the day once it becomes JSON. to_char keeps
// next_visit as plain text like '2026-10-04', the same as the mock API.
const COLUMNS = `id, pet, type, member, note, vet_kind,
  to_char(next_visit, 'YYYY-MM-DD') AS next_visit, happened_at`

export async function getAll(pool) {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM logs ORDER BY happened_at DESC`
  )
  return result.rows
}

export async function getById(pool, id) {
  const result = await pool.query(`SELECT ${COLUMNS} FROM logs WHERE id = $1`, [id])
  return result.rows[0] ?? null
}

// happened_at is left out on purpose. The database fills it with now().
export async function create(pool, { pet, type, member, note, vet_kind, next_visit }) {
  const result = await pool.query(
    `INSERT INTO logs (pet, type, member, note, vet_kind, next_visit)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [pet, type, member, note ?? '', vet_kind, next_visit]
  )
  return result.rows[0]
}

// An edit keeps the original happened_at.
export async function update(pool, id, { pet, type, member, note, vet_kind, next_visit }) {
  const result = await pool.query(
    `UPDATE logs
     SET pet = $1, type = $2, member = $3, note = $4, vet_kind = $5, next_visit = $6
     WHERE id = $7
     RETURNING ${COLUMNS}`,
    [pet, type, member, note ?? '', vet_kind, next_visit, id]
  )
  return result.rows[0] ?? null
}

export async function remove(pool, id) {
  const result = await pool.query('DELETE FROM logs WHERE id = $1 RETURNING id', [id])
  return result.rowCount > 0
}