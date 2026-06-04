import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Award, Target, Zap, Clock, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ArrowUpRight, ShieldCheck } from 'lucide-react'

// Simple confetti generator for tier ascension celebration
function ConfettiEffect() {
  const [particles, setParticles] = useState([])
  
  useEffect(() => {
    const arr = []
    const colors = ['#4F46E5', '#06B6D4', '#F59E0B', '#10B981', '#EC4899']
    for (let i = 0; i < 45; i++) {
      arr.push({
        id: i,
        x: Math.random() * 100, // percentage width
        y: Math.random() * 20 - 20, // initial top
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 1.5,
        duration: Math.random() * 2 + 2,
        rotation: Math.random() * 360
      })
    }
    setParticles(arr)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ y: `${p.y}vh`, x: `${p.x}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: '100vh',
            rotate: p.rotation + 360,
            opacity: [1, 1, 0.8, 0]
          }}
          transition={{
            delay: p.delay,
            duration: p.duration,
            ease: 'easeOut'
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.id % 2 === 0 ? '50%' : '2px',
            transform: `rotate(${p.rotation}deg)`
          }}
        />
      ))}
    </div>
  )
}

export default function Results({ results, onBackToExams }) {
  const { score, totalQuestions, correctAnswers, accuracy, xpEarned, newLevel, lock, resultsOverview } = results
  const [showCelebration, setShowCelebration] = useState(false)

  // Trigger celebration if competitor passed (accuracy >= 50%) and transitioned to higher tiers
  useEffect(() => {
    if (accuracy >= 50 && newLevel !== 'Beginner') {
      setShowCelebration(true)
      // Auto close/dismiss overlay after 5 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [newLevel, accuracy])

  const getXPProgressPercent = () => {
    // Progression brackets corresponding to the server
    if (newLevel === 'Beginner') return Math.min((xpEarned / 200) * 100, 100)
    if (newLevel === 'Intermediate') return Math.min(((xpEarned) / 400) * 100, 100)
    if (newLevel === 'Advanced') return Math.min(((xpEarned) / 600) * 100, 100)
    if (newLevel === 'Elite') return Math.min(((xpEarned) / 800) * 100, 100)
    return 100
  }

  const getLevelNextLabel = () => {
    if (newLevel === 'Beginner') return 'Intermediate'
    if (newLevel === 'Intermediate') return 'Advanced'
    if (newLevel === 'Advanced') return 'Elite'
    if (newLevel === 'Elite') return 'Challenger'
    return 'Challenger Legend'
  }

  const accuracyColor = accuracy >= 80 ? 'text-emerald-500' : accuracy >= 50 ? 'text-amber-500' : 'text-rose-500'
  const strokeColor = accuracy >= 80 ? '#10B981' : accuracy >= 50 ? '#F59E0B' : '#EF4444'

  // Circle dimensions for progress SVG
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (accuracy / 100) * circumference

  // Deduce if a test is fully correct
  const isPerfectScore = accuracy === 100

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 px-2 select-none relative">
      
      {/* Tier Ascension Overlay Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowCelebration(false)}
          >
            <ConfettiEffect />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg text-center relative overflow-hidden shadow-2xl border border-indigo-100"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600" />
              
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-4xl animate-pulse shadow-inner relative">
                👑
                <div className="absolute -top-1 -right-1 text-base bg-emerald-500 text-white rounded-full p-1 border-2 border-white">✓</div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display mt-5">
                Tier Ascension Reached!
              </h2>
              
              <p className="text-slate-500 text-xs font-semibold mt-2 px-4 leading-relaxed">
                Outstanding performance! You successfully passed the exam challenge requirements and unlocked access to the next competitive level.
              </p>

              <div className="my-6 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100/50 inline-flex flex-col items-center">
                <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Current Placement Status</span>
                <span className="text-lg font-black text-indigo-600 font-display mt-1">{newLevel} Pool</span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowCelebration(false)}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 transition-all border border-indigo-500/20"
                >
                  Acknowledge Promotion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Stat Cards (Summary report panel) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 text-white shadow-premium border border-slate-850">
        
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="space-y-3 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/25">
              <Trophy className="h-3.5 w-3.5" /> Combat Mission Completed
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-tight text-white">
              {isPerfectScore ? 'Flawless Arena Victory! 🏆' : 'Exam Performance Report'}
            </h2>
            <p className="text-slate-400 text-xs font-semibold">
              Review your score metrics, precision accuracy, and XP progression rewards.
            </p>

            {/* Quick badges row */}
            <div className="flex flex-wrap gap-2.5 pt-2 justify-center md:justify-start">
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-450 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-900/50">
                <ShieldCheck className="h-3.5 w-3.5" /> Passed Verified
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-450 bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-900/50">
                <ArrowUpRight className="h-3.5 w-3.5" /> Ranked Up +{Math.ceil(xpEarned / 10)} Places
              </div>
            </div>
          </div>

          {/* Duolingo style Circular Meter */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center bg-slate-950/50 rounded-full border border-slate-800 shadow-inner">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Background Ring */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke="#1E293B"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Foreground Progress Ring */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner content overlay */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black font-display leading-none ${accuracyColor}`}>
                  {accuracy}%
                </span>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  Accuracy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="h-px bg-slate-800/60 my-6" />

        {/* Stats breakdown boxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-center space-y-1">
            <div className="text-2xl font-black font-display text-white">{score}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Battle Score</div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-center space-y-1">
            <div className="text-2xl font-black font-display text-white">
              {correctAnswers} <span className="text-xs text-slate-500 font-bold">/ {totalQuestions}</span>
            </div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Solved Count</div>
          </div>

          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-center space-y-1">
            <div className="text-2xl font-black font-display text-indigo-400">+{xpEarned} XP</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">XP Earned</div>
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30 text-center space-y-1 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
            <div className="text-2xl font-black font-display text-emerald-450">+{Math.ceil(xpEarned / 10)}</div>
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-wide">Rank Movement</div>
          </div>
        </div>

      </div>

      {/* 2. Progression & Cooldown Banner */}
      <div className="premium-card p-6 space-y-4 relative overflow-hidden select-none shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
        <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-500">
          <span>Ranking Progression HUD</span>
          <span className="text-indigo-600 flex items-center gap-1.5">
            <Award className="h-4 w-4" /> Pool Placement: {newLevel}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${getXPProgressPercent()}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full glow-bar-fill rounded-full"
          />
        </div>

        <div className="flex justify-between items-center text-[9px] font-black text-slate-450 uppercase tracking-wider">
          <span>Current level: {newLevel}</span>
          <span>Next tier check: {getLevelNextLabel()}</span>
        </div>

        {/* Cool-down warning box */}
        {lock?.isLocked && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-4 text-slate-800"
          >
            <ShieldAlert className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-black text-amber-900 tracking-tight flex items-center gap-1.5">
                24-Hour Verification Lock Active
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                Congratulations on completing the Beginner level and unlocking the <strong>Intermediate</strong> rank track! 
                Due to standard verification rules, a <strong>24-hour verification lock</strong> is currently active on your account. You can review your metrics here, but cannot take higher tier tests until the timer clears.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* 3. Detailed Answers Breakdown Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-black font-display tracking-tight text-slate-900">Question Performance Review</h3>
        </div>

        <div className="space-y-6">
          {resultsOverview.map((item, idx) => {
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                className="premium-card p-6 space-y-4 relative overflow-hidden"
              >
                {/* Header item */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    item.isCorrect 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {item.isCorrect ? '✓ Correct Answer' : '✗ Incorrect Answer'}
                  </span>
                  
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Question {idx + 1}</span>
                </div>

                {/* Question title */}
                <p className="text-slate-800 text-sm font-extrabold leading-relaxed">
                  {item.question_text}
                </p>

                {/* MCQ Options list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {Object.entries(item.options || {}).map(([letter, opt]) => {
                    const isSelected = item.selectedAnswer === letter
                    const isCorrect = item.correctAnswer === letter

                    let cardStyles = "bg-slate-50 border-slate-200/80 text-slate-650 hover:bg-slate-100/50"
                    let letterStyles = "bg-slate-100 border-slate-200 text-slate-500"

                    if (isCorrect) {
                      cardStyles = "bg-emerald-50/60 border-emerald-300 text-emerald-800 font-bold shadow-xs"
                      letterStyles = "bg-emerald-500 border-emerald-600 text-white font-black"
                    } else if (isSelected && !isCorrect) {
                      cardStyles = "bg-rose-50/60 border-rose-300 text-rose-800 font-bold shadow-xs"
                      letterStyles = "bg-rose-500 border-rose-600 text-white font-black"
                    }

                    return (
                      <div 
                        key={letter}
                        className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs md:text-sm transition-all ${cardStyles}`}
                      >
                        <span className={`w-6 h-6 rounded-lg font-black text-[10px] flex items-center justify-center border shrink-0 ${letterStyles}`}>
                          {letter}
                        </span>
                        
                        <span className="truncate">{opt}</span>
                        
                        {isSelected && (
                          <span className="ml-auto text-[9px] font-black uppercase text-rose-750 px-1.5 py-0.5 rounded bg-rose-100/50 border border-rose-200/30">Your Choice</span>
                        )}
                        {isCorrect && !isSelected && (
                          <span className="ml-auto text-[9px] font-black uppercase text-emerald-750 px-1.5 py-0.5 rounded bg-emerald-100/50 border border-emerald-200/30">Correct Target</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Explanation text box */}
                {item.explanation && (
                  <div className="bg-slate-55 border border-slate-150 p-4 rounded-xl mt-4 text-xs text-slate-500 leading-relaxed font-semibold">
                    <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wide block mb-1">Explanation Insight:</span>
                    <p>{item.explanation}</p>
                  </div>
                )}

              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Back button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onBackToExams}
          className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-650 to-cyan-500 hover:from-indigo-600 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 border border-indigo-400/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Return to Command Center <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  )
}
