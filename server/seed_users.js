import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'examio.db')

async function runSeed() {
  console.log('Opening database for mock user seeding...')
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  // Clear existing mock users
  await db.run("DELETE FROM results WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@mock.com')")
  await db.run("DELETE FROM users WHERE email LIKE '%@mock.com'")
  console.log('Cleared existing mock users.')

  // Generate 50 realistic global scholar profiles
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Sandra', 'Mark', 'Margaret', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Melissa', 'George', 'Deborah', 'Timothy', 'Stephanie']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts']

  const exams = ['SAT']
  const subjectsMap = {
    SAT: ['SAT Math', 'SAT Reading', 'SAT Writing & Language']
  }
  const difficulties = ['Beginner', 'Intermediate', 'Advanced']

  const mockUsers = []
  for (let i = 1; i <= 50; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${fName} ${lName}`
    const email = `scholar_${i}@mock.com`
    const id = `mock_user_${i}`
    const targetExam = 'SAT'
    
    mockUsers.push({ id, name, email, targetExam })
  }

  const userStmt = await db.prepare('INSERT INTO users (id, email, name, xp, level, target_exam) VALUES (?, ?, ?, ?, ?, ?)')
  const resultStmt = await db.prepare(`
    INSERT INTO results (user_id, exam_id, subject, difficulty, score, total_questions, correct_answers, accuracy, xp_earned, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const u of mockUsers) {
    const numResults = Math.floor(Math.random() * 5) + 2
    let totalXp = 0
    
    for (let j = 0; j < numResults; j++) {
      const examId = 'SAT'
      const subjects = subjectsMap[examId]
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      
      const totalQuestions = 5
      const correctAnswers = Math.floor(Math.random() * 3) + 2 // 2 to 5 correct
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
      const score = correctAnswers * 20
      
      const xpEarned = 10 + (correctAnswers * 10)
      totalXp += xpEarned
      
      const date = new Date()
      date.setDate(date.getDate() - Math.floor(Math.random() * 15))
      const createdAt = date.toISOString()
      
      await resultStmt.run(
        u.id,
        examId,
        subject,
        difficulty,
        score,
        totalQuestions,
        correctAnswers,
        accuracy,
        xpEarned,
        createdAt
      )
    }
    
    let level = 'Beginner'
    if (totalXp >= 200 && totalXp < 600) level = 'Intermediate'
    if (totalXp >= 600) level = 'Advanced'
    
    await userStmt.run(
      u.id,
      u.email,
      u.name,
      totalXp,
      level,
      u.targetExam
    )
  }

  await userStmt.finalize()
  await resultStmt.finalize()
  await db.close()
  console.log('Successfully seeded database with 50 mock users and practice results!')
}

runSeed().catch(err => {
  console.error('Error seeding mock users:', err)
})
