import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath = path.join(__dirname, 'examio.db')
const questionsPath = path.join(__dirname, 'mock_questions.json')

async function runSeed() {
  console.log('Opening database for full questions & mock user seeding...')
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  // 1. SEED QUESTIONS
  console.log('Clearing existing questions...')
  await db.run('DELETE FROM questions')

  const questionsList = JSON.parse(fs.readFileSync(questionsPath, 'utf8'))
  console.log(`Loaded ${questionsList.length} questions. Inserting...`)

  const qStmt = await db.prepare(`
    INSERT INTO questions (exam_id, subject, difficulty, question_text, options, correct_answer, explanation)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  let questionsImported = 0
  for (const q of questionsList) {
    await qStmt.run(
      q.exam,
      q.subject,
      q.difficulty,
      q.question,
      JSON.stringify(q.options),
      q.correctAnswer,
      q.explanation || ''
    )
    questionsImported++
  }
  await qStmt.finalize()
  console.log(`Successfully seeded ${questionsImported} questions.`)

  // 2. SEED MOCK USERS & RESULTS (Indian Scholars)
  console.log('Clearing existing mock users and results...')
  await db.run("DELETE FROM results WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@mock.com')")
  await db.run("DELETE FROM users WHERE email LIKE '%@mock.com'")

  const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Priya', 'Ananya', 'Sanya', 'Diya', 'Kavya', 'Riya', 'Isha', 'Aanya', 'Kiara', 'Aadhya', 'Amit', 'Rajesh', 'Sunil', 'Sanjay', 'Vikram', 'Rohan', 'Kunal', 'Sneha', 'Neha', 'Pooja', 'Rahul', 'Manoj', 'Deepak', 'Alok', 'Vivek', 'Jyoti', 'Kiran', 'Nisha', 'Meera', 'Ritu', 'Anjali', 'Swati', 'Mona', 'Preeti', 'Karan', 'Arpit', 'Abhishek', 'Varun', 'Siddharth', 'Nikhil']
  const lastNames = ['Mehta', 'Sharma', 'Patel', 'Sen', 'Joshi', 'Gupta', 'Verma', 'Kumar', 'Singh', 'Nair', 'Iyer', 'Reddy', 'Choudhury', 'Das', 'Roy', 'Banerjee', 'Chatterjee', 'Mishra', 'Pandey', 'Trivedi', 'Bose', 'Dutta', 'Rao', 'Shah', 'Desai', 'Gawde', 'Kulkarni', 'Naik', 'Patil', 'Pillai', 'Menon', 'Shetty', 'Hegde', 'Gowda', 'Prasad', 'Sinha', 'Chawla', 'Kapoor', 'Malhotra', 'Bhasin', 'Gill', 'Dhillon', 'Sandhu', 'Sodhi', 'Grewal', 'Johal', 'Sidhu', 'Mann', 'Brar', 'Sekhon']

  const exams = ['JEE', 'NEET', 'UPSC', 'SSC', 'WBJEE']
  const subjectsMap = {
    JEE: ['Physics', 'Chemistry', 'Mathematics'],
    NEET: ['Physics', 'Chemistry', 'Biology'],
    UPSC: ['History', 'Polity', 'Geography'],
    SSC: ['Quantitative Aptitude', 'English', 'Reasoning'],
    WBJEE: ['Physics', 'Chemistry', 'Mathematics']
  }
  const difficulties = ['Beginner', 'Intermediate', 'Advanced']

  const mockUsers = []
  for (let i = 1; i <= 50; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const name = `${fName} ${lName}`
    const email = `scholar_${i}@mock.com`
    const id = `mock_user_${i}`
    const targetExam = exams[Math.floor(Math.random() * exams.length)]
    
    mockUsers.push({ id, name, email, targetExam })
  }

  const userStmt = await db.prepare('INSERT INTO users (id, email, name, xp, level, target_exam) VALUES (?, ?, ?, ?, ?, ?)')
  const resultStmt = await db.prepare(`
    INSERT INTO results (user_id, exam_id, subject, difficulty, score, total_questions, correct_answers, accuracy, xp_earned, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  let resultsCount = 0
  for (const u of mockUsers) {
    const numResults = Math.floor(Math.random() * 5) + 2
    let totalXp = 0
    
    for (let j = 0; j < numResults; j++) {
      const examId = Math.random() < 0.7 ? u.targetExam : exams[Math.floor(Math.random() * exams.length)]
      const subjects = subjectsMap[examId]
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
      
      const totalQuestions = 10
      const correctAnswers = Math.floor(Math.random() * 6) + 4
      const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
      const score = correctAnswers * 10
      
      const xpEarned = 10 + (correctAnswers * 5)
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
      resultsCount++
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
  console.log(`Successfully seeded ${mockUsers.length} mock users and ${resultsCount} test results!`)
}

runSeed().catch(err => {
  console.error('Error seeding database:', err)
})
