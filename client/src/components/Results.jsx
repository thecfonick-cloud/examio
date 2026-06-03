import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award, Target, Zap, Clock, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'

export default function Results({ results, onBackToExams }) {
  const { score, totalQuestions, correctAnswers, accuracy, xpEarned, newLevel, lock, resultsOverview } = results

  const getXPProgressPercent = () => {
    // Arbitrary levels XP targets
    if (newLevel === 'Beginner') return Math.min((score / 100) * 100, 100)
    if (newLevel === 'Intermediate') return 50
    return 100
  }

  const accuracyColor = accuracy >= 80 ? 'text-emerald-500' : accuracy >= 50 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 px-2 select-none">
      
      {/* 1. Header Stat Cards (Summary report panel) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 text-white shadow-premium border border-slate-850">
        
        {/* Glow decoration */}
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-500/25">
              <Trophy className="h-3.5 w-3.5" /> Combat Mission Completed
            </div>
            <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight">Exam Performance Report</h2>
            <p className="text-slate-400 text-xs font-semibold">Here are your score metrics, performance breakdowns, and XP progression rewards.</p>
          </div>

          {/* Stats Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-center space-y-1">
              <div className="text-2xl font-black font-display text-white">{score}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Battle Score</div>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-center space-y-1">
              <div className="text-2xl font-black font-display text-white">{correctAnswers} <span className="text-xs text-slate-500 font-bold">/ {totalQuestions}</span></div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Accuracy Count</div>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 text-center space-y-1">
              <div className={`text-2xl font-black font-display ${accuracyColor}`}>{accuracy}%</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Accuracy Rate</div>
            </div>

            <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/30 text-center space-y-1 shadow-[0_0_15px_rgba(79,70,229,0.1)]">
              <div className="text-2xl font-black font-display text-indigo-400">+{xpEarned} XP</div>
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-wide">Reward XP Gained</div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Progression & Cooldown Banner */}
      <div className="premium-card p-6 space-y-4 relative overflow-hidden select-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
        <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-500">
          <span>Ranking Progression HUD</span>
          <span className="text-indigo-600 flex items-center gap-1"><Award className="h-4 w-4" /> Current: {newLevel}</span>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${getXPProgressPercent()}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full glow-bar-fill rounded-full"
          />
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
                24-Hour Intermediate Pool Lock Triggered
              </h4>
              <p className="text-xs text-amber-700 leading-relaxed font-semibold">
                Congratulations on completing the Beginner level and unlocking the <strong>Intermediate</strong> rank track! 
                Due to competitive exam regulations, a <strong>24-hour verification lock</strong> is now active. During this cooldown, you can review your performance below, but cannot take Intermediate level tests.
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
                      : 'bg-red-50 text-red-700 border border-red-100'
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

                    let cardStyles = "bg-slate-50 border-slate-200/80 text-slate-600"
                    let letterStyles = "bg-slate-100 border-slate-200 text-slate-500"

                    if (isCorrect) {
                      cardStyles = "bg-emerald-50/60 border-emerald-300 text-emerald-800 font-bold"
                      letterStyles = "bg-emerald-500 border-emerald-600 text-white"
                    } else if (isSelected && !isCorrect) {
                      cardStyles = "bg-red-50/60 border-red-300 text-red-800 font-bold"
                      letterStyles = "bg-red-500 border-red-600 text-white"
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
                          <span className="ml-auto text-[9px] font-black uppercase text-red-750 px-1.5 py-0.5 rounded bg-red-100/50">Your Choice</span>
                        )}
                        {isCorrect && !isSelected && (
                          <span className="ml-auto text-[9px] font-black uppercase text-emerald-750 px-1.5 py-0.5 rounded bg-emerald-100/50">Correct Target</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Explanation text box */}
                {item.explanation && (
                  <div className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl mt-4 text-xs text-slate-500 leading-relaxed font-semibold">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wide block mb-1">Explanation Insight:</span>
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
          className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-indigo-600/10 border border-indigo-400/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Return to Combat Center <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  )
}
