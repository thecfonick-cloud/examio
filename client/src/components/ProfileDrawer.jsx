import React from 'react'
import { motion } from 'framer-motion'
import { X, Award, Trophy, LogOut, BarChart3, BookOpen } from 'lucide-react'

export default function ProfileDrawer({ user, isOpen, onClose, onLogout, setCurrentView, currentView }) {
  if (!isOpen) return null

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Prepare Arena (UPSC)',
      desc: 'Active syllabus dashboard & pathway levels',
      icon: BookOpen,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      id: 'leaderboard',
      label: 'National Scoreboard',
      desc: 'Global and exam-wise leaderboard ranks',
      icon: Trophy,
      color: 'text-amber-600 bg-amber-50 border-amber-100'
    },
    {
      id: 'stats',
      label: 'Performance Analytics',
      desc: 'Streaks, badges, and past attempts combat log',
      icon: BarChart3,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    }
  ]

  return (
    <>
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[6px] z-50"
      />

      {/* Slide-out Menu Navigation Drawer (Sliding from Left) */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 240 }}
        className="fixed top-0 left-0 h-full w-full max-w-md bg-white border-r border-slate-200/80 shadow-2xl z-50 flex flex-col select-none"
      >
        {/* Drawer Header */}
        <div className="flex flex-col px-6 pt-6 pb-4 border-b border-slate-150 shrink-0 gap-4 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4.5 w-4.5 text-indigo-600" />
              <h2 className="text-sm font-black uppercase text-slate-800 tracking-wider">Examio Menu Hub</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-300/40"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Info Capsule */}
          <div className="flex items-center gap-4 p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
              {user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'A'}
            </div>
            <div className="overflow-hidden text-left">
              <h3 className="font-extrabold text-slate-900 text-sm tracking-tight truncate leading-tight">{user.name}</h3>
              <p className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wide mt-1 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
          <span className="text-[10px] font-black text-slate-650 uppercase tracking-widest block mb-2">Prepare & Track</span>
          
          <div className="space-y-3.5">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id)
                    onClose()
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 hover:scale-[1.01] active:scale-[0.99] select-none ${
                    isActive
                      ? 'bg-indigo-50 border-indigo-250 text-indigo-900 shadow-sm ring-1 ring-indigo-500/10'
                      : 'bg-white border-slate-200 hover:bg-slate-50/50 text-slate-800'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${
                    isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : item.color
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    <h4 className={`text-xs font-black tracking-tight ${
                      isActive ? 'text-indigo-900' : 'text-slate-850'
                    }`}>
                      {item.label}
                    </h4>
                    <p className={`text-[10px] font-semibold leading-normal ${
                      isActive ? 'text-indigo-750' : 'text-slate-550'
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 border-t border-slate-150 shrink-0 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 px-1">
            <span>Prepare Tier: <strong className="text-indigo-600 font-black">{user.level}</strong></span>
            <span>XP: <strong className="text-indigo-600 font-black">{user.xp} XP</strong></span>
          </div>

          <button
            onClick={() => {
              onLogout()
              onClose()
            }}
            className="w-full py-3 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-650 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" /> Logout from Session
          </button>
        </div>
      </motion.div>
    </>
  )
}
