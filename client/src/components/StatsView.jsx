import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Zap, Trophy, CheckCircle2, BookOpen, Clock, Calendar, Star, ArrowRight, BarChart3 } from 'lucide-react'

export default function StatsView({ user }) {
  const [resultsHistory, setResultsHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [globalRank, setGlobalRank] = useState('—')
  const [examRank, setExamRank] = useState('—')
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false)

  // Fetch History and Rank stats
  useEffect(() => {
    async function loadStats() {
      if (!user?.id) return
      setLoading(true)
      try {
        // 1. Fetch Global Rank
        const resGlobal = await fetch('/api/leaderboard')
        const dataGlobal = await resGlobal.json()
        if (resGlobal.ok) {
          const idx = dataGlobal.rankings.findIndex(r => r.id === user.id)
          if (idx !== -1) setGlobalRank(`#${idx + 1}`)
        }

        // 2. Fetch Exam-wise Rank
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

        // 3. Fetch Practice History
        const resHistory = await fetch(`/api/users/${user.id}/results`)
        const dataHistory = await resHistory.json()
        if (resHistory.ok) {
          setResultsHistory(dataHistory)

          // Verify daily challenge
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

  // Streak calculations
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

  // Performance calculations
  const averageAccuracy = resultsHistory.length > 0 
    ? Math.round(resultsHistory.reduce((sum, r) => sum + r.accuracy, 0) / resultsHistory.length) 
    : 0
  const totalQuestionsSolved = resultsHistory.reduce((sum, r) => sum + r.correct_answers, 0)
  const totalQuestionsAttempted = resultsHistory.reduce((sum, r) => sum + r.total_questions, 0)
  const testsCompleted = resultsHistory.length
  const studyHours = ((resultsHistory.reduce((sum, r) => sum + (r.total_questions * 2), 0)) / 60).toFixed(1)

  // Progression Hub info
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
    { id: 'acc_master', title: 'Speed Scholar', desc: '90%+ accuracy on any mock test', icon: '🎯', unlocked: resultsHistory.some(r => r.accuracy >= 90) },
    { id: 'streak_pioneer', title: 'Consistency King', desc: 'Maintain a 3-day active streak', icon: '🔥', unlocked: streakDays >= 3 },
    { id: 'xp_champion', title: 'XP Elite', desc: 'Accumulate 500+ XP points', icon: '⚡', unlocked: user.xp >= 500 },
    { id: 'multi_exam', title: 'Polymath', desc: 'Practice in 2+ SAT sections', icon: '🧠', unlocked: new Set(resultsHistory.map(r => r.subject)).size >= 2 }
  ]

  if (loading) {
    return (
      <div className="text-center py-20 text-indigo-600 font-bold text-sm">
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
            <BarChart3 className="h-3 w-3 text-indigo-600" /> Student Analytics Hub
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Performance & Stats
          </h2>
          <p className="text-slate-650 text-xs font-semibold">
            Monitor syllabus accuracy benchmarks, milestone streaks, achievements, and exam history.
          </p>
        </div>
      </div>

      {/* Top Level Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="text-2xl font-black font-display text-emerald-600">{averageAccuracy}%</div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Average Accuracy</div>
        </div>
        <div className="premium-card p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500" />
          <div className="text-2xl font-black font-display text-indigo-600">{totalQuestionsSolved} / {totalQuestionsAttempted}</div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Solved Questions</div>
        </div>
        <div className="premium-card p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          <div className="text-2xl font-black font-display text-violet-600">{testsCompleted} Runs</div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Mock Tests Taken</div>
        </div>
        <div className="premium-card p-5 text-center space-y-1 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-amber-500" />
          <div className="text-2xl font-black font-display text-amber-600">{studyHours} Hrs</div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider">Practice Time</div>
        </div>
      </div>

      {/* Two Column Stats Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: Progression & Daily Objectives */}
        <div className="space-y-6">
          
          {/* Progression Hub Card */}
          <div className="premium-card p-6 space-y-5 relative overflow-hidden text-left">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-550 to-cyan-500" />
            <div>
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Progression Milestones</h3>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">XP LEVEL PLACEMENT</p>
            </div>
            
            <div className="flex flex-col items-center justify-center py-4 space-y-3 border-t border-b border-slate-100">
              <span className={`px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm ${
                user.level === 'Beginner' ? 'bg-sky-50 border-sky-200 text-sky-700' :
                user.level === 'Intermediate' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}>
                {user.level} TIER
              </span>

              <div className="text-center">
                <span className="text-slate-850 text-xl font-black block">{user.xp} XP</span>
                <span className="text-[10px] text-slate-550 font-bold">Target for next tier: {progress.nextXp} XP</span>
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
                <span className="bg-white/20 border border-white/30 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle2 className="h-3 w-3 fill-white/10 shrink-0" /> Completed
                </span>
              )}
            </div>
            <h4 className="text-xs font-black uppercase tracking-wide font-display mt-3">Tactical Mission</h4>
            <p className="text-[11px] text-white/95 leading-relaxed font-semibold mt-1">
              Score <span className="underline font-black">80%+</span> on any CBT mock test today to claim a massive <span className="font-black text-cyan-200">+30 XP</span> victory bonus.
            </p>
          </div>

          {/* Placement Ranks info */}
          <div className="premium-card p-6 text-left space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Platform Ranks</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider">Global Placement</span>
                <span className="text-lg font-black text-slate-800 block mt-1">{globalRank}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <span className="text-[9px] font-black text-slate-500 uppercase block tracking-wider">Exam preparation rank</span>
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
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">ACHIEVEMENT BADGES</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-1">
              {achievements.map((badge) => (
                <div 
                  key={badge.id}
                  title={badge.desc}
                  className={`p-4 border rounded-xl flex flex-col items-center text-center space-y-2 transition-all select-none ${
                    badge.unlocked 
                      ? 'bg-amber-50/20 border-amber-255/50 shadow-sm' 
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
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">PAST MOCK ATTEMPTS</p>
            </div>
            
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {resultsHistory.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold text-center py-8">No practice attempts recorded yet.</p>
              ) : (
                resultsHistory.map((res) => (
                  <div key={res.id} className="p-3.5 border border-slate-150 rounded-xl space-y-2 text-left bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wide">
                      <span className="text-slate-800">{res.exam_id} {res.subject}</span>
                      <span className="text-indigo-600 font-black">+{res.xp_earned} XP</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-600 font-semibold">
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
