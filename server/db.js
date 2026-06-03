import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'examio.db')

let db = null

export async function getDb() {
  if (db) return db
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })
  
  return db
}

export async function initDb() {
  const database = await getDb()
  
  // Enable foreign keys
  await database.exec('PRAGMA foreign_keys = ON;')
  
  // Create users table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level TEXT DEFAULT 'Beginner',
      beginner_completed_at TEXT,
      target_exam TEXT
    );
  `)

  // Migrate existing users table if target_exam is missing
  const tableInfo = await database.all("PRAGMA table_info(users)")
  const hasTargetExam = tableInfo.some(col => col.name === 'target_exam')
  if (!hasTargetExam) {
    await database.exec("ALTER TABLE users ADD COLUMN target_exam TEXT;")
    console.log("Migrated users table: added target_exam column.")
  }
  
  // Create exams table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT
    );
  `)
  
  // Create questions table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      question_text TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON string array
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      FOREIGN KEY(exam_id) REFERENCES exams(id)
    );
  `)
  
  // Create results table
  await database.exec(`
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      exam_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      correct_answers INTEGER NOT NULL,
      accuracy REAL NOT NULL,
      xp_earned INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(exam_id) REFERENCES exams(id)
    );
  `)

  // Insert default exams if not present
  const examCount = await database.get('SELECT COUNT(*) as count FROM exams')
  if (examCount.count === 0) {
    const stmt = await database.prepare('INSERT INTO exams (id, name, description) VALUES (?, ?, ?)')
    await stmt.run('JEE', 'JEE', 'Joint Entrance Examination for engineering aspirants')
    await stmt.run('NEET', 'NEET', 'National Eligibility cum Entrance Test for medical aspirants')
    await stmt.run('UPSC', 'UPSC', 'Union Public Service Commission civil services examination')
    await stmt.run('SSC', 'SSC', 'Staff Selection Commission for government posts')
    await stmt.run('WBJEE', 'WBJEE', 'West Bengal Joint Entrance Examination')
    await stmt.finalize()
    console.log('Seeded default exams.')
  }
}
