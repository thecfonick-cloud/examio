import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb, getDb } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

// Initialize Database on Startup
initDb().then(() => {
  console.log('Database initialized successfully.')
}).catch(err => {
  console.error('Failed to initialize database:', err)
})

// Subjects Mapping for Exams
const EXAM_SUBJECTS = {
  JEE: ['Physics', 'Chemistry', 'Mathematics'],
  NEET: ['Physics', 'Chemistry', 'Biology'],
  UPSC: ['History', 'Polity', 'Geography'],
  SSC: ['Quantitative Aptitude', 'English', 'Reasoning'],
  WBJEE: ['Physics', 'Chemistry', 'Mathematics']
}

// Help helper to calculate the lock time left (24 hours after beginner_completed_at)
function getLockStatus(user) {
  if (!user.beginner_completed_at) {
    return { isLocked: false, timeLeftSeconds: 0 }
  }
  const completedTime = new Date(user.beginner_completed_at).getTime()
  const currentTime = Date.now()
  const lockDuration = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  const timeElapsed = currentTime - completedTime
  const timeLeft = lockDuration - timeElapsed

  if (timeLeft > 0) {
    return { isLocked: true, timeLeftSeconds: Math.ceil(timeLeft / 1000) }
  }
  return { isLocked: false, timeLeftSeconds: 0 }
}

