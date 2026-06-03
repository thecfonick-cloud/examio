import { getDb } from './db.js'

async function clear() {
  try {
    const db = await getDb()
    await db.run('DELETE FROM results')
    await db.run('DELETE FROM users')
    console.log('Database cleared: All users and results removed successfully.')
    process.exit(0)
  } catch (err) {
    console.error('Failed to clear database tables:', err)
    process.exit(1)
  }
}

clear()
