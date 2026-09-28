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

// A log keeps the pet NAME, so a rename must also rename that pet's logs,
// or the pet loses its history. Both updates run in one transaction, so
// either both are saved or neither is.
//
// pool.query cannot do this, because each call may use a different
// connection. A transaction needs one client from start to end.
export async function update(pool, id, { name, species, breed, birthdate, photo }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const found = await client.query('SELECT name FROM pets WHERE id = $1 FOR UPDATE', [id])
    if (found.rowCount === 0) {
      await client.query('ROLLBACK')
      return null
    }

    const result = await client.query(
      `UPDATE pets
       SET name = $1, species = $2, breed = $3, birthdate = $4, photo = $5
       WHERE id = $6
       RETURNING ${COLUMNS}`,
      [name, species, breed ?? '', birthdate, photo, id]
    )

    const oldName = found.rows[0].name
    if (oldName !== name) {
      await client.query('UPDATE logs SET pet = $1 WHERE pet = $2', [name, oldName])
    }

    await client.query('COMMIT')
    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function remove(pool, id) {
  const result = await pool.query('DELETE FROM pets WHERE id = $1 RETURNING id', [id])
  return result.rowCount > 0
}