// 1. Authentication Login (Mock)
app.post('/api/auth/login', async (req, res) => {
  const { email, name, targetExam } = req.body
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' })
  }

  try {
    const db = await getDb()
    let user = await db.get('SELECT * FROM users WHERE email = ?', [email])

    if (!user) {
      // Create new user
      const id = 'user_' + Math.random().toString(36).substr(2, 9)
      await db.run(
        'INSERT INTO users (id, email, name, xp, level, target_exam) VALUES (?, ?, ?, ?, ?, ?)',
        [id, email, name, 0, 'Beginner', targetExam || 'JEE']
      )
      user = await db.get('SELECT * FROM users WHERE email = ?', [email])
    }

    const lock = getLockStatus(user)
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      xp: user.xp,
      level: user.level,
      target_exam: user.target_exam || 'JEE',
      beginner_completed_at: user.beginner_completed_at,
      lock
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 2. Get User Status
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params
  try {
    const db = await getDb()
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const lock = getLockStatus(user)
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      xp: user.xp,
      level: user.level,
      target_exam: user.target_exam || 'JEE',
      beginner_completed_at: user.beginner_completed_at,
      lock
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 3. Get Exams list
app.get('/api/exams', async (req, res) => {
  try {
    const db = await getDb()
    const exams = await db.all('SELECT * FROM exams')
    const enrichedExams = exams.map(exam => ({
      ...exam,
      subjects: EXAM_SUBJECTS[exam.id] || []
    }))
    res.json(enrichedExams)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 4. Get Questions for a test
app.get('/api/exams/:examId/questions', async (req, res) => {
  const { examId } = req.params
  const { subject, difficulty, userId } = req.query

  if (!subject || !difficulty || !userId) {
    return res.status(400).json({ error: 'Subject, difficulty, and userId are required parameters' })
  }

  try {
    const db = await getDb()
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check global lockout (24-hour cooldown after completing beginner)
    const lock = getLockStatus(user)
    if (lock.isLocked) {
      return res.status(403).json({
        error: `All exams are locked. Cooldown ends in ${Math.ceil(lock.timeLeftSeconds / 60)} minutes (24h cooldown).`,
        lock
      })
    }

    // Check progression locks
    const userLevel = user.level // 'Beginner', 'Intermediate', 'Advanced'

    if (difficulty === 'Intermediate') {
      if (userLevel === 'Beginner') {
        return res.status(403).json({
          error: 'Progression Lock: You must pass a Beginner exam to unlock Intermediate levels.'
        })
      }
    }

    if (difficulty === 'Advanced' || difficulty === 'Expert') {
      if (userLevel === 'Beginner' || userLevel === 'Intermediate') {
        return res.status(403).json({
          error: 'Progression Lock: You must pass an Intermediate exam to unlock Advanced levels.'
        })
      }
    }

    // Fetch questions from DB (handling both Advanced and Expert naming)
    const targetDiff = difficulty === 'Expert' ? 'Advanced' : difficulty
    const questions = await db.all(
      'SELECT id, exam_id, subject, difficulty, question_text, options FROM questions WHERE exam_id = ? AND subject = ? AND (difficulty = ? OR difficulty = ?)',
      [examId, subject, targetDiff, targetDiff === 'Advanced' ? 'Expert' : 'Advanced']
    )

    // Format options as JSON array, and hide answers/explanations from network
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      exam_id: q.exam_id,
      subject: q.subject,
      difficulty: q.difficulty,
      question_text: q.question_text,
      options: JSON.parse(q.options)
    }))

    res.json(formattedQuestions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 5. Submit Test and Calculate Score/XP
app.post('/api/exams/submit', async (req, res) => {
  const { userId, examId, subject, difficulty, answers } = req.body // answers = { qId: selectedOption }

  if (!userId || !examId || !subject || !difficulty || !answers) {
    return res.status(400).json({ error: 'Missing submission parameters' })
  }

  try {
    const db = await getDb()
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId])
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Fetch full questions to score
    const questions = await db.all(
      'SELECT * FROM questions WHERE exam_id = ? AND subject = ? AND difficulty = ?',
      [examId, subject, difficulty]
    )

    if (questions.length === 0) {
      return res.status(400).json({ error: 'No questions found for this exam module.' })
    }

    let correctAnswersCount = 0
    const resultsOverview = []

    questions.forEach(q => {
      const selected = answers[q.id]
      const isCorrect = selected === q.correct_answer
      if (isCorrect) {
        correctAnswersCount++
      }
      resultsOverview.push({
        id: q.id,
        question_text: q.question_text,
        options: JSON.parse(q.options),
        selectedAnswer: selected || null,
        correctAnswer: q.correct_answer,
        isCorrect,
        explanation: q.explanation
      })
    })

    const score = correctAnswersCount * 10
    const accuracy = parseFloat(((correctAnswersCount / questions.length) * 100).toFixed(2))

    // XP calculation: 10 XP per correct answer + 50 XP completion bonus + 30 XP high accuracy bonus (>80%)
    let xpEarned = correctAnswersCount * 10 + 50
    if (accuracy >= 80) {
      xpEarned += 30
    }

    // Record test result
    const createdAt = new Date().toISOString()
    await db.run(
      `INSERT INTO results (user_id, exam_id, subject, difficulty, score, total_questions, correct_answers, accuracy, xp_earned, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, examId, subject, difficulty, score, questions.length, correctAnswersCount, accuracy, xpEarned, createdAt]
    )

    // Progression Updates
    let newLevel = user.level
    let beginnerCompletedAt = user.beginner_completed_at
    const passed = accuracy >= 50

    if (difficulty === 'Beginner') {
      beginnerCompletedAt = new Date().toISOString()
      if (passed && user.level === 'Beginner') {
        newLevel = 'Intermediate'
      }
      await db.run(
        'UPDATE users SET xp = xp + ?, level = ?, beginner_completed_at = ? WHERE id = ?',
        [xpEarned, newLevel, beginnerCompletedAt, userId]
      )
    } else if (difficulty === 'Intermediate') {
      if (passed && user.level === 'Intermediate') {
        newLevel = 'Advanced'
      }
      await db.run(
        'UPDATE users SET xp = xp + ?, level = ? WHERE id = ?',
        [xpEarned, newLevel, userId]
      )
    } else {
      await db.run(
        'UPDATE users SET xp = xp + ?, level = ? WHERE id = ?',
        [xpEarned, newLevel, userId]
      )
    }

    // Fetch updated user to generate response lock data
    const updatedUser = await db.get('SELECT * FROM users WHERE id = ?', [userId])
    const lock = getLockStatus(updatedUser)

    res.json({
      score,
      totalQuestions: questions.length,
      correctAnswers: correctAnswersCount,
      accuracy,
      xpEarned,
      newLevel,
      lock,
      resultsOverview
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 5.5. Get User Test Results History
app.get('/api/users/:userId/results', async (req, res) => {
  const { userId } = req.params
  try {
    const db = await getDb()
    const results = await db.all(
      'SELECT * FROM results WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )
    res.json(results)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 6. Get Leaderboard (Global & Exam-wise)
app.get('/api/leaderboard', async (req, res) => {
  const { examId } = req.query

  try {
    const db = await getDb()

    if (examId) {
      // Exam-wise ranking: Aggregated by score and XP in specific exam
      const examRankings = await db.all(`
        SELECT u.id, u.name, u.level, SUM(r.score) as total_score, SUM(r.xp_earned) as exam_xp, COUNT(r.id) as tests_taken
        FROM users u
        JOIN results r ON u.id = r.user_id
        WHERE r.exam_id = ?
        GROUP BY u.id
        ORDER BY exam_xp DESC
        LIMIT 20
      `, [examId])

      res.json({
        type: 'exam',
        examId,
        rankings: examRankings
      })
    } else {
      // Global ranking: sorted by total XP
      const globalRankings = await db.all(`
        SELECT id, name, xp, level
        FROM users
        ORDER BY xp DESC
        LIMIT 20
      `)

      res.json({
        type: 'global',
        rankings: globalRankings
      })
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// 7. Bulk Question Import API
app.post('/api/questions/import', async (req, res) => {
  const questionsList = req.body // array of questions

  if (!Array.isArray(questionsList)) {
    return res.status(400).json({ error: 'Payload must be a JSON array of questions.' })
  }

  try {
    const db = await getDb()
    const stmt = await db.prepare(`
      INSERT INTO questions (exam_id, subject, difficulty, question_text, options, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    let importedCount = 0
    for (const q of questionsList) {
      const { exam, subject, difficulty, question, options, correctAnswer, explanation } = q

      if (!exam || !subject || !difficulty || !question || !options || !correctAnswer) {
        continue // skip malformed records
      }

      await stmt.run(
        exam,
        subject,
        difficulty,
        question,
        JSON.stringify(options),
        correctAnswer,
        explanation || ''
      )
      importedCount++
    }

    await stmt.finalize()
    res.json({ message: `Successfully imported ${importedCount} questions.` })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error during import' })
  }
})

// 8. Development Seeding API (Imports mock questions & mock users)
app.post('/api/dev/seed', async (req, res) => {
  try {
    const db = await getDb()
    const filePath = path.join(__dirname, 'mock_questions.json')
    const rawData = fs.readFileSync(filePath, 'utf8')
    const questionsList = JSON.parse(rawData)

    // Clear existing questions first to allow clean re-seed
    await db.run('DELETE FROM questions')

    const stmt = await db.prepare(`
      INSERT INTO questions (exam_id, subject, difficulty, question_text, options, correct_answer, explanation)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    let importedCount = 0
    for (const q of questionsList) {
      await stmt.run(
        q.exam,
        q.subject,
        q.difficulty,
        q.question,
        JSON.stringify(q.options),
        q.correctAnswer,
        q.explanation || ''
      )
      importedCount++
    }
    await stmt.finalize()

    // --- MOCK USER SEEDING (50 USERS) ---
    // 1. Clean existing mock users and their associated results
    await db.run("DELETE FROM results WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@mock.com')")
    await db.run("DELETE FROM users WHERE email LIKE '%@mock.com'")

    // 2. Generate 50 realistic Indian scholar profiles
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

    for (const u of mockUsers) {
      // Generate 2 to 6 test results for each user to populate exam-wise tables
      const numResults = Math.floor(Math.random() * 5) + 2
      let totalXp = 0
      
      for (let j = 0; j < numResults; j++) {
        // High likelihood to practice in target exam
        const examId = Math.random() < 0.7 ? u.targetExam : exams[Math.floor(Math.random() * exams.length)]
        const subjects = subjectsMap[examId]
        const subject = subjects[Math.floor(Math.random() * subjects.length)]
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
        
        const totalQuestions = 10
        const correctAnswers = Math.floor(Math.random() * 6) + 4 // 40% to 100% correct
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
        const score = correctAnswers * 10
        
        const xpEarned = 10 + (correctAnswers * 5) // Base + performance XP
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

    res.json({ 
      message: `Successfully seeded database with ${importedCount} questions and 50 mock scholars.` 
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error during seeding' })
  }
})

// Start server (only if not on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

export default app
