'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSignIn, useSignUp, useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Dumbbell, TrendingDown, TrendingUp, Heart, ArrowRight, Sparkles } from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'

const QUOTES = [
  "The body achieves what the mind believes.",
  "Small daily improvements over time lead to results.",
  "Your only limit is your mind.",
  "Discipline is choosing between what you want now and what you want most.",
]

const GOALS = [
  { id: 'fit', label: 'Get Fit', desc: 'Build overall fitness', icon: Heart, color: '#7c6bc4' },
  { id: 'lose', label: 'Lose Weight', desc: 'Healthy fat loss', icon: TrendingDown, color: '#16a34a' },
  { id: 'gain', label: 'Gain Weight', desc: 'Clean bulk up', icon: TrendingUp, color: '#d97706' },
  { id: 'muscle', label: 'Gain Muscle', desc: 'Build lean mass', icon: Dumbbell, color: '#a78bfa' },
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

function InputField({ icon: Icon, placeholder, type, value, onChange }) {
  return (
    <div className="relative">
      <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="input-field pl-10"
      />
    </div>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState('signin')
  const [showPass, setShowPass] = useState(false)
  const [showGoals, setShowGoals] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [quoteIdx, setQuoteIdx] = useState(0)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const { dark } = useTheme()
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const { signIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn()
  const { signUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp()

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [authLoaded, isSignedIn, router])

  const handleEmailAuth = async () => {
    if (mode === 'signin') {
      if (!signInLoaded) return;
      try {
        setLoading(true);
        const result = await signIn.create({ identifier: email, password });
        if (result.status === 'complete') {
          await setSignInActive({ session: result.createdSessionId });
          router.push('/dashboard');
        } else {
          console.log(result);
        }
      } catch (err) {
        alert(err.errors?.[0]?.longMessage || 'Sign in failed');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) return alert("Please enter email and password");
      setShowGoals(true);
    }
  }

  const handleGoalsSubmit = async () => {
    if (!signUpLoaded) return;
    try {
      setLoading(true);
      const result = await signUp.create({ emailAddress: email, password });
      if (result.status === 'complete') {
         await setSignUpActive({ session: result.createdSessionId });
         router.push('/onboarding');
      } else if (result.status === 'missing_requirements') {
         alert('Please check your email for a verification code, or enable password-only signups in Clerk.');
      }
    } catch (err) {
      alert(err.errors?.[0]?.longMessage || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleOAuth = () => {
    if (!signInLoaded || !signUpLoaded) return;
    if (isSignedIn) { router.push('/dashboard'); return; }
    
    if (mode === 'signin') {
      signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard'
      });
    } else {
      signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/onboarding'
      });
    }
  }

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx(i => (i + 1) % QUOTES.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: 'var(--bg-primary)' }}>

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[42%] flex-col items-center justify-center relative overflow-hidden p-12">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${dark ? 'rgba(124,107,196,0.08)' : 'rgba(124,107,196,0.06)'}, transparent, ${dark ? 'rgba(167,139,250,0.06)' : 'rgba(167,139,250,0.04)'})` }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: dark ? 'rgba(124,107,196,0.06)' : 'rgba(124,107,196,0.08)' }} />
        
        <motion.div className="relative z-10 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c6bc4, #a78bfa)', boxShadow: '0 8px 40px rgba(124,107,196,0.3)' }}>
            <Sparkles size={28} className="text-white" />
          </div>

          <h1 className="text-4xl font-black gradient-text mb-2">Synapze</h1>
          <p className="text-sm mb-12" style={{ color: 'var(--text-muted)' }}>Your Neural Habit Suite</p>
          
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm italic max-w-xs mx-auto leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
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
          <div className="lg:hidden text-center mb-6">
            <div className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c6bc4, #a78bfa)' }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-black gradient-text">Synapze</h2>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 rounded-xl p-1" style={{ background: 'var(--accent-bg)' }}>
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setShowGoals(false) }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border-none cursor-pointer transition-all ${
                  mode === m
                    ? 'text-white shadow-sm'
                    : ''
                }`}
                style={mode === m
                  ? { background: 'linear-gradient(135deg, #7c6bc4, #a78bfa)' }
                  : { color: 'var(--text-muted)', background: 'transparent' }
                }
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
                    <InputField icon={User} placeholder="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
                  )}
                  <InputField icon={Mail} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <div className="relative">
                    <InputField icon={Lock} placeholder="Password" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer" style={{ color: 'var(--text-muted)' }}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {mode === 'signin' && (
                    <p className="text-right text-[11px] cursor-pointer transition-colors" style={{ color: 'var(--accent)' }}>Forgot Password?</p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleEmailAuth}
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl btn-primary text-sm font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : (mode === 'signin' ? 'Sign In' : 'Continue')} <ArrowRight size={16} />
                  </motion.button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleOAuth}
                  className="w-full py-3.5 rounded-xl btn-secondary text-sm font-medium flex items-center justify-center gap-3 cursor-pointer"
                >
                  <GoogleIcon />
                  Continue with Google
                </motion.button>
              </motion.div>
            ) : (
              <motion.div key="goals" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <p className="text-center text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>What&apos;s your primary goal?</p>
                <div className="grid grid-cols-2 gap-3">
                  {GOALS.map(g => (
                    <motion.button
                      key={g.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedGoal(g.id)}
                      className="glass-card p-4 flex flex-col items-center gap-2 cursor-pointer border-none transition-all"
                      style={selectedGoal === g.id ? { borderColor: g.color, boxShadow: `0 0 24px ${g.color}25` } : {}}
                    >
                      <g.icon size={24} style={{ color: g.color }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{g.label}</span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{g.desc}</span>
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoalsSubmit}
                  disabled={!selectedGoal || loading}
                  className="w-full mt-5 py-3.5 rounded-xl btn-primary text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {loading ? 'Creating...' : 'Get Started'} <ArrowRight size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
