import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let dbPath = path.join(__dirname, 'examio.db')

if (process.env.VERCEL) {
  const tempDbPath = path.join('/tmp', 'examio.db')
  if (!fs.existsSync(tempDbPath)) {
    try {
      fs.copyFileSync(dbPath, tempDbPath)
      console.log('Copied SQLite database to /tmp for write access on Vercel.')
    } catch (err) {
      console.error('Failed to copy SQLite database to /tmp:', err)
    }
  }
  dbPath = tempDbPath
}

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

  // Insert default exams (SAT only) safely
  await database.exec(`
    INSERT OR IGNORE INTO exams (id, name, description)
    VALUES ('SAT', 'SAT', 'Scholastic Aptitude Test for competitive college admissions')
  `)
  try {
    await database.exec("DELETE FROM exams WHERE id != 'SAT'")
  } catch (err) {
    console.warn('Failed to delete legacy exams:', err.message)
  }
  console.log('Seeded default exams (SAT only).')
}
