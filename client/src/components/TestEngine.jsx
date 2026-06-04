import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Clock, HelpCircle, ChevronRight, ChevronLeft, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react'

export default function TestEngine({ user, examId, subject, difficulty, onSubmitResult, onCancel, onSeedTrigger }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { qId: selectedOption }
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitConfirm, setSubmitConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [questionMappings, setQuestionMappings] = useState({})

  // Shuffle utility
  const shuffleArray = (array) => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr
  }

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch(
          `/api/exams/${examId}/questions?subject=${encodeURIComponent(subject)}&difficulty=${difficulty}&userId=${user.id}`
        )
        const data = await response.json()
        if (response.ok) {
          // 1. Shuffle question order dynamically
          const shuffledQuestions = shuffleArray(data)
          
          // 2. Shuffle options dynamically for each question
          const maps = {}
          shuffledQuestions.forEach(q => {
            const entries = Object.entries(q.options || {})
            const keys = entries.map(e => e[0])
            const values = entries.map(e => e[1])
            
            const shuffledValues = shuffleArray(values)
            const displayOptions = {}
            const originalKeyMap = {}
            
            keys.forEach((key, index) => {
              const val = shuffledValues[index]
              displayOptions[key] = val
              const origEntry = entries.find(e => e[1] === val)
              originalKeyMap[key] = origEntry ? origEntry[0] : key
            })
            
            maps[q.id] = { displayOptions, originalKeyMap }
          })
          
          setQuestionMappings(maps)
          setQuestions(shuffledQuestions)
          // Set 120 seconds per question (minimum 3 minutes)
          const duration = Math.max(data.length * 120, 180)
          setTimeLeft(duration)
        } else {
          setError(data.error || 'Failed to load test questions')
        }
      } catch (err) {
        setError('Failed to connect to backend server.')
      } finally {
        setLoading(false)
      }
    }
    loadQuestions()
  }, [examId, subject, difficulty, user.id])

  // Count down timer
  useEffect(() => {
    if (loading || questions.length === 0 || timeLeft <= 0) {
      if (timeLeft === 0 && questions.length > 0 && !loading && !submitting) {
        handleAutoSubmit()
      }
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, loading, questions.length, submitting])

  const handleAutoSubmit = () => {
    alert('Time has expired! Submitting your responses automatically...')
    performSubmission()
  }

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleOptionSelect = (qId, option) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: option
    }))
  }

  const performSubmission = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          examId,
          subject,
          difficulty,
          answers
        })
      })

      const data = await response.json()
      if (response.ok) {
        onSubmitResult(data)
      } else {
        alert(data.error || 'Submission failed')
      }
    } catch (err) {
      alert('Error connecting to backend during submission.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitClick = () => {
    setSubmitConfirm(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center py-20 text-indigo-400 font-bold text-sm">
        <Sparkles className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
        Preparing exam environment...
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 text-center flex flex-col items-center space-y-6 shadow-2xl">
          <div className="h-14 w-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl">
            ℹ️
          </div>
          <h3 className="text-xl font-black font-display tracking-tight text-white">Module Empty</h3>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            {error || `There are no questions in our database for ${examId} - ${subject} (${difficulty}).`}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={onSeedTrigger}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider transition-all border border-indigo-400/20 shadow-md shadow-indigo-600/10"
            >
              Seed Mock Questions (1-Click)
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-extrabold text-xs uppercase tracking-wider transition-all border border-slate-800"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const isCriticalTime = timeLeft <= 60

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white px-4 md:px-8 py-6 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Test HUD Header */}
      <header className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            className="px-3.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1"
            onClick={onCancel}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Exit
          </button>
          
          <div className="text-left">
            <h2 className="text-sm font-black text-white flex items-center gap-2 tracking-tight">
              {examId} Entrance Test
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase tracking-widest">{difficulty}</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1.5">
              Subject: {subject} &bull; Question {currentIndex + 1} of {questions.length}
            </p>
          </div>
        </div>

        {/* Live Urgency Timer */}
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-mono font-black text-sm transition-all select-none ${
          isCriticalTime 
            ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse-glow shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
            : 'bg-slate-950 border-slate-800 text-cyan-400'
        }`}>
          <Clock className={`h-4 w-4 ${isCriticalTime ? 'text-red-500 animate-spin' : 'text-cyan-400'}`} />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start my-6 flex-1">
        
        {/* Left Side Pane: Question Deck */}
        <aside className="order-2 lg:order-1 lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Question Deck</div>
            
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined
                const isActive = idx === currentIndex
                
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 w-9 rounded-xl text-xs font-black border transition-all flex items-center justify-center ${
                      isActive 
                        ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-md shadow-cyan-500/10' 
                        : isAnswered 
                        ? 'bg-indigo-600 border-indigo-700 text-white font-extrabold shadow-sm' 
                        : 'bg-slate-950 border-slate-800/80 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Progress stats widget */}
          <div className="border-t border-slate-800/80 pt-4 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              <span>Progress Tracker</span>
              <span>{Object.keys(answers).length} / {questions.length} Answered</span>
            </div>
            
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
                style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* Right Pane: Central Question Block */}
        <main className="order-1 lg:order-2 lg:col-span-3 space-y-6 flex flex-col h-full justify-between">
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 flex-1 flex flex-col justify-center">
            
            {/* Header info */}
            <div className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">
              Question Milestone {currentIndex + 1}
            </div>
            
            <p className="text-white text-base md:text-lg font-extrabold leading-relaxed tracking-tight">
              {currentQuestion.question_text}
            </p>

            {/* MCQ Option selector lists */}
            <div className="space-y-3 pt-2">
              {Object.entries(
                (questionMappings[currentQuestion.id] && questionMappings[currentQuestion.id].displayOptions) ||
                currentQuestion.options ||
                {}
              ).map(([letter, opt]) => {
                const originalKey = (questionMappings[currentQuestion.id] && questionMappings[currentQuestion.id].originalKeyMap[letter]) || letter
                const isSelected = answers[currentQuestion.id] === originalKey
                
                return (
                  <button
                    key={letter}
                    onClick={() => handleOptionSelect(currentQuestion.id, originalKey)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 text-xs md:text-sm font-bold select-none relative group ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 ring-2 ring-indigo-500/10 shadow-[0_0_15px_rgba(79,70,229,0.1)]' 
                        : 'bg-slate-950 border-slate-800/80 text-slate-350 hover:bg-slate-850 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center border shrink-0 ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:border-slate-650'
                    }`}>
                      {letter}
                    </span>
                    <span>{opt}</span>
                    {isSelected && (
                      <span className="absolute right-4 text-[9px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/35 px-2 py-0.5 rounded">Selected</span>
                    )}
                  </button>
                )
              })}
            </div>

          </div>

          {/* Navigation and Submit bar */}
          <div className="flex justify-between items-center bg-slate-900/60 p-4 border border-slate-800 rounded-2xl gap-4">
            <button
              className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-850/80 text-slate-300 hover:text-white border border-slate-800 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 shrink-0" /> Previous
            </button>

            {isLastQuestion ? (
              <button
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-emerald-700/10 flex items-center gap-1 border border-emerald-500/20"
                onClick={handleSubmitClick}
              >
                Submit Exam <CheckCircle2 className="h-4 w-4 shrink-0" />
              </button>
            ) : (
              <button
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-md shadow-indigo-600/10"
                onClick={() => setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))}
              >
                Next <ChevronRight className="h-4 w-4 shrink-0" />
              </button>
            )}
          </div>
          
        </main>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {submitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 text-center flex flex-col items-center space-y-4 shadow-2xl"
            >
              <div className="h-12 w-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl">
                ❓
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white font-display tracking-tight">Finish Exam?</h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  You have answered {Object.keys(answers).length} out of {questions.length} questions. Are you ready to submit your responses?
                </p>
              </div>
              
              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setSubmitConfirm(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-350 font-extrabold text-xs uppercase border border-slate-800"
                  disabled={submitting}
                >
                  Back to Test
                </button>
                <button
                  onClick={performSubmission}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase shadow-md shadow-emerald-700/10 border border-emerald-500/20"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Yes, Submit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
