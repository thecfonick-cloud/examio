import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, Trophy, Zap, ChevronRight, Users, ShieldAlert, 
  Target, Flame, BarChart3, Clock, Quote, Sparkles, Star 
} from 'lucide-react';

export default function LandingPage({ onShowAuth }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideAvatars = [
    {
      name: "Emily Smith",
      role: "SAT Math Elite | New York, NY",
      stars: 5,
      xp: "280+ Practice Points",
      metric: "96.5% Accuracy",
      quote: "Examio's random question loading ensured I never memorized answers. The 24-hour cooldown after the beginner exam forced me to rest, review my formulas, and prepare systematically. Passing the intermediate pool boosted my CBT exam confidence tremendously!"
    },
    {
      name: "Alexander Chen",
      role: "SAT Reading Scholar | San Francisco, CA",
      stars: 5,
      xp: "Reading Track",
      metric: "+340 XP Gained",
      quote: "Success in the SAT isn't just about reading passages; it is about working smart under a timer. Examio helped me identify reading comprehension concept gaps. Seeing my rank change live on the section scoreboard pushed me to strive for the top rank!"
    },
    {
      name: "Sarah Jenkins",
      role: "SAT Writing Specialist | Chicago, IL",
      stars: 5,
      xp: "Writing & Language",
      metric: "Rank #3 Global",
      quote: "The dynamic question injection mimics the unpredictable nature of the SAT Writing section. Having detailed explanations immediately after completing the test allowed me to clear grammar doubt loops. I recommend this platform to anyone serious about mock tests."
    }
  ];

  // Rotate testimonials automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideAvatars.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const arenas = [
    { id: 'SAT', name: 'SAT Math', active: '14.2K', avg: '68%', heat: 'High', desc: 'Algebra, linear equations, geometry, and data analysis.', color: 'from-orange-500/20 to-red-500/10 text-orange-500 border-orange-500/25' },
    { id: 'SAT', name: 'SAT Reading', active: '18.9K', avg: '72%', heat: 'Moderate', desc: 'Comprehension passages and evidence-based questions.', color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/25' },
    { id: 'SAT', name: 'SAT Writing & Language', active: '8.4K', avg: '54%', heat: 'High', desc: 'Grammar, sentence correction, punctuation, and clarity improvement.', color: 'from-purple-500/20 to-indigo-500/10 text-purple-500 border-purple-500/25' }
  ];

  return (
    <div className="bg-[#0b0f19] text-white min-h-screen overflow-x-hidden font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-16 px-4 md:px-8 border-b border-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-[#0b0f19] to-[#0b0f19]">
        
        {/* Tech Grid Backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        {/* Floating Glowing Particle */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/10 blur-[120px] animate-pulse pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest border border-indigo-500/20"
            >
              <Sparkles className="h-3.5 w-3.5 animate-spin" />
              THE GLOBAL RANKING WAR IS ALIVE
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] font-display"
            >
              Students Are Not Studying—They Are <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-500 drop-shadow-[0_0_30px_rgba(79,70,229,0.3)]">Competing.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              Welcome to <strong>Examio</strong>, the ultimate real-time competitive SAT ranking system. Attack dynamic CBT mocks, claim experience points, unlock progression ladders, and secure your place on the global leaderboard.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <button
                onClick={() => onShowAuth(true)}
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_30px_rgba(79,70,229,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/20"
              >
                <Swords className="h-4 w-4 shrink-0 fill-white" />
                START SAT CHALLENGE
                <ChevronRight className="h-4 w-4 shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => onShowAuth(false)}
                className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                ACCESS SECURE PORTAL
              </button>
            </motion.div>
            
            {/* Live Stats Bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-900/60 max-w-lg mx-auto lg:mx-0"
            >
              <div>
                <div className="text-2xl sm:text-3xl font-black text-white font-display">12.4K</div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Live Fighters</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-display">900+</div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Combat MCQs</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-display">0.05s</div>
                <div className="text-slate-500 text-[10px] font-black uppercase tracking-wider mt-1">Rank Sync Latency</div>
              </div>
            </motion.div>
          </div>

          {/* Right Interface Mockup Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Glassmorphic Bloomberg style command center mockup */}
            <div className="w-full bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-5 space-y-4 overflow-hidden relative group">
              
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500" />
              
              {/* Terminal Title Bar */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">EXAMIO_HUD_V2.1</span>
              </div>

              {/* Simulated Live Feed */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/50">
                  <span className="flex items-center gap-2 text-indigo-400 font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    LIVE
                  </span>
                  <span className="text-slate-400 text-[10px]">SAT Section Challenge: Math</span>
                  <span className="text-emerald-400 font-black">+180 XP</span>
                </div>

                {/* Scoreboard Mockup inside HUD */}
                <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/50 space-y-2">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Top Competitors Today</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-bold">1. Emily Smith</span>
                      <span className="text-cyan-400 font-extrabold">1,540 XP</span>
                    </div>
                    <div className="flex justify-between items-center text-xs bg-indigo-500/5 p-1 rounded">
                      <span className="text-indigo-400 font-black flex items-center gap-1">2. You (Agent) <span className="text-[9px] px-1 bg-indigo-500/10 rounded">Me</span></span>
                      <span className="text-indigo-400 font-black">1,410 XP</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-bold">3. Alexander Chen</span>
                      <span className="text-slate-400 font-bold">1,380 XP</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Rank Drift Graph representation */}
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Rank Shift Tracking</span>
                    <span className="text-emerald-400 font-black">▲ +4 today</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-16 pt-2">
                    <div className="w-full bg-slate-800 rounded-sm h-[30%]" />
                    <div className="w-full bg-slate-800 rounded-sm h-[45%]" />
                    <div className="w-full bg-slate-800 rounded-sm h-[35%]" />
                    <div className="w-full bg-slate-800 rounded-sm h-[60%]" />
                    <div className="w-full bg-slate-800 rounded-sm h-[75%]" />
                    <div className="w-full bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-sm h-[90%] shadow-[0_0_10px_rgba(6,182,212,0.4)] animate-pulse" />
                  </div>
                </div>

                {/* Tactical tip card mock */}
                <div className="p-2.5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 flex items-center justify-between text-[11px]">
                  <span className="text-yellow-500 font-bold flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5" /> Streak Shield Active
                  </span>
                  <span className="text-slate-400">🔥 5 Day Streak Locked</span>
                </div>
              </div>
            </div>

            {/* Backdrop Glow effect */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/30 to-cyan-500/20 blur-xl opacity-30 pointer-events-none -z-10 group-hover:opacity-50 transition-opacity" />
          </motion.div>

        </div>
      </section>

      {/* 2. Interactive Battle Arenas */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/10">
            <Flame className="h-3 w-3 animate-bounce" /> HIGH HEAT COMBAT TIERS
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight">
            Select Your Target Battle Track
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto font-medium">
            Deploy inside competitive modules configured to replicate real-time examination difficulty benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {arenas.map((arena, index) => (
            <motion.div
              key={arena.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative p-6 bg-slate-900/40 rounded-2xl border border-slate-800 hover:border-slate-700/80 shadow-lg flex flex-col justify-between h-[230px] group transition-all"
            >
              {/* Highlight Gradient hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-indigo-500/5 group-hover:to-cyan-500/5 transition-all duration-300" />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-wider">
                    {arena.id}
                  </span>
                  
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gradient-to-br ${arena.color} border`}>
                    <ShieldAlert className="h-3 w-3 shrink-0" />
                    Heat: {arena.heat}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-cyan-400 transition-colors">{arena.name}</h3>
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">{arena.desc}</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-[10px] font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-500" />
                    <div>
                      <span className="text-white block text-xs font-black">{arena.active}</span>
                      Live Users
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-slate-500" />
                    <div>
                      <span className="text-white block text-xs font-black">{arena.avg}</span>
                      Avg Benchmark
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onShowAuth(true)}
                  className="w-full py-2 rounded-lg bg-slate-950 group-hover:bg-indigo-600/90 border border-slate-800 group-hover:border-indigo-500 text-slate-400 group-hover:text-white text-[10px] font-black uppercase tracking-wider transition-all duration-300"
                >
                  ENTER BATTLE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Features Breakdown */}
      <section className="bg-slate-950/40 py-24 border-t border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-16">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
              <Target className="h-3.5 w-3.5" /> REVOLUTIONARY ENGINE FEATURES
            </div>
            <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight">
              Designed For Absolute Exam Dominance
            </h2>
            <p className="text-slate-400 text-sm font-medium">
              We ditched the typical boring layout. Examio utilizes high-end SaaS dynamics to keep your mind razor-sharp.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Feature 1 */}
            <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800/80 space-y-4 hover:border-slate-700/60 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base">Adaptive Tiers</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Unlock higher rank brackets dynamically. Advance from Beginner limits up to Advanced pools based on verified MCQ score data.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800/80 space-y-4 hover:border-slate-700/60 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base">Live Leaderboards</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Compare score statistics with instant rank shift trackers. Watch your dashboard update to map visual upward or downward movements.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800/80 space-y-4 hover:border-slate-700/60 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <Zap className="h-5 w-5 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-base">No Memorization</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                No rigid, hardcoded mocks. Question pools randomly assemble on page loads, ensuring conceptual mastery instead of visual memory.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800/80 space-y-4 hover:border-slate-700/60 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-base">24-Hour Cooldown</h3>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Keep burnouts away. A forced 24h verification lock acts to secure critical learning retention before unlocking the next rank.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Podium Visual Panel */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1 text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
            <Trophy className="h-3.5 w-3.5" /> COMPETITIVE HIERARCHY
          </div>
          <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight">
            Claim The Crown Rank
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto font-medium">
            Climb the milestones and see your name on the Top 3 platform podium. Reaching the peak takes relentless practice.
          </p>
        </div>

        {/* E-Sports Podium Representation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto items-end pt-12">
          
          {/* Silver - Rank 2 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-center order-2 md:order-1 h-[260px] flex flex-col justify-end relative"
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-2 border-slate-400 flex items-center justify-center text-xl font-bold bg-slate-950 font-display">
              🥈
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-300">Alexander Chen</h4>
              <p className="text-xs text-slate-500">SAT Reading Rank #2</p>
              <div className="text-xs font-black text-cyan-400 pt-3">1,410 XP</div>
            </div>
          </motion.div>

          {/* Gold - Rank 1 */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/60 border-2 border-indigo-500/40 rounded-2xl p-6 text-center order-1 md:order-2 h-[310px] flex flex-col justify-end relative shadow-[0_0_30px_rgba(79,70,229,0.15)]"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xl animate-bounce">👑</div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-2 border-indigo-400 flex items-center justify-center text-2xl font-bold bg-slate-950 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              🥇
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-base text-white">Emily Smith</h4>
              <p className="text-xs text-slate-400">SAT Math Rank #1</p>
              <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 pt-3">1,540 XP</div>
            </div>
          </motion.div>

          {/* Bronze - Rank 3 */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-center order-3 md:order-3 h-[240px] flex flex-col justify-end relative"
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border-2 border-amber-700/50 flex items-center justify-center text-xl font-bold bg-slate-950 font-display">
              🥉
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-sm text-slate-300">Sarah Jenkins</h4>
              <p className="text-xs text-slate-500">SAT Writing Rank #3</p>
              <div className="text-xs font-black text-indigo-400 pt-3">1,380 XP</div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 5. Scholar Testimonials */}
      <section className="bg-slate-950/20 py-24 border-t border-slate-900/60 relative">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-10">
          
          <div className="space-y-3">
            <Quote className="h-10 w-10 text-indigo-400 mx-auto opacity-40 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">Scholars Out In The Wild</h2>
          </div>

          <div className="min-h-[220px] relative flex items-center justify-center">
            <AnimatePresence mode="wait">
              {slideAvatars.map((item, idx) => {
                if (idx !== activeSlide) return null;
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    <p className="text-base sm:text-lg text-slate-300 italic font-medium leading-relaxed max-w-2xl mx-auto">
                      "{item.quote}"
                    </p>
                    
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(item.stars)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                      <h4 className="font-black text-white text-sm">{item.name}</h4>
                      <p className="text-slate-500 text-xs font-semibold">{item.role}</p>
                    </div>

                    <div className="flex justify-center gap-4 text-xs font-extrabold text-slate-400 pt-2">
                      <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">{item.xp}</span>
                      <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">{item.metric}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2">
            {slideAvatars.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === activeSlide ? 'bg-indigo-500 w-6' : 'bg-slate-700 hover:bg-slate-600'}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* 6. Dedications Footer */}
      <footer className="bg-slate-950 border-t border-slate-900/80 py-12 px-4 md:px-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-display text-white text-base font-black">
            <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-8 w-8 rounded-lg flex items-center justify-center font-extrabold text-sm shadow-md">E</div>
            <span>Examio</span>
          </div>
          
          <div className="flex items-center gap-1 text-[11px] font-medium">
            <span>© 2026 Examio. Competitive Excellence. Made with</span>
            <span 
              onClick={() => onShowAuth(false)} 
              className="hover:scale-125 hover:rotate-12 transform transition-all cursor-pointer inline-block text-red-500" 
              title="Dedicated Portal"
            >
              ❤️
            </span>
            <span>by the Examio Team.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
