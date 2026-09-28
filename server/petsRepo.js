// The data-access layer for pets, the same shape as logsRepo.js.
//
// Every query is parameterised: values go in the array, never into the string.

// Same to_char reason as logsRepo.js, so birthdate stays '2021-03-14'.
const COLUMNS = `id, name, species, breed,
  to_char(birthdate, 'YYYY-MM-DD') AS birthdate, photo`

// Oldest first, so a new pet lands at the end, the same as after handleAddPet.
export async function getAll(pool) {
  const result = await pool.query(
    `SELECT ${COLUMNS} FROM pets ORDER BY created_at ASC`
  )
  return result.rows
}

export async function create(pool, { name, species, breed, birthdate, photo }) {
  const result = await pool.query(
    `INSERT INTO pets (name, species, breed, birthdate, photo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [name, species, breed ?? '', birthdate, photo]
  )
  return result.rows[0]
}

export async function remove(pool, id) {
  const result = await pool.query('DELETE FROM pets WHERE id = $1 RETURNING id', [id])
  return result.rowCount > 0
}