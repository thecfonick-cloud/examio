import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Award, Flame, Zap, ShieldAlert, Sparkles, ChevronRight, User } from 'lucide-react'

export default function Leaderboard({ currentUser }) {
  const [activeTab, setActiveTab] = useState('global') // 'global' or 'exam'
  const [selectedExam, setSelectedExam] = useState('SAT')
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const examsList = ['SAT']

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true)
      setError('')
      try {
        const queryParams = activeTab === 'exam' ? `?examId=${selectedExam}` : ''
        const response = await fetch(`/api/leaderboard${queryParams}`)
        const data = await response.json()
        if (response.ok) {
          setRankings(data.rankings)
        } else {
          setError(data.error || 'Failed to load leaderboard')
        }
      } catch (err) {
        setError('Failed to fetch rankings from server.')
      } finally {
        setLoading(false)
      }
    }
    loadLeaderboard()
  }, [activeTab, selectedExam])

  const topThree = rankings.slice(0, 3)
  const remaining = rankings.slice(3)

  // Reorder for visual podium: [2nd, 1st, 3rd]
  const visualPodium = (() => {
    if (topThree.length === 0) return []
    const podium = []
    if (topThree[1]) podium.push({ ...topThree[1], pos: 2 })
    if (topThree[0]) podium.push({ ...topThree[0], pos: 1 })
    if (topThree[2]) podium.push({ ...topThree[2], pos: 3 })
    return podium
  })()

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 px-2">
      
      {/* Header Panel */}
      <div className="premium-card p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600" />
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            <Trophy className="h-3 w-3" /> SCOREBOARD RIVALRY
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Platform Leaderboard
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            Track ranks, level progression, and performance statistics across the platform.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all select-none ${
              activeTab === 'global'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Global Rank
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all select-none ${
              activeTab === 'exam'
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/20'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Exam-Wise
          </button>
        </div>
      </div>

      {/* Filter Select Box for Exam Tab */}
      <AnimatePresence>
        {activeTab === 'exam' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm"
          >
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Select Arena Pool:</span>
            <div className="flex flex-wrap gap-2">
              {examsList.map(exam => (
                <button
                  key={exam}
                  onClick={() => setSelectedExam(exam)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase border transition-all ${
                    selectedExam === exam
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {exam}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-20 text-indigo-600 font-bold text-sm">
          Retrieving scoreboard rankings...
        </div>
      ) : error ? (
        <div className="max-w-xl mx-auto p-6 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center">
          <h3 className="font-bold text-base">Retrieval Error</h3>
          <p className="mt-2 text-xs">{error}</p>
        </div>
      ) : rankings.length === 0 ? (
        <div className="text-center bg-white border border-slate-200 rounded-2xl py-16 px-6 shadow-sm">
          <Trophy className="h-12 w-12 text-slate-350 mx-auto" />
          <h3 className="font-extrabold text-slate-800 text-lg mt-4">Scoreboard Empty</h3>
          <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto mt-2 leading-relaxed">
            No students have completed exams in this category yet. Be the first to take a test and secure the #1 rank!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* E-Sports Podium Area */}
          {visualPodium.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto items-end pt-12">
              
              {visualPodium.map((userObj) => {
                const isCurrentUser = userObj.id === currentUser?.id
                const is1st = userObj.pos === 1
                const is2nd = userObj.pos === 2
                const is3rd = userObj.pos === 3
                
                return (
                  <motion.div
                    key={userObj.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: userObj.pos * 0.1 }}
                    className={`premium-card relative p-6 text-center flex flex-col justify-end ${
                      is1st 
                        ? 'h-[280px] md:h-[300px] border-indigo-300 order-1 md:order-2' 
                        : is2nd 
                        ? 'h-[240px] md:h-[260px] order-2 md:order-1' 
                        : 'h-[220px] md:h-[240px] order-3 md:order-3'
                    }`}
                  >
                    {is1st ? (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
                    ) : is2nd ? (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-300 via-slate-200 to-slate-400" />
                    ) : (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-750" />
                    )}
                    {is1st && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce">👑</div>
                    )}
                    
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className={`w-14 h-14 rounded-full border-2 bg-slate-950 flex items-center justify-center text-xl font-bold shadow-sm ${
                        is1st ? 'border-amber-400' : is2nd ? 'border-slate-400' : 'border-amber-600'
                      }`}>
                        {is1st ? '🥇' : is2nd ? '🥈' : '🥉'}
                      </div>
                    </div>

                    <div className="space-y-1 mt-10">
                      <h4 className="font-extrabold text-sm text-slate-800 flex items-center justify-center gap-1">
                        {userObj.name}
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[8px] font-black uppercase">You</span>
                        )}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wide">
                        Pool: {userObj.level}
                      </p>
                      
                      <div className={`text-xs font-black pt-3 ${
                        is1st ? 'text-indigo-600' : 'text-slate-650'
                      }`}>
                        {activeTab === 'exam' ? userObj.exam_xp : userObj.xp} XP
                      </div>
                    </div>
                  </motion.div>
                )
              })}

            </div>
          )}

          {/* Tabular Ranking List */}
          <div className="premium-card relative overflow-hidden select-none">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Milestone Ranks</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Scholar Student</th>
                    <th className="py-3.5 px-6">Progression Pool</th>
                    <th className="py-3.5 px-6 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankings.map((row, idx) => {
                    const isCurrentUser = row.id === currentUser?.id
                    const isTopThree = idx < 3
                    const rankNum = idx + 1
                    
                    return (
                      <tr 
                        key={row.id} 
                        className={`hover:bg-slate-50/40 transition-colors ${
                          isCurrentUser ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        {/* Rank cell */}
                        <td className="py-4 px-6 font-black text-xs">
                          {isTopThree ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs">
                              {rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="text-slate-500 pl-1.5">{rankNum}</span>
                          )}
                        </td>

                        {/* Student Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            {/* Avatar placeholder initials */}
                            <div className={`h-7 w-7 rounded-lg text-[10px] font-black flex items-center justify-center border uppercase shrink-0 ${
                              isCurrentUser 
                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm' 
                                : 'bg-slate-100 border-slate-200 text-slate-650'
                            }`}>
                              {row.name ? row.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'A'}
                            </div>

                            <span className={`text-xs font-black ${
                              isCurrentUser ? 'text-indigo-600' : 'text-slate-700'
                            }`}>
                              {row.name}
                            </span>

                            {isCurrentUser && (
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[8px] font-black uppercase">You</span>
                            )}
                          </div>
                        </td>

                        {/* Progression Badge */}
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            row.level === 'Beginner' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                            row.level === 'Intermediate' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {row.level}
                          </span>
                        </td>

                        {/* Score points */}
                        <td className="py-4 px-6 text-right font-extrabold text-xs text-slate-800">
                          {activeTab === 'exam' ? row.exam_xp : row.xp} XP
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}
