import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Award, Flame, Zap, ShieldAlert, Sparkles, ChevronRight, User, TrendingUp, TrendingDown, Minus } from 'lucide-react'

// Helper to generate deterministic competitor details (Country, Streak, Rank Movement)
function getDeterministicCompetitorData(userId, name) {
  let hash = 0
  const str = (userId || '') + (name || '')
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  hash = Math.abs(hash)

  const countries = [
    { flag: '🇺🇸', name: 'USA' },
    { flag: '🇬🇧', name: 'GBR' },
    { flag: '🇨🇦', name: 'CAN' },
    { flag: '🇦🇺', name: 'AUS' },
    { flag: '🇩🇪', name: 'DEU' },
    { flag: '🇸🇬', name: 'SGP' },
    { flag: '🇰🇷', name: 'KOR' },
    { flag: '🇯🇵', name: 'JPN' },
    { flag: '🇫🇷', name: 'FRA' },
    { flag: '🇨🇭', name: 'CHE' }
  ]

  const country = countries[hash % countries.length]
  const streak = (hash % 14) + 1 // Streak from 1 to 14
  
  // Stable Rank movement: positive up, negative down, zero stable
  const movements = [3, -1, 2, 0, 5, -2, 1, 0, 4, -3]
  const movement = movements[hash % movements.length]

  return { country, streak, movement }
}

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

  const getLevelBadgeStyles = (level) => {
    switch (level) {
      case 'Beginner':
        return 'bg-sky-55 text-sky-700 border border-sky-150'
      case 'Intermediate':
        return 'bg-amber-50 text-amber-700 border border-amber-150'
      case 'Advanced':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-150'
      case 'Elite':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-150'
      case 'Challenger':
        return 'bg-cyan-55 text-cyan-700 border border-cyan-150'
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-150'
    }
  }

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
    <div className="space-y-8 max-w-5xl mx-auto py-4 px-2 select-none">
      
      {/* Header Panel */}
      <div className="premium-card p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600" />
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 shadow-sm">
            <Trophy className="h-3 w-3 text-indigo-600" /> GLOBAL SAT ARENA
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
            Competitor Leaderboard
          </h2>
          <p className="text-slate-500 text-xs font-semibold">
            Track global ranks, streaks, accuracy tiers, and XP milestones across the SAT arena.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 self-start md:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all select-none ${
              activeTab === 'global'
                ? 'bg-white text-indigo-600 shadow-md border border-slate-250/20'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Global Rank
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all select-none ${
              activeTab === 'exam'
                ? 'bg-white text-indigo-600 shadow-md border border-slate-250/20'
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
                  className={`px-3.5 py-2 rounded-lg text-xs font-black uppercase border transition-all ${
                    selectedExam === exam
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10'
                      : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
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
        <div className="text-center py-20 text-indigo-600 font-bold text-sm flex flex-col items-center justify-center gap-3">
          <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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
            No competitors have completed exams in this category yet. Be the first to take a challenge and claim the #1 rank!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Esports Podium Area */}
          {visualPodium.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto items-end pt-14 pb-4">
              
              {visualPodium.map((userObj) => {
                const isCurrentUser = userObj.id === currentUser?.id
                const is1st = userObj.pos === 1
                const is2nd = userObj.pos === 2
                const is3rd = userObj.pos === 3
                
                const { country, streak } = getDeterministicCompetitorData(userObj.id, userObj.name)
                
                // Color configuration per podium position
                const config = is1st
                  ? {
                      height: 'h-[290px] md:h-[325px]',
                      border: 'border-amber-300 shadow-[0_15px_30px_rgba(245,158,11,0.12)]',
                      glow: 'from-amber-400 via-yellow-300 to-amber-500',
                      avatarBorder: 'border-amber-400 bg-amber-50',
                      badge: 'bg-amber-100 text-amber-800 border border-amber-200'
                    }
                  : is2nd
                  ? {
                      height: 'h-[250px] md:h-[285px]',
                      border: 'border-slate-300 shadow-[0_10px_20px_rgba(148,163,184,0.08)]',
                      glow: 'from-slate-300 via-slate-200 to-slate-400',
                      avatarBorder: 'border-slate-300 bg-slate-50',
                      badge: 'bg-slate-100 text-slate-800 border border-slate-200'
                    }
                  : {
                      height: 'h-[230px] md:h-[265px]',
                      border: 'border-orange-200 shadow-[0_10px_20px_rgba(217,119,6,0.08)]',
                      glow: 'from-orange-400 via-orange-300 to-orange-500',
                      avatarBorder: 'border-orange-400 bg-orange-50',
                      badge: 'bg-orange-50 text-orange-800 border border-orange-100'
                    }

                return (
                  <motion.div
                    key={userObj.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 80, delay: userObj.pos * 0.1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`premium-card relative p-6 text-center flex flex-col justify-end ${config.height} ${config.border} ${
                      is1st ? 'order-1 md:order-2' : is2nd ? 'order-2 md:order-1' : 'order-3 md:order-3'
                    }`}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${config.glow}`} />
                    
                    {is1st && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-3xl animate-bounce duration-1000">👑</div>
                    )}
                    
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full border-2 ${config.avatarBorder} flex items-center justify-center text-xl font-bold shadow-md relative`}>
                        <div className="h-full w-full rounded-full flex items-center justify-center bg-slate-900 text-white font-black text-base uppercase font-display">
                          {userObj.name ? userObj.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'C'}
                        </div>
                        {/* Country tag overlay */}
                        <div className="absolute -bottom-1.5 -right-1 text-base bg-white rounded-full shadow-sm p-0.5 border border-slate-100 flex items-center justify-center" title={country.name}>
                          {country.flag}
                        </div>
                      </div>
                      <span className={`mt-2.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${config.badge}`}>
                        Rank {userObj.pos}
                      </span>
                    </div>

                    <div className="space-y-1 mt-14">
                      <h4 className="font-extrabold text-sm text-slate-800 flex items-center justify-center gap-1.5">
                        {userObj.name}
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500 text-white text-[8px] font-black uppercase">You</span>
                        )}
                      </h4>
                      
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${getLevelBadgeStyles(userObj.level)}`}>
                          {userObj.level}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-650">
                          <Flame className="h-3.5 w-3.5 fill-orange-500/20" /> {streak}d
                        </span>
                      </div>
                      
                      <div className="text-sm font-black pt-3.5 text-indigo-600 font-display">
                        {activeTab === 'exam' ? userObj.exam_xp : userObj.xp} <span className="text-[10px] font-bold text-slate-500">XP</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

            </div>
          )}

          {/* Tabular Ranking List */}
          <div className="premium-card relative overflow-hidden shadow-premium">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Arena Placement Rankings</h3>
              </div>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                Live: 12,842 Online
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
                    <th className="py-4 px-6 text-center w-20">Rank</th>
                    <th className="py-4 px-6 text-center w-20">Status</th>
                    <th className="py-4 px-6">Competitor</th>
                    <th className="py-4 px-6">Region</th>
                    <th className="py-4 px-6">Streak</th>
                    <th className="py-4 px-6">Combat Pool</th>
                    <th className="py-4 px-6 text-right">Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankings.map((row, idx) => {
                    const isCurrentUser = row.id === currentUser?.id
                    const isTopThree = idx < 3
                    const rankNum = idx + 1
                    
                    const { country, streak, movement } = getDeterministicCompetitorData(row.id, row.name)
                    
                    return (
                      <tr 
                        key={row.id} 
                        className={`hover:bg-slate-55/60 transition-colors ${
                          isCurrentUser ? 'bg-indigo-50/20' : ''
                        }`}
                      >
                        {/* Rank cell */}
                        <td className="py-4 px-6 font-black text-xs text-center">
                          {isTopThree ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs">
                              {rankNum === 1 ? '🥇' : rankNum === 2 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="text-slate-500 font-bold">{rankNum}</span>
                          )}
                        </td>

                        {/* Status (movement arrow) */}
                        <td className="py-4 px-6 text-center">
                          {movement > 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <TrendingUp className="h-3 w-3" /> {movement}
                            </span>
                          ) : movement < 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                              <TrendingDown className="h-3 w-3" /> {Math.abs(movement)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center text-slate-400 font-bold">
                              <Minus className="h-3 w-3" />
                            </span>
                          )}
                        </td>

                        {/* Competitor Name */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg text-[10px] font-black flex items-center justify-center border uppercase shrink-0 ${
                              isCurrentUser 
                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-sm' 
                                : 'bg-slate-100 border-slate-200 text-slate-650'
                            }`}>
                              {row.name ? row.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'C'}
                            </div>

                            <div className="flex flex-col">
                              <span className={`text-xs font-black ${
                                isCurrentUser ? 'text-indigo-600' : 'text-slate-700'
                              }`}>
                                {row.name}
                              </span>
                              {isCurrentUser && (
                                <span className="self-start px-1.5 py-0.2 rounded bg-indigo-500 text-white text-[7px] font-black uppercase mt-0.5">You</span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Country Flag */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs" title={country.name}>
                            <span className="text-base">{country.flag}</span>
                            <span className="text-[10px] font-black tracking-wider text-slate-400">{country.code}</span>
                          </div>
                        </td>

                        {/* Active Streak */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1 text-orange-650 font-black text-xs">
                            <Flame className="h-4 w-4 fill-orange-500/10 shrink-0 text-orange-500 animate-pulse" />
                            <span>{streak}d</span>
                          </div>
                        </td>

                        {/* Progression Badge */}
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getLevelBadgeStyles(row.level)}`}>
                            {row.level}
                          </span>
                        </td>

                        {/* Score points */}
                        <td className="py-4 px-6 text-right font-black text-xs text-slate-800 font-display">
                          {activeTab === 'exam' ? row.exam_xp : row.xp} <span className="text-[9px] text-slate-500 font-bold">XP</span>
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
