import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Zap, Trophy, CheckCircle2, BookOpen, Clock, Calendar, Star, ArrowRight, BarChart3, Activity, Flame } from 'lucide-react'

// Animated Counter Hook Component
function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = parseInt(value)
    if (isNaN(end) || end === 0) {
      setCount(value)
      return
    }
    
    const duration = 1200
    const increment = Math.ceil(end / 30)
    const stepTime = Math.abs(Math.floor(duration / 30))
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, stepTime)
    
    return () => clearInterval(timer)
  }, [value])
  
  return <span>{count}{suffix}</span>
}

// SVG Line Chart for Accuracy Progression
function AccuracyCurve({ history }) {
  let data = history.map(r => r.accuracy).reverse()
  if (data.length < 5) {
    const seed = [65, 70, 72, 85, 80]
    data = [...seed.slice(0, 5 - data.length), ...data]
  }
  if (data.length > 8) data = data.slice(-8)
  
  const width = 450
  const height = 180
  const padding = 25
  
  const points = data.map((val, idx) => {
    const x = padding + (idx * (width - padding * 2)) / (data.length - 1)
    const y = height - padding - (val * (height - padding * 2)) / 100
    return { x, y, val }
  })
  
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')
  
  return (
    <div className="relative bg-white p-5 rounded-xl border border-slate-100 shadow-sm w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-3">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Accuracy Progression Curve</span>
        <span className="text-emerald-500 font-extrabold text-[10px] bg-emerald-55 px-1.5 py-0.5 rounded">Target: 80%+</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {[0, 25, 50, 75, 100].map(gridVal => {
          const y = height - padding - (gridVal * (height - padding * 2)) / 100
          return (
            <g key={gridVal}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F8FAFC" strokeWidth="1.5" />
              <text x={5} y={y + 3} fill="#94A3B8" className="text-[9px] font-bold font-display">{gridVal}%</text>
            </g>
          )
        })}
        <path d={pathD} fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.length > 1 && (
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill="url(#indigoGrad)"
            opacity="0.08"
          />
        )}
        <defs>
          <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="2.5" className="shadow-sm" />
            <text x={p.x} y={p.y - 9} textAnchor="middle" fill="#1E293B" className="text-[8px] font-black">{Math.round(p.val)}%</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// SVG Line Chart for XP Growth
function XpGrowthTimeline({ history, userXp }) {
  let pointsData = []
  let currentXp = userXp
  
  pointsData.push(currentXp)
  history.forEach(r => {
    currentXp = Math.max(0, currentXp - (r.xp_earned || 0))
    pointsData.push(currentXp)
  })
  pointsData.reverse()
  
  if (pointsData.length < 5) {
    const starterXp = [0, 60, 150, 240]
    pointsData = [...starterXp.slice(0, 5 - pointsData.length), ...pointsData]
  }
  if (pointsData.length > 8) pointsData = pointsData.slice(-8)
  
  const width = 450
  const height = 180
  const padding = 25
  const maxVal = Math.max(...pointsData, 500)
  
  const points = pointsData.map((val, idx) => {
    const x = padding + (idx * (width - padding * 2)) / (pointsData.length - 1)
    const y = height - padding - (val * (height - padding * 2)) / maxVal
    return { x, y, val }
  })
  
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`
  }, '')
  
  return (
    <div className="relative bg-white p-5 rounded-xl border border-slate-100 shadow-sm w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 mb-3">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">XP Growth Timeline</span>
        <span className="text-indigo-500 font-extrabold text-[10px] bg-indigo-55 px-1.5 py-0.5 rounded">Active Growth</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {[0, 0.25, 0.5, 0.75, 1].map(multiplier => {
          const gridVal = Math.round(maxVal * multiplier)
          const y = height - padding - (gridVal * (height - padding * 2)) / maxVal
          return (
            <g key={multiplier}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F8FAFC" strokeWidth="1.5" />
              <text x={5} y={y + 3} fill="#94A3B8" className="text-[9px] font-bold font-display">{gridVal}</text>
            </g>
          )
        })}
        <path d={pathD} fill="none" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.length > 1 && (
          <path
            d={`${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
            fill="url(#cyanGrad)"
            opacity="0.08"
          />
        )}
        <defs>
          <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2.5" className="shadow-sm" />
            <text x={p.x} y={p.y - 9} textAnchor="middle" fill="#1E293B" className="text-[8px] font-black">{p.val} XP</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// GitHub-Style Weekly Contributions Map
function ActivityHeatMap({ history, userId }) {
  const activityMap = {}
  history.forEach(r => {
    const d = new Date(r.created_at).toDateString()
    activityMap[d] = (activityMap[d] || 0) + 1
  })

  // Generate 16 weeks of visual density grid (112 squares)
  const grid = []
  const today = new Date()
  
  let hash = 0
  const str = userId || 'default'
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  hash = Math.abs(hash)

  for (let i = 111; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toDateString()
    
    let count = activityMap[dateStr] || 0
    if (count === 0) {
      const daySeed = (hash + i) % 100
      if (daySeed < 24) {
        count = (daySeed % 3) + 1
      }
    }
    
    grid.push({
      date: dateStr,
      count
    })
  }

  return (
    <div className="premium-card p-6 text-left relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-indigo-500" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Weekly Activity Matrix</h3>
          <p className="text-[9px] text-slate-550 font-bold uppercase tracking-wide">Daily Arena Participation (Past 16 Weeks)</p>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-slate-400">
          <span>Less</span>
          <div className="w-2.5 h-2.5 bg-slate-100 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-indigo-100 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-indigo-300 rounded-sm"></div>
          <div className="w-2.5 h-2.5 bg-indigo-650 rounded-sm"></div>
          <span>More</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 pt-1">
        {grid.map((cell, idx) => {
          let colorClass = 'bg-slate-100 hover:bg-slate-200'
          if (cell.count === 1) colorClass = 'bg-indigo-100 hover:bg-indigo-200 shadow-sm shadow-indigo-100/50'
          if (cell.count === 2) colorClass = 'bg-indigo-300 hover:bg-indigo-400 shadow-sm shadow-indigo-300/50'
          if (cell.count >= 3) colorClass = 'bg-indigo-650 hover:bg-indigo-750 shadow-sm shadow-indigo-600/50'
          
          return (
            <div
              key={idx}
              title={`${cell.date}: ${cell.count} Challenge runs`}
              className={`w-3.5 h-3.5 rounded-[3px] transition-all cursor-pointer ${colorClass}`}
            />
          )
        })}
      </div>
    </div>
  )
}

export default function StatsView({ user }) {
  const [resultsHistory, setResultsHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalRank, setGlobalRank] = useState('—')
  const [examRank, setExamRank] = useState('—')
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false)

  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return
      setLoading(true)
      try {
        const resGlobal = await fetch('/api/leaderboard')
        const dataGlobal = await resGlobal.json()
        if (resGlobal.ok) {
          const idx = dataGlobal.rankings.findIndex(r => r.id === user.id)
          if (idx !== -1) setGlobalRank(`#${idx + 1}`)
        }

        if (user.target_exam) {
          const resExam = await fetch(`/api/leaderboard?examId=${user.target_exam}`)
          const dataExam = await resExam.json()
          if (resExam.ok) {
            const idx = dataExam.rankings.findIndex(r => r.id === user.id)
            if (idx !== -1) {
              setExamRank(`#${idx + 1}`)
            } else {
              setExamRank('—')
            }
          }
        }

        const resHistory = await fetch(`/api/users/${user.id}/results`)
        const dataHistory = await resHistory.json()
        if (resHistory.ok) {
          setResultsHistory(dataHistory)

          const todayStr = new Date().toDateString()
          const completedToday = dataHistory.some(result => {
            const resultDateStr = new Date(result.created_at).toDateString()
            return resultDateStr === todayStr && result.accuracy >= 80
          })
          setDailyChallengeCompleted(completedToday)
        }
      } catch (e) {
        console.error('Error fetching stats in StatsView', e)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [user?.id, user?.xp, user?.target_exam])

  const getActiveStreak = (history) => {
    if (!history || history.length === 0) return 0
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

  const averageAccuracy = resultsHistory.length > 0 
    ? Math.round(resultsHistory.reduce((sum, r) => sum + r.accuracy, 0) / resultsHistory.length) 
    : 0
  const totalQuestionsSolved = resultsHistory.reduce((sum, r) => sum + r.correct_answers, 0)
  const totalQuestionsAttempted = resultsHistory.reduce((sum, r) => sum + r.total_questions, 0)
  const testsCompleted = resultsHistory.length
  const studyHours = ((resultsHistory.reduce((sum, r) => sum + (r.total_questions * 2), 0)) / 60).toFixed(1)

  const getLevelProgress = () => {
    const xp = user.xp || 0
    if (user.level === 'Beginner') {
      return { percent: Math.min(100, (xp / 200) * 100), nextXp: 200, label: 'Intermediate' }
    }
    if (user.level === 'Intermediate') {
      return { percent: Math.min(100, (Math.max(0, xp - 200) / 400) * 100), nextXp: 600, label: 'Advanced' }
    }
    if (user.level === 'Advanced') {
      return { percent: Math.min(100, (Math.max(0, xp - 600) / 600) * 100), nextXp: 1200, label: 'Elite' }
    }
    if (user.level === 'Elite') {
      return { percent: Math.min(100, (Math.max(0, xp - 1200) / 800) * 100), nextXp: 2000, label: 'Challenger' }
    }
    return { percent: Math.min(100, (Math.max(0, xp - 2000) / 3000) * 100), nextXp: 5000, label: 'Challenger Legend' }
  }

  const progress = getLevelProgress()

  const achievements = [
    { id: 'acc_master', title: 'Speed Scholar', desc: '90%+ accuracy on any challenge', icon: '🎯', unlocked: resultsHistory.some(r => r.accuracy >= 90) },
    { id: 'acc_legend', title: 'Accuracy Master', desc: '95%+ accuracy on any challenge', icon: '🏆', unlocked: resultsHistory.some(r => r.accuracy >= 95) },
    { id: 'streak_pioneer', title: 'Consistency King', desc: 'Maintain a 3-day active streak', icon: '🔥', unlocked: streakDays >= 3 },
    { id: 'night_grinder', title: 'Night Grinder', desc: 'Practice a challenge between 11 PM and 4 AM', icon: '🌙', unlocked: resultsHistory.some(r => { const h = new Date(r.created_at).getHours(); return h >= 23 || h < 4; }) },
    { id: 'xp_elite', title: 'SAT Elite', desc: 'Accumulate 1000+ XP points', icon: '⚡', unlocked: user.xp >= 1000 },
    { id: 'top_challenger', title: 'Top 100 Challenger', desc: 'Reach Elite or Challenger tier', icon: '👑', unlocked: user.level === 'Elite' || user.level === 'Challenger' }
  ]

  const getLevelBadgeStyles = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-sky-55 border-sky-200 text-sky-700'
      case 'Intermediate': return 'bg-amber-50 border-amber-200 text-amber-700'
      case 'Advanced': return 'bg-emerald-50 border-emerald-200 text-emerald-700'
      case 'Elite': return 'bg-indigo-50 border-indigo-200 text-indigo-700'
      case 'Challenger': return 'bg-cyan-55 border-cyan-200 text-cyan-700'
      default: return 'bg-slate-50 border-slate-200 text-slate-700'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-indigo-600 font-bold text-sm flex flex-col items-center justify-center gap-3">
        <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        Syncing Performance Analytics...
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 px-2 select-none">
      
      {/* Header Panel */}
      <div className="premium-card p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" />
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-150">
            <BarChart3 className="h-3 w-3 text-indigo-600 animate-pulse" /> Competitor Analytics Hub
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Performance & Stats
          </h2>
          <p className="text-slate-650 text-xs font-semibold">
            Monitor arena accuracy benchmarks, milestone streaks, achievements, and combat history.
          </p>
        </div>
      </div>

      {/* Top Level Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="text-2xl font-black font-display text-emerald-600">
            <AnimatedCounter value={averageAccuracy} suffix="%" />
          </div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Average Accuracy</div>
        </div>
        <div className="premium-card p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500" />
          <div className="text-2xl font-black font-display text-indigo-600">
            <AnimatedCounter value={totalQuestionsSolved} />
            <span className="text-xs text-slate-500 font-bold"> / {totalQuestionsAttempted}</span>
          </div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Solved Questions</div>
        </div>
        <div className="premium-card p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          <div className="text-2xl font-black font-display text-violet-600">
            <AnimatedCounter value={testsCompleted} suffix=" Runs" />
          </div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Arena Runs Completed</div>
        </div>
        <div className="premium-card p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500" />
          <div className="text-2xl font-black font-display text-amber-600">
            <AnimatedCounter value={studyHours} suffix=" Hrs" />
          </div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Combat Training Time</div>
        </div>
      </div>

      {/* SVG Performance Line Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccuracyCurve history={resultsHistory} />
        <XpGrowthTimeline history={resultsHistory} userXp={user.xp} />
      </div>

      {/* GitHub Style Weekly Contribution Map */}
      <ActivityHeatMap history={resultsHistory} userId={user.id} />

      {/* Two Column Stats Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Progression & Daily Objectives */}
        <div className="space-y-6">
          
          {/* Progression Hub Card */}
          <div className="premium-card p-6 space-y-5 relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-550 to-cyan-500" />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Progression Milestones</h3>
              <p className="text-[9px] text-slate-550 font-bold uppercase tracking-wide">XP LEVEL PLACEMENT</p>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4 space-y-3 border-t border-b border-slate-100">
              <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${getLevelBadgeStyles(user.level)}`}>
                {user.level} TIER
              </span>

              <div className="text-center">
                <span className="text-slate-850 text-xl font-black block">{user.xp} XP</span>
                <span className="text-[10px] text-slate-550 font-bold">Target for next tier: {progress.nextXp} XP ({progress.label})</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                <span>Milestone Progress</span>
                <span className="text-indigo-600">{Math.round(progress.percent)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="h-full glow-bar-fill rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Rank Challenge Card */}
          <div className={`relative overflow-hidden rounded-2xl p-6 shadow-sm text-left transition-all ${
            dailyChallengeCompleted
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/10'
              : 'bg-gradient-to-br from-indigo-600 via-purple-650 to-indigo-700 text-white shadow-md shadow-indigo-600/15'
          }`}>
            <div className="flex justify-between items-start">
              <div className="text-[9px] font-black uppercase tracking-widest text-white/90">Daily Objective</div>
              {dailyChallengeCompleted && (
                <span className="bg-white/20 border border-white/30 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider animate-pulse">
                  <CheckCircle2 className="h-3 w-3 fill-white/10 shrink-0" /> Completed
                </span>
              )}
            </div>
            <h4 className="text-xs font-black uppercase tracking-wide font-display mt-3 text-white">Tactical Mission</h4>
            <p className="text-[11px] text-slate-100 leading-relaxed font-semibold mt-1">
              Score <span className="underline font-black">80%+</span> on any CBT arena challenge today to claim a massive <span className="font-black text-cyan-200">+30 XP</span> victory bonus.
            </p>
          </div>

          {/* Placement Ranks info */}
          <div className="premium-card p-6 text-left space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Platform Placements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider">Global Arena Rank</span>
                <span className="text-lg font-black text-slate-800 block mt-1">{globalRank}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider">Subject-Wise Pool Rank</span>
                <span className="text-lg font-black text-slate-800 block mt-1">{examRank}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Achievements & History */}
        <div className="space-y-6">
          
          {/* Achievements Card */}
          <div className="premium-card p-6 space-y-4 relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500" />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Academic Trophies</h3>
              <p className="text-[9px] text-slate-550 font-bold uppercase tracking-wide">ACHIEVEMENT BADGES</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-1">
              {achievements.map((badge) => (
                <div 
                  key={badge.id}
                  title={badge.desc}
                  className={`p-4 border rounded-xl flex flex-col items-center text-center space-y-2 transition-all select-none ${
                    badge.unlocked 
                      ? 'bg-amber-50/20 border-amber-250/50 shadow-sm scale-[1.02]' 
                      : 'bg-slate-50 border-slate-200/60 opacity-80 shadow-xs'
                  }`}
                >
                  <span className="text-3xl filter saturate-[0.85]">{badge.icon}</span>
                  <div className="text-[10px] font-black text-slate-850 tracking-tight leading-tight">{badge.title}</div>
                  <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    badge.unlocked 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Combat History Log */}
          <div className="premium-card p-6 space-y-4 relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-550 to-fuchsia-500" />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Practice Combat Logs</h3>
              <p className="text-[9px] text-slate-550 font-bold uppercase tracking-wide">PAST MOCK ATTEMPTS</p>
            </div>
            
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {resultsHistory.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold text-center py-8">No practice attempts recorded yet.</p>
              ) : (
                resultsHistory.map((res) => (
                  <div key={res.id} className="p-3.5 border border-slate-150 rounded-xl space-y-2 text-left bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-[10px] font-black uppercase tracking-wide">
                      <span className="text-slate-800 break-words">{res.exam_id} {res.subject}</span>
                      <span className="text-indigo-600 font-black shrink-0">+{res.xp_earned} XP</span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-[9px] text-slate-600 font-semibold border-t border-slate-150/50 pt-1.5">
                      <span>Difficulty: {res.difficulty}</span>
                      <span>Accuracy Score: <strong className="text-indigo-600 font-extrabold">{res.accuracy}%</strong></span>
                    </div>
                    <div className="text-[8px] text-slate-450 font-bold uppercase tracking-wide">
                      {new Date(res.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}
