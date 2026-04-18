'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Dumbbell, TrendingDown, TrendingUp, Heart, ArrowRight } from 'lucide-react'

const QUOTES = [
  "The body achieves what the mind believes.",
  "Small daily improvements over time lead to results.",
  "Your only limit is your mind.",
  "Discipline is choosing between what you want now and what you want most.",
]

const GOALS = [
  { id: 'fit', label: 'Get Fit', desc: 'Build overall fitness', icon: Heart, color: '#00f3ff' },
  { id: 'lose', label: 'Lose Weight', desc: 'Healthy fat loss', icon: TrendingDown, color: '#22c55e' },
  { id: 'gain', label: 'Gain Weight', desc: 'Clean bulk up', icon: TrendingUp, color: '#f97316' },
  { id: 'muscle', label: 'Gain Muscle', desc: 'Build lean mass', icon: Dumbbell, color: '#bf00ff' },
]

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState('signin')
  const [showPass, setShowPass] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [quoteIdx, setQuoteIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#0a0a0f]">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[40%] flex-col items-center justify-center relative overflow-hidden p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
        <motion.div className="relative z-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-black gradient-text mb-3">Project Aura</h1>
          <p className="text-zinc-500 text-sm mb-12">Your Neural Habit Suite</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-zinc-400 text-sm italic max-w-xs mx-auto leading-relaxed"
            >
              &ldquo;{QUOTES[quoteIdx]}&rdquo;
            </motion.p>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card w-full max-w-md p-8"
        >
          {/* Mobile logo */}
          <h2 className="lg:hidden text-2xl font-black gradient-text text-center mb-6">Project Aura</h2>

          {/* Tabs */}
          <div className="flex mb-6 bg-white/5 rounded-lg p-1">
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setShowGoals(false) }}
                className={`flex-1 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider border-none cursor-pointer transition-all ${
                  mode === m ? 'bg-white/10 text-cyan-400' : 'bg-transparent text-zinc-500'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {!showGoals ? (
              <motion.div key={mode} initial={{ opacity: 0, x: mode === 'signin' ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                <div className="space-y-3">
                  {mode === 'signup' && (
                    <InputField icon={User} placeholder="Full Name" type="text" />
                  )}
                  <InputField icon={Mail} placeholder="Email" type="email" />
                  <div className="relative">
                    <InputField icon={Lock} placeholder="Password" type={showPass ? 'text' : 'password'} />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-zinc-600">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {mode === 'signup' && (
                    <InputField icon={Lock} placeholder="Confirm Password" type="password" />
                  )}

                  {mode === 'signin' && (
                    <p className="text-right text-[11px] text-cyan-400/60 cursor-pointer hover:text-cyan-400 transition-colors">Forgot Password?</p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => mode === 'signup' ? setShowGoals(true) : null}
                    className="w-full py-3 rounded-xl btn-primary text-sm font-bold tracking-wider flex items-center justify-center gap-2"
                  >
                    {mode === 'signin' ? 'Sign In' : 'Continue'} <ArrowRight size={16} />
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-300 font-medium flex items-center justify-center gap-3 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <GoogleIcon />
                  Continue with Google
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="goals" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-center text-sm text-zinc-400 mb-5">What&apos;s your primary goal?</p>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map(g => (
                    <motion.button
                      key={g.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedGoal(g.id)}
                      className={`glass-card p-4 flex flex-col items-center gap-2 cursor-pointer border-none transition-all ${
                        selectedGoal === g.id ? '!border-cyan-400/50 shadow-glow-cyan' : ''
                      }`}
                      style={selectedGoal === g.id ? { borderColor: g.color, boxShadow: `0 0 20px ${g.color}30` } : {}}
                    >
                      <g.icon size={24} style={{ color: g.color }} />
                      <span className="text-xs font-bold text-zinc-200">{g.label}</span>
                      <span className="text-[10px] text-zinc-500">{g.desc}</span>
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-5 py-3 rounded-xl btn-primary text-sm font-bold flex items-center justify-center gap-2"
                  style={{ opacity: selectedGoal ? 1 : 0.4 }}
                >
                  Get Started <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

function InputField({ icon: Icon, placeholder, type }) {
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
      <input
        type={type}
        placeholder={placeholder}
        className="w-full py-3 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/20 transition-all"
      />
    </div>
  )
}
