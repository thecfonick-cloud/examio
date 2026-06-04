import React, { useEffect, useState } from 'react'
import Auth from './components/Auth.jsx'
import ExamSelection from './components/ExamSelection.jsx'
import TestEngine from './components/TestEngine.jsx'
import Results from './components/Results.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import StatsView from './components/StatsView.jsx'
import ProfileDrawer from './components/ProfileDrawer.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu } from 'lucide-react'

export default function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard') // 'dashboard', 'leaderboard', 'test', 'results'
  const [activeTest, setActiveTest] = useState(null)
  const [testResults, setTestResults] = useState(null)
  const [devMessage, setDevMessage] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)

  // UI state for Landing page
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isRegisteringFromLanding, setIsRegisteringFromLanding] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Easter Egg states
  const [showEasterEggModal, setShowEasterEggModal] = useState(false)
  const [easterEggName, setEasterEggName] = useState('')
  const [easterEggError, setEasterEggError] = useState('')
  const [showEasterEggSuccess, setShowEasterEggSuccess] = useState(false)

  const slidesImages = ['/hero1.png', '/hero2.png', '/hero3.png', '/hero4.png']

  // Hero slideshow interval
  useEffect(() => {
    if (user) return
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slidesImages.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [user])

  // Scroll reveal Intersection Observer
  useEffect(() => {
    if (user) return
    const revealEls = document.querySelectorAll('.reveal')
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

    revealEls.forEach(el => observer.observe(el))
    
    // Clean up
    return () => observer.disconnect()
  }, [user, currentSlide]) // re-run observer if slides trigger layout shifts

  // Sync user status on reload or intervals to keep locks up-to-date
  const fetchUserStatus = async (userId) => {
    if (!userId) return
    try {
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      if (response.ok) {
        setUser(data)
      }
    } catch (err) {
      console.error('Failed to sync user status', err)
    }
  }

  // Poll user status if they have a lock active to update UI live
  useEffect(() => {
    if (!user || !user.lock?.isLocked) return

    const interval = setInterval(() => {
      fetchUserStatus(user.id)
    }, 10000) // update every 10s

    return () => clearInterval(interval)
  }, [user?.lock?.isLocked])

  const handleLogin = (userData) => {
    setUser(userData)
    setShowAuthModal(false)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('dashboard')
    setActiveTest(null)
    setTestResults(null)
  }

  const handleSelectExam = (examId, subject, difficulty) => {
    setActiveTest({ examId, subject, difficulty })
    setCurrentView('test')
  }

  const handleTestSubmit = (resultsData) => {
    setTestResults(resultsData)
    setCurrentView('results')
    fetchUserStatus(user.id)
  }

  const handleSeedDatabase = async () => {
    setDevMessage('Seeding database...')
    try {
      const response = await fetch('/api/dev/seed', { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        setDevMessage('Database successfully seeded!')
        if (user) {
          fetchUserStatus(user.id)
        }
      } else {
        setDevMessage(`Seed failed: ${data.error}`)
      }
    } catch (err) {
      setDevMessage('Error calling developer seed API.')
    }
    setTimeout(() => setDevMessage(''), 4000)
  }

  // Easter Egg logic
  const handleEasterEggSubmit = () => {
    const STATIC_NAME = "JEREMIAH JUDITH CHIDIEBERE"
    if (easterEggName.trim().toUpperCase() === STATIC_NAME) {
      setEasterEggError('')
      setShowEasterEggSuccess(true)
    } else {
      setEasterEggError('Name verification failed. Please try again.')
      setTimeout(() => setEasterEggError(''), 3000)
    }
  }

  // Render Landing Page for Logged-Out Users
  const renderLandingPage = () => {
    return (
      <div style={{ marginTop: '64px' }}>
        {/* Landing Hero with Background Slideshow (NursePathNG style) */}
        <section className="relative min-h-[600px] md:min-h-[800px] flex items-center justify-center overflow-hidden landing-hero">
          
          {/* Background Slideshow */}
          <div className="hero-slideshow absolute inset-0 z-0">
            {slidesImages.map((img, idx) => (
              <div
                key={img}
                className={`hero-slide ${currentSlide === idx ? 'active-slide' : ''}`}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}
            <div className="hero-overlay" />
          </div>

          {/* Hero Content Overlay */}
          <div className="max-w-container-max-width mx-auto text-center z-10 py-16 md:py-24 px-4 relative hero-content flex flex-col items-center">
            <h1 className="hero-title heading-heavy tracking-tighter text-white">
              The Global SAT Competition Arena
            </h1>
            <p className="hero-subtitle text-white/95 max-w-2xl mx-auto my-6 text-sm md:text-base leading-relaxed">
              Compete against SAT competitors worldwide, climb live rankings, master every section, and rise through elite challenge tiers.
            </p>
            
            <div className="hero-buttons flex flex-wrap justify-center gap-4 mt-6">
              <button
                className="px-8 py-3.5 md:px-10 md:py-4 bg-white text-indigo-750 rounded-xl font-black text-sm uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer hover:bg-slate-50"
                onClick={() => { setShowAuthModal(true); setIsRegisteringFromLanding(false); }}
              >
                Enter Command Center
              </button>
              <button
                className="px-8 py-3.5 md:px-10 md:py-4 border-2 border-white text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-white/10 transition-all duration-300 active:scale-95 cursor-pointer"
                onClick={() => { setShowAuthModal(true); setIsRegisteringFromLanding(true); }}
              >
                Start Competing
              </button>
            </div>
          </div>
          <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-10" />
        </section>

        {/* Features Section */}
        <section className="landing-section" id="features">
          <div className="section-header reveal">
            <h2 className="section-title">Tailored Learning Experiences</h2>
            <div className="section-divider" />
          </div>
          <div className="features-grid">
            <div className="feature-card-large reveal">
              <div className="feature-card-header">
                <div className="feature-icon-container">📝</div>
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Core SAT Sections</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    Specialized competitive testing modules designed for major SAT standard tracks.
                  </p>
                </div>
              </div>
              <div className="tracks-grid">
                <div className="track-pill-box">
                  SAT Math
                  <span>Quantitative</span>
                </div>
                <div className="track-pill-box">
                  SAT Reading
                  <span>Comprehension</span>
                </div>
                <div className="track-pill-box">
                  SAT Writing
                  <span>Grammar & Style</span>
                </div>
              </div>
            </div>

            <div className="feature-card-small reveal">
              <span style={{ fontSize: '2rem', marginBottom: '1rem', display: 'block' }}>⚡</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Adaptive Tiers</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                  <strong>Beginner Pool</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>Cooldown 24h</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                  <strong>Intermediate Pool</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>Locked (Unlocking)</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>Advanced Pool</strong>
                  <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Extreme Mode</span>
                </li>
              </ul>
            </div>

            <div className="feature-card-small reveal">
              <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'block' }}>🎲</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Infinite Variety</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Questions randomize on each CBT mock creation, ensuring conceptual mastery over rote answer memorization.
              </p>
            </div>

            <div className="feature-card-small reveal">
              <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'block' }}>🏆</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Global Leaderboards</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                Compete against thousands of students in real-time. Watch your rank shift live on the national scoreboard.
              </p>
            </div>

            <div className="feature-card-small colored reveal">
              <span style={{ fontSize: '2.5rem', marginBottom: '0.5rem', display: 'block' }}>🛡️</span>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Streak Shield</h3>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.5', opacity: 0.9 }}>
                Practice consistently to lock in active streaks. Challenge daily questions to earn experience multipliers.
              </p>
            </div>
          </div>
        </section>



        {/* Testimonials Section */}
        <section className="landing-section" id="testimonials">
          <div className="section-header reveal">
            <h2 className="section-title">What Our Scholars Say</h2>
            <div className="section-divider" />
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card reveal">
              <div className="testimonial-profile">
                <div className="testimonial-avatar">
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justify: 'center', background: 'var(--primary-light)', fontSize: '1.5rem' }}>👩‍🎓</div>
                </div>
                <div>
                  <h4 className="testimonial-name">Emily Smith</h4>
                  <div className="testimonial-meta">SAT Math Section</div>
                  <div className="testimonial-stars">★★★★★</div>
                </div>
              </div>
              <p className="testimonial-quote">
                "Examio's random question loading ensured I never memorized answers. The 24-hour cooldown after the beginner exam forced me to rest, review my formulas, and prepare systematically. Passing the intermediate pool boosted my CBT exam confidence tremendously!"
              </p>
              <div className="testimonial-metrics">
                <span>⚡ 280+ Practice Points</span>
                <span>📈 96.5% Accuracy</span>
              </div>
            </div>

            <div className="testimonial-card reveal">
              <div className="testimonial-profile">
                <div className="testimonial-avatar">
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justify: 'center', background: 'var(--primary-light)', fontSize: '1.5rem' }}>🧑‍🎓</div>
                </div>
                <div>
                  <h4 className="testimonial-name">Alexander Chen</h4>
                  <div className="testimonial-meta">SAT Reading Section</div>
                  <div className="testimonial-stars">★★★★★</div>
                </div>
              </div>
              <p className="testimonial-quote">
                "Success in the SAT isn't just about reading passages; it is about working smart under a timer. Examio helped me identify reading comprehension concept gaps. Seeing my rank change live on the section scoreboard pushed me to strive for the top rank!"
              </p>
              <div className="testimonial-metrics">
                <span>📖 Reading Track</span>
                <span>✨ +340 XP Gained</span>
              </div>
            </div>

            <div className="testimonial-card reveal">
              <div className="testimonial-profile">
                <div className="testimonial-avatar">
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justify: 'center', background: 'var(--primary-light)', fontSize: '1.5rem' }}>👨‍🎓</div>
                </div>
                <div>
                  <h4 className="testimonial-name">Sarah Jenkins</h4>
                  <div className="testimonial-meta">SAT Writing Section</div>
                  <div className="testimonial-stars">★★★★★</div>
                </div>
              </div>
              <p className="testimonial-quote">
                "The dynamic question injection mimics the unpredictable nature of the SAT Writing section. Having detailed explanations immediately after completing the test allowed me to clear grammar doubt loops. I recommend this platform to anyone serious about mock tests."
              </p>
              <div className="testimonial-metrics">
                <span>📝 Writing & Language</span>
                <span>🏆 Rank #3 Global</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <div className="footer-logo">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="logo-icon" style={{ boxShadow: 'none' }}>E</div>
                <span className="logo-text" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff', background: 'none' }}>Examio</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                Dedicated to world-class academic excellence.
              </p>
            </div>
            <div className="footer-links">
              <span>© 2026 Examio. Empowering Future Scholars. Made with </span>
              <span
                id="loveHeart"
                onClick={() => setShowEasterEggModal(true)}
                style={{ cursor: 'pointer', display: 'inline-block', transition: 'transform 0.1s ease', userSelect: 'none' }}
                title="Secret Scholar Portal"
              >
                ❤️
              </span>
              <span> by the Examio Team.</span>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* Main Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-2 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center border border-slate-200/60 bg-white/50 shadow-xs"
                title="Open Menu"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
            )}
            <div 
              className="logo-container" 
              onClick={() => user ? setCurrentView('dashboard') : null}
              style={{ cursor: user ? 'pointer' : 'default' }}
            >
              <div className="logo-icon">E</div>
              <span className="logo-text">Examio</span>
            </div>
          </div>

          {!user ? (
            // Logged Out Header links
            <>


              <div className="header-actions">
                <button
                  className="btn-header-login"
                  onClick={() => { setShowAuthModal(true); setIsRegisteringFromLanding(false); }}
                >
                  Enter Command Center
                </button>
                <button
                  className="btn-header-register btn-premium-action"
                  onClick={() => { setShowAuthModal(true); setIsRegisteringFromLanding(true); }}
                >
                  Start Competing
                </button>
              </div>
            </>
          ) : (
            // Logged In Header controls
            <>
              <div className="flex items-center">
                {/* Active Daily Streak indicator */}
                <div className="hidden md:flex items-center gap-1 text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200/60 px-3.5 py-1.5 rounded-full mr-4 select-none">
                  🔥 {user.xp > 0 ? '5 Day Streak' : '1 Day Streak'}
                </div>
              </div>
              <div className="header-actions">
                {/* User Widget */}
                <div 
                  className="user-profile-widget"
                  onClick={() => setDrawerOpen(true)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Avatar Initials */}
                  <div className="logo-icon" style={{ width: '32px', height: '32px', fontSize: '1rem', boxShadow: 'none' }}>
                    {user.name ? user.name.split(' ').map(n=>n[0]).join('').slice(0,2) : 'A'}
                  </div>
                  
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-meta">
                      <span className="user-level" style={{
                        fontSize: '0.75rem',
                        fontWeight: 850,
                        color: user.level === 'Beginner' ? '#0369a1' : user.level === 'Intermediate' ? '#b45309' : '#047857',
                        backgroundColor: user.level === 'Beginner' ? '#e0f2fe' : user.level === 'Intermediate' ? '#fef3c7' : '#d1fae5',
                        padding: '0.1rem 0.4rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>{user.level}</span>
                      <span className="user-xp" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>✨ {user.xp} XP</span>
                    </div>
                  </div>
                </div>

                <button 
                  className="btn-header-login"
                  onClick={handleLogout}
                  style={{ border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Workspace Router */}
      <main className="dashboard-main" style={{ marginTop: user ? '64px' : '0', padding: user ? '2rem 1.5rem' : '0' }}>
        {user ? (
          <>
            {currentView === 'dashboard' && (
              <ExamSelection
                user={user}
                onSelectExam={handleSelectExam}
                fetchUserStatus={() => fetchUserStatus(user.id)}
                onOpenStats={() => setDrawerOpen(true)}
              />
            )}

            {currentView === 'leaderboard' && (
              <Leaderboard currentUser={user} />
            )}

            {currentView === 'stats' && (
              <StatsView user={user} />
            )}



            {currentView === 'test' && activeTest && (
              <TestEngine
                user={user}
                examId={activeTest.examId}
                subject={activeTest.subject}
                difficulty={activeTest.difficulty}
                onSubmitResult={handleTestSubmit}
                onCancel={() => setCurrentView('dashboard')}
                onSeedTrigger={handleSeedDatabase}
              />
            )}

            {currentView === 'results' && testResults && (
              <Results
                results={testResults}
                onBackToExams={() => setCurrentView('dashboard')}
              />
            )}
          </>
        ) : (
          renderLandingPage()
        )}
      </main>

      {/* Side-Drawer Stats Panel */}
      <AnimatePresence>
        {drawerOpen && (
          <ProfileDrawer
            user={user}
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            onLogout={handleLogout}
            setCurrentView={setCurrentView}
            currentView={currentView}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal overlay */}
      {showAuthModal && (
        <Auth
          onLogin={handleLogin}
          onClose={() => setShowAuthModal(false)}
          initialRegisterState={isRegisteringFromLanding}
        />
      )}

      {/* Easter Egg Input Modal */}
      {showEasterEggModal && (
        <div className="modal-overlay" onClick={() => setShowEasterEggModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div style={{ fontSize: '3rem' }}>💖</div>
            <h3 className="modal-title">Enter your name</h3>
            <p className="modal-desc">Type the special name to access the dedicatory portal</p>
            
            {easterEggError && (
              <div style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>
                {easterEggError}
              </div>
            )}
            
            <input
              type="text"
              className="easter-egg-input"
              placeholder="Full name"
              value={easterEggName}
              onChange={e => setEasterEggName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' ? handleEasterEggSubmit() : null}
            />

            <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
              <button
                onClick={() => { setShowEasterEggModal(false); setEasterEggName(''); }}
                className="btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleEasterEggSubmit}
                className="btn-primary"
                style={{ flex: 1, backgroundColor: '#0F172A', color: 'white' }}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Easter Egg Success Card Modal */}
      {showEasterEggSuccess && (
        <div className="modal-overlay" onClick={() => { setShowEasterEggSuccess(false); setShowEasterEggModal(false); setEasterEggName(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', padding: '3rem' }}>
            <div style={{ fontSize: '4rem', animation: 'slideDown 0.5s ease' }}>🎓👩‍🎓✨</div>
            <h3 className="modal-title" style={{ color: 'var(--primary)', fontSize: '1.75rem', marginTop: '0.5rem' }}>
              Judith Jeremiah Verified
            </h3>
            <p style={{ color: '#047857', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
              🏆 Special Dedicated Scholar 🏆
            </p>
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, #EFF6FF, #ECFEFF)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              color: 'var(--text-secondary)',
              textAlign: 'left'
            }}>
              <p style={{ marginBottom: '1rem' }}>
                "To a brilliant scholar, dedicated student, and future health leader. Your journey is defined by patience, compassion, and academic rigor."
              </p>
              <p>
                Every hour spent preparing, studying formulas, and practicing exam loops is an investment in the lives you will touch and inspire. Stay focused, believe in your capabilities, and never lose sight of your academic calling. The world needs excellent scholars like you!
              </p>
            </div>
            <button
              onClick={() => { setShowEasterEggSuccess(false); setShowEasterEggModal(false); setEasterEggName(''); }}
              className="btn-primary"
              style={{ width: '100%', marginTop: '1.5rem', backgroundColor: '#0F172A', color: 'white' }}
            >
              Return to Platform
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
