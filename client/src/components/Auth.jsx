import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Read Google Client ID from environment variables, fallback to format placeholder
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '988358482098-j80eocj158q1p2j221uomr354l8nldf8.apps.googleusercontent.com'

const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Failed to decode JWT token', e)
    return null
  }
}

export default function Auth({ onLogin, onClose, initialRegisterState = false }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isRegistering, setIsRegistering] = useState(initialRegisterState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [targetExam, setTargetExam] = useState('JEE')

  // Load Real Google Identity Services SDK
  useEffect(() => {
    let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
    if (!script) {
      script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    const initGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
            const decoded = decodeJwt(response.credential)
            if (!decoded) {
              setError('Failed to retrieve Google user credentials.')
              return
            }

            setLoading(true)
            setError('')
            try {
              const apiResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  email: decoded.email,
                  name: decoded.name,
                  targetExam: targetExam || 'JEE'
                })
              })
              const data = await apiResponse.json()
              if (apiResponse.ok) {
                onLogin(data)
              } else {
                setError(data.error || 'Google Authentication failed')
              }
            } catch (err) {
              setError('Failed to connect to backend server.')
            } finally {
              setLoading(false)
            }
          }
        })

        const btnContainer = document.getElementById('google-signin-btn-container')
        if (btnContainer) {
          btnContainer.innerHTML = ''
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: btnContainer.clientWidth || 380,
            text: isRegistering ? 'signup_with' : 'signin_with'
          })
        }
      } else {
        setTimeout(initGoogleSignIn, 100)
      }
    }

    script.addEventListener('load', initGoogleSignIn)
    if (window.google?.accounts?.id) {
      initGoogleSignIn()
    }

    return () => {
      script.removeEventListener('load', initGoogleSignIn)
    }
  }, [isRegistering, targetExam])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || (isRegistering && !name)) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    const finalName = name || email.split('@')[0]

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: finalName, targetExam })
      })

      const data = await response.json()
      if (response.ok) {
        onLogin(data)
      } else {
        setError(data.error || 'Authentication failed')
      }
    } catch (err) {
      setError('Failed to connect to backend server. Is it running?')
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (e) => {
    e.stopPropagation()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-[6px] p-4 overflow-y-auto" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_50px_-15px_rgba(79,70,229,0.15)] overflow-hidden grid grid-cols-1 md:grid-cols-2 my-auto max-h-[95vh] md:max-h-none overflow-y-auto md:overflow-visible"
        onClick={handleCardClick}
      >
        
        {/* Left Column - Cover section (visible on desktop) */}
        <div 
          className="hidden md:flex relative flex-col justify-between p-10 text-white bg-cover bg-center select-none"
          style={{ backgroundImage: `url('/auth_banner.png')` }}
        >
          {/* Violet/Indigo Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-indigo-900/85 to-purple-950/90 pointer-events-none" />

          {/* Brand Logo */}
          <div className="relative z-10 flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-lg font-display" style={{ color: '#ffffff' }}>
              E
            </div>
            <span className="font-display font-black text-lg tracking-tight text-white" style={{ color: '#ffffff' }}>Examio</span>
          </div>

          {/* Slogan */}
          <div className="relative z-10 space-y-4">
            <h1 className="text-3xl font-black tracking-tight leading-tight font-display text-white" style={{ color: '#ffffff' }}>
              Empowering Competitive Academic Excellence.
            </h1>
            <p className="text-xs font-semibold leading-relaxed text-slate-200" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              Access structured study resources, simulate real-time computer-based tests, and benchmark your rank nationally. Engineered for competitive entrance exam candidates.
            </p>
          </div>

          {/* Testimonial Capsule */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
            <p className="text-xs italic font-semibold leading-relaxed text-white" style={{ color: '#ffffff' }}>
              "The realistic CBT simulation and detailed analytics on Examio were essential in optimizing my performance for the JEE entrance."
            </p>
            <div className="text-[10px] font-black uppercase tracking-wider text-cyan-200 mt-2" style={{ color: '#a5f3fc' }}>
              — Aarav Mehta, JEE Candidate
            </div>
          </div>
        </div>

        {/* Right Column - Form actions */}
        <div className="relative flex flex-col justify-between p-8 md:p-10 bg-white select-none">
          
          {/* Close button in top-right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors text-2xl font-bold p-1 select-none focus:outline-none"
            aria-label="Close Modal"
          >
            &times;
          </button>

          {/* Form Header */}
          <div className="space-y-2 mt-4">
            <h2 className="text-2xl font-black text-slate-800 font-display tracking-tight">
              {isRegistering ? 'Welcome to Examio!' : 'Welcome Back!'}
            </h2>
            <p className="text-slate-400 text-xs font-semibold">
              {isRegistering ? 'Create your account to start preparing' : 'Continue your journey to academic excellence.'}
            </p>
          </div>

          {/* Errors display */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 text-red-650 p-3.5 rounded-xl text-xs font-bold leading-relaxed mt-4"
            >
              {error}
            </motion.div>
          )}

          {/* Inputs Form */}
          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold outline-none"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="targetExam" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Target Exam Track</label>
                  <select
                    id="targetExam"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold outline-none cursor-pointer"
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    disabled={loading}
                  >
                    <option value="JEE">JEE (Engineering Entrance)</option>
                    <option value="NEET">NEET (Medical Entrance)</option>
                    <option value="UPSC">UPSC (Civil Services)</option>
                    <option value="SSC">SSC (Government Placement)</option>
                    <option value="WBJEE">WBJEE (State Engineering)</option>
                  </select>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-semibold outline-none"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-indigo-600/15"
              disabled={loading}
            >
              {loading ? 'Processing...' : isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Form switcher */}
          <div className="text-center text-xs text-slate-400 font-semibold pt-4">
            {isRegistering ? (
              <span>
                Already have an account?
                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setError(''); }}
                  className="text-indigo-600 hover:text-indigo-500 font-extrabold underline ml-1.5"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?
                <button
                  type="button"
                  onClick={() => { setIsRegistering(true); setError(''); }}
                  className="text-indigo-600 hover:text-indigo-500 font-extrabold underline ml-1.5"
                >
                  Register here
                </button>
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center text-[9px] uppercase font-black tracking-widest text-slate-400 my-4 before:content-[''] before:flex-1 before:border-b before:border-slate-150 before:mr-3 after:content-[''] after:flex-1 after:border-b after:border-slate-150 after:ml-3">
            or
          </div>

          {/* Real Google Sign-In Button */}
          <div
            id="google-signin-btn-container"
            className="w-full flex justify-center min-h-[44px]"
          />

          {/* Form Footer */}
          <div className="text-[10px] text-slate-400 font-semibold text-center mt-6">
            © 2026 Examio. Dedicated to Indian academic excellence.
          </div>
        </div>

      </motion.div>
    </div>
  )
}
