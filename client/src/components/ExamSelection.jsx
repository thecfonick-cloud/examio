import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Zap, Flame, ShieldAlert, BookOpen, HelpCircle, Lock, CheckCircle2, Trophy, Sparkles, Clock, Target, ArrowRight } from 'lucide-react'

export default function ExamSelection({ user, onSelectExam, fetchUserStatus, onOpenStats }) {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Selected subject per exam: { examId: subjectName }
  const [selectedSubjects, setSelectedSubjects] = useState({})
  
  // Target SAT track by default
  const [activeExamId, setActiveExamId] = useState('SAT')
  
  const [countdown, setCountdown] = useState(0)
  const [lockModalInfo, setLockModalInfo] = useState(null)
  const [rulesModalInfo, setRulesModalInfo] = useState(null)

  // Practice history state for syllabus coverage mastery display
  const [resultsHistory, setResultsHistory] = useState([])

  // Load exams
  useEffect(() => {
    async function loadExams() {
      try {
        const response = await fetch('/api/exams')
        const data = await response.json()
        if (response.ok) {
          setExams(data)
          // Set initial subjects
          const initial = {}
          data.forEach(exam => {
            if (exam.subjects && exam.subjects.length > 0) {
              initial[exam.id] = exam.subjects[0]
            }
          })
          setSelectedSubjects(initial)
        } else {
          setError(data.error || 'Failed to load exams')
        }
      } catch (err) {
        setError('Failed to load exams from backend.')
      } finally {
        setLoading(false)
      }
    }
    loadExams()
  }, [])

  // Fetch Practice History
  useEffect(() => {
    async function fetchHistory() {
      if (!user?.id) return
      try {
        const res = await fetch(`/api/users/${user.id}/results`)
        const data = await res.json()
        if (res.ok) {
          setResultsHistory(data)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchHistory()
  }, [user?.id, user?.xp])

  // Lock Modal Timer
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const formatCountdown = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubjectChange = (examId, subject) => {
    setSelectedSubjects(prev => ({
      ...prev,
      [examId]: subject
    }))
  }

  const handleLevelClick = (examId, difficulty, currentSubject) => {
    const userLevel = user.level || 'Beginner'
    const isLocked = user.lock?.isLocked
    const timeLeft = user.lock?.timeLeftSeconds || 0

    if (isLocked) {
      setCountdown(timeLeft)
      setLockModalInfo({
        level: difficulty,
        desc: 'You recently completed a Beginner exam! A 24-hour verification lock is active. Take a break before trying any other exam module.'
      })
      return
    }

    if (difficulty === 'Intermediate') {
      if (userLevel === 'Beginner') {
        alert('Progression Lock: Complete a Beginner exam first to unlock Intermediate!')
        return
      }
    }

    if (difficulty === 'Advanced') {
      if (userLevel === 'Beginner' || userLevel === 'Intermediate') {
        alert('Progression Lock: Complete an Intermediate level exam to unlock Advanced!')
        return
      }
    }

    // Show the rules screen first instead of launching immediately
    setRulesModalInfo({ examId, difficulty, subject: currentSubject })
  }

  // Calculate Streak based on consecutive practice days
  const getActiveStreak = (history) => {
    if (!history || history.length === 0) return 0
    
    // Extract unique dates in YYYY-MM-DD
    const dates = [...new Set(history.map(h => new Date(h.created_at).toDateString()))]
      .map(d => new Date(d))
      .sort((a, b) => b - a)

    const todayStr = new Date().toDateString()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toDateString()
    
    const mostRecentStr = dates[0] ? dates[0].toDateString() : ''
    if (mostRecentStr !== todayStr && mostRecentStr !== yesterdayStr) {
      return 0
    }

    let streak = 1
    let checkDate = dates[0]

    for (let i = 1; i < dates.length; i++) {
      const nextDate = dates[i]
      const diff = (checkDate - nextDate) / (1000 * 60 * 60 * 24)
      if (diff === 1) {
        streak++
        checkDate = nextDate
      } else if (diff > 1) {
        break
      }
    }
    return streak
  }

  const streakDays = getActiveStreak(resultsHistory)

  // Calculate Performance overview stats
  const averageAccuracy = resultsHistory.length > 0 
    ? Math.round(resultsHistory.reduce((sum, r) => sum + r.accuracy, 0) / resultsHistory.length) 
    : 0

  const totalQuestionsAttempted = resultsHistory.reduce((sum, r) => sum + r.total_questions, 0)
  const totalQuestionsSolved = resultsHistory.reduce((sum, r) => sum + r.correct_answers, 0)
  const testsCompleted = resultsHistory.length
  const studyHours = ((resultsHistory.reduce((sum, r) => sum + (r.total_questions * 2), 0)) / 60).toFixed(1)

  // Get active exam object
  const activeExam = exams.find(e => e.id === activeExamId) || exams[0]
  const activeSubject = selectedSubjects[activeExamId] || (activeExam?.subjects?.[0] || '')

  // Calculate Level Progression
  const getLevelProgress = () => {
    const xp = user.xp || 0
    if (user.level === 'Beginner') {
      return { percent: Math.min(100, (xp / 200) * 100), nextXp: 200, label: 'Intermediate' }
    }
    if (user.level === 'Intermediate') {
      return { percent: Math.min(100, ((xp - 200) / 400) * 100), nextXp: 600, label: 'Advanced' }
    }
    return { percent: Math.min(100, ((xp - 600) / 900) * 100), nextXp: 1500, label: 'Elite Master' }
  }

  const progress = getLevelProgress()

  // Achievement Badges
  const achievements = [
    { id: 'acc_master', title: 'Speed Scholar', desc: '90%+ accuracy on any test', icon: '🎯', unlocked: resultsHistory.some(r => r.accuracy >= 90) },
    { id: 'streak_pioneer', title: 'Consistency King', desc: 'Maintain a 3-day active streak', icon: '🔥', unlocked: streakDays >= 3 },
    { id: 'xp_champion', title: 'XP Elite', desc: 'Accumulate 500+ XP points', icon: '⚡', unlocked: user.xp >= 500 },
    { id: 'multi_exam', title: 'Polymath', desc: 'Practice in 2+ SAT sections', icon: '🧠', unlocked: new Set(resultsHistory.map(r => r.subject)).size >= 2 }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-indigo-500 font-bold text-sm">
        <Sparkles className="h-5 w-5 animate-spin mr-2" /> Syncing Lobby...
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-red-50 text-red-700 rounded-xl border border-red-150 text-center shadow-sm">
        <h3 className="font-bold text-lg">Sync Error</h3>
        <p className="mt-2 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-8 font-sans select-none">
      
      {/* 1. Large Premium Hero Banner */}
      <div className="welcome-banner-premium relative overflow-hidden rounded-3xl p-6 md:p-8 flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
        
        {/* Left Side: Avatar & Greetings */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left z-10 w-full lg:max-w-2xl">
          <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-extrabold text-2xl md:text-3xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
            {user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'A'}
          </div>
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              <Zap className="h-3 w-3 fill-indigo-550 shrink-0" /> Mission Control Active
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight font-display">
              Welcome back, {user.name}! 🎓
            </h1>
            
            {/* Progression details */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-wide">
                <span>Tier: {user.level} ({user.xp} XP)</span>
                <span className="text-indigo-600">Next Target: {progress.label} ({progress.nextXp} XP)</span>
              </div>
              <div className="w-full h-2 bg-indigo-100/50 rounded-full overflow-hidden border border-indigo-200/20">
                <div 
                  className="h-full glow-bar-fill rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Key Resume Arena Action */}
        <div className="flex items-center justify-center lg:justify-end z-10 shrink-0 w-full lg:w-auto">
          <button
            onClick={() => handleLevelClick(activeExamId, user.level === 'Beginner' ? 'Beginner' : user.level === 'Intermediate' ? 'Intermediate' : 'Advanced', activeSubject)}
            className="px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] shrink-0"
          >
            Resume Arena <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. Main Content Focused Area */}
      <div className="space-y-8">
        
        {/* Section A: Active Exam Arena */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black uppercase text-slate-550 tracking-wider">1. Active Exam Arena</h2>
          </div>

          {activeExam && (
            <div className="premium-card p-6 relative overflow-hidden text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 select-none border border-indigo-200/50 bg-indigo-50/5 ring-1 ring-indigo-500/5 shadow-md">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-550 via-purple-500 to-cyan-500 opacity-80" />
              
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-black uppercase tracking-wider">
                    {activeExam.id}
                  </span>
                  <span className="bg-indigo-50 border border-indigo-200/60 text-indigo-750 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Primary Target Track
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-none">{activeExam.name}</h3>
                  <p className="text-slate-650 text-[10.5px] font-bold leading-relaxed mt-2 max-w-xl">
                    {activeExam.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end shrink-0 sm:text-right">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Syllabus Coverage</span>
                <span className="text-xs font-black text-indigo-600 mt-1">{activeExam.subjects?.length || 0} Core Modules</span>
              </div>
            </div>
          )}
        </div>

        {/* Section B: Visual Subject Cards */}
        {activeExam && (
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-550 tracking-wider">2. Subject syllabus modules</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeExam.subjects?.map((sub) => {
                const isActive = activeSubject === sub
                
                // Calculate Subject specific attempts and metrics
                const attempts = resultsHistory.filter(r => r.exam_id === activeExam.id && r.subject === sub)
                const avgAcc = attempts.length > 0 
                  ? Math.round(attempts.reduce((sum, r) => sum + r.accuracy, 0) / attempts.length) 
                  : 0
                
                // Mastery calculations
                const mastery = attempts.length === 0 ? 'Novice' :
                                attempts.length === 1 ? 'Apprentice' :
                                attempts.length === 2 ? 'Specialist (L1)' :
                                attempts.length < 5 ? 'Master (L2)' : 'Grandmaster (L3)'
                
                const uniqueDifficulties = new Set(attempts.map(r => r.difficulty)).size
                const completionPercent = uniqueDifficulties === 1 ? 33 : uniqueDifficulties === 2 ? 66 : uniqueDifficulties === 3 ? 100 : 0

                return (
                  <div
                    key={sub}
                    onClick={() => handleSubjectChange(activeExam.id, sub)}
                    className={`premium-card p-5 relative overflow-hidden text-left cursor-pointer flex flex-col justify-between min-h-[150px] select-none transition-all ${
                      isActive 
                        ? 'ring-2 ring-indigo-500/85 border-indigo-200/50 bg-indigo-50/5' 
                        : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-550 opacity-80" />
                    
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-indigo-550 shrink-0" />
                        <span className="text-xs font-black text-slate-700 tracking-tight">{sub}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                        mastery === 'Novice' ? 'bg-slate-100 text-slate-600' :
                        mastery.startsWith('Bronze') || mastery === 'Apprentice' ? 'bg-amber-100/50 text-amber-700 border border-amber-100' :
                        mastery.startsWith('Specialist') ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                        'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {mastery}
                      </span>
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between items-center text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                        <span>Progress: {completionPercent}%</span>
                        {attempts.length > 0 && <span>Acc: {avgAcc}%</span>}
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/30">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${completionPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Section C: Journey Pathway & Difficulty (Rules) */}
        {activeExam && activeSubject && (
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-550 tracking-wider">3. Journey Pathway & difficulty</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              
              {['Beginner', 'Intermediate', 'Advanced'].map((diff, index) => {
                const nodeIndex = `0${index + 1}`
                const userLevel = user.level || 'Beginner'
                const isLocked = (diff === 'Intermediate' && userLevel === 'Beginner') ||
                                 (diff === 'Advanced' && (userLevel === 'Beginner' || userLevel === 'Intermediate')) ||
                                 (diff === 'Intermediate' && user.lock?.isLocked)
                
                const isCompleted = (diff === 'Beginner' && (userLevel === 'Intermediate' || userLevel === 'Advanced')) ||
                                    (diff === 'Intermediate' && userLevel === 'Advanced')
                
                const dotColor = diff === 'Beginner' ? 'from-sky-400 to-indigo-500' : diff === 'Intermediate' ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500';

                return (
                  <div
                    key={diff}
                    className={`premium-card p-6 relative overflow-hidden flex flex-col justify-between min-h-[180px] select-none text-left transition-all ${
                      isLocked ? 'locked-row-premium' : ''
                    }`}
                  >
                    {/* Top Node Number index badge */}
                    <div className="flex justify-between items-center">
                      <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${dotColor} text-white font-extrabold text-xs flex items-center justify-center shadow-sm`}>
                        {nodeIndex}
                      </div>
                      
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[8px] font-black text-slate-455 uppercase tracking-widest">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      ) : isCompleted ? (
                        <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[8px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                          Active Arena
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">{diff} TIER</h3>
                      <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wide mt-1">Difficulty level pool</p>
                    </div>

                    <div className="mt-6">
                      {isLocked ? (
                        <div className="text-[10px] text-slate-600 font-semibold leading-relaxed">
                          {diff === 'Intermediate' && user.lock?.isLocked 
                            ? `Verification lock active. Cooldown ends shortly.` 
                            : `Complete previous stages to unlock access.`
                          }
                        </div>
                      ) : (
                        <button
                          onClick={() => handleLevelClick(activeExam.id, diff, activeSubject)}
                          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1 border border-slate-850 shadow-xs"
                        >
                          Launch CBT mock &rarr;
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}

            </div>
          </div>
        )}

      </div>

      {/* 24-Hour Cooldown lock modal dialogue */}
      <AnimatePresence>
        {lockModalInfo && countdown > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 text-center flex flex-col items-center space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xl font-bold">
                🔒
              </div>
              <h3 className="text-lg font-black text-slate-800 font-display tracking-tight">{lockModalInfo.level} Locked</h3>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">{lockModalInfo.desc}</p>
              <div className="w-full text-center font-mono font-bold text-base bg-red-50 text-red-600 py-2 rounded-xl">
                {formatCountdown(countdown)}
              </div>
              <button
                onClick={() => setLockModalInfo(null)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-white text-xs font-extrabold uppercase tracking-wider transition-all"
              >
                Acknowledge & Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Premium Rules Modal */}
      <AnimatePresence>
        {rulesModalInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-950/50 border border-cyan-800/40 px-2.5 py-1 rounded-full">
                    <Sparkles className="h-3 w-3 shrink-0" /> Exam Rules Section
                  </div>
                  <h3 className="text-xl font-black font-display tracking-tight text-white mt-1">
                    {rulesModalInfo.examId} CBT Arena
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    Module: {rulesModalInfo.subject} &bull; Tier: {rulesModalInfo.difficulty}
                  </p>
                </div>
                <button 
                  onClick={() => setRulesModalInfo(null)}
                  className="text-slate-400 hover:text-white transition-colors text-sm font-extrabold bg-slate-800 hover:bg-slate-755 p-1.5 rounded-xl border border-slate-700"
                >
                  ✕
                </button>
              </div>

              {/* Rules Content */}
              <div className="space-y-4 text-xs font-semibold text-slate-350">
                <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded bg-indigo-550/10 text-indigo-400 font-bold flex items-center justify-center shrink-0">1</div>
                    <p className="leading-relaxed">
                      This CBT consists of <strong>5 multiple-choice questions</strong> fetched dynamically from our database.
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded bg-indigo-550/10 text-indigo-400 font-bold flex items-center justify-center shrink-0">2</div>
                    <p className="leading-relaxed">
                      You have a duration of <strong>120 seconds per question</strong> (10 minutes total). The test submits automatically when time expires.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded bg-indigo-550/10 text-indigo-400 font-bold flex items-center justify-center shrink-0">3</div>
                    <p className="leading-relaxed">
                      Scoring awards <strong>10 points per correct answer</strong>. Completing the exam saves your XP permanently to the database.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl space-y-2.5 text-amber-300">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" /> Progression Requirements
                  </div>
                  <ul className="list-disc list-inside space-y-1 leading-relaxed text-slate-350">
                    <li>Passing (score accuracy &ge; 50%) is compulsory to level up to the next tier.</li>
                    <li>Completing a <strong>Beginner</strong> exam locks all tests for <strong>24 hours</strong>.</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setRulesModalInfo(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-extrabold text-xs uppercase border border-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const info = rulesModalInfo;
                    setRulesModalInfo(null);
                    onSelectExam(info.examId, info.subject, info.difficulty);
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider transition-all border border-indigo-400/20 shadow-md shadow-indigo-600/15"
                >
                  Start Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
