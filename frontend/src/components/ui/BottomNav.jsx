'use client'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Heart, BarChart3, User, Plus, Sparkles, Utensils, Activity, Flame, ChevronUp, Sun, Moon, BookOpen } from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'
import Magnetic from '@/components/ui/Magnetic'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const TABS = [
  { id: 'home',     label: 'Dashboard', icon: Home,      href: '/dashboard' },
  { id: 'health',   label: 'Health',    icon: Heart,     href: '/dashboard' },
  { id: 'progress', label: 'Progress',  icon: BarChart3, href: '/dashboard' },
  { id: 'journal',  label: 'Journal',   icon: BookOpen,  href: '/dashboard' },
  { id: 'profile',  label: 'Profile',   icon: User,      href: '/dashboard' },
]

const ACTIONS = [
  {
    id: 'food',
    label: 'Log Food',
    sub: 'Snap or describe a meal',
    icon: Utensils,
    color: '#e9a8fc',
    bg: 'rgba(233,168,252,0.12)',
    border: 'rgba(233,168,252,0.25)',
    glow: 'rgba(233,168,252,0.3)',
  },
  {
    id: 'habit',
    label: 'Add Habit',
    sub: 'Build a new streak',
    icon: Flame,
    color: '#f97316',
    bg: 'rgba(249,115,22,0.1)',
    border: 'rgba(249,115,22,0.2)',
    glow: 'rgba(249,115,22,0.25)',
  },
  {
    id: 'activity',
    label: 'Log Activity',
    sub: 'Run, gym, walk & more',
    icon: Activity,
    color: '#7c6bc4',
    bg: 'rgba(124,107,196,0.1)',
    border: 'rgba(124,107,196,0.2)',
    glow: 'rgba(124,107,196,0.25)',
  },
  {
    id: 'journal',
    label: 'Journal Entry',
    sub: 'Write your thoughts',
    icon: BookOpen,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.2)',
    glow: 'rgba(59,130,246,0.25)',
  },
]

export default function BottomNav({ active, onChange, onAdd, onAddFood, onAddHabit, onAddActivity, onAddJournal }) {
  const [addOpen, setAddOpen] = useState(false)
  const { dark, toggle } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const handleTabClick = (tab) => {
    if (tab.href !== '/dashboard') {
      if (pathname !== tab.href) router.push(tab.href)
    } else {
      if (pathname === '/dashboard') {
        onChange?.(tab.id)
      } else {
        router.push('/dashboard')
      }
    }
  }

  const handleAction = (id) => {
    setAddOpen(false)
    if (id === 'food')     onAddFood?.()
    if (id === 'habit')    onAddHabit?.()
    if (id === 'activity') onAddActivity?.()
    if (id === 'journal')  onAddJournal?.()
  }

  return (
    <>
      {/* -- Desktop Sidebar --------------------------------------------------- */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[220px] z-50 flex-col py-8 px-4 overflow-y-auto custom-scrollbar"
        style={{
          background: 'var(--surface-elevated)',
          backdropFilter: 'blur(40px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.3)',
          borderRight: '1px solid var(--border)',
          boxShadow: dark ? '4px 0 40px rgba(0,0,0,0.4)' : '4px 0 40px rgba(124,107,196,0.06)',
        }}>

        {/* Logo row with dark mode toggle */}
        <div className="flex items-center gap-2.5 px-3 mb-4">
          <Magnetic strength={0.2}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg,#7c6bc4,#a78bfa)', boxShadow: '0 4px 16px rgba(124,107,196,0.3)' }}>
              <Sparkles size={19} className="text-white relative z-10 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-white/20 rounded-2xl"
                style={{ transform: 'rotate(-20deg) translateY(-60%)' }} />
              {/* Holographic shimmer */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ skewX: -20 }}
              />
            </div>
          </Magnetic>
          <div className="flex-1">
            <h1 className="text-base font-black tracking-tight gradient-text"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.03em' }}>
              Synapze
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] -mt-0.5 opacity-50" style={{ color: 'var(--text-primary)' }}>Neural Health</p>
          </div>
          {/* Dark mode toggle */}
          <Magnetic strength={0.3}>
            <motion.button
              onClick={toggle}
              whileTap={{ scale: 0.85 }}
              title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="relative w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer overflow-hidden shrink-0 group"
              style={{
                background: dark ? 'rgba(167,139,250,0.15)' : 'rgba(124,107,196,0.08)',
                border: dark ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(124,107,196,0.15)',
              }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-accent/10 to-accent-light/10" />
              <AnimatePresence mode="wait">
                {dark ? (
                  <motion.div key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun size={15} style={{ color: 'var(--accent)' }} strokeWidth={2.2} />
                  </motion.div>
                ) : (
                  <motion.div key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon size={15} style={{ color: 'var(--accent)' }} strokeWidth={2.2} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </Magnetic>
        </div>

        {/* Theme label pill */}
        <div className="px-3 mb-6">
          <div className="w-full flex rounded-xl overflow-hidden"
            style={{ background: 'rgba(124,107,196,0.06)', border: '1px solid rgba(124,107,196,0.1)', padding: 3 }}>
            {[{ label: 'Light', val: false }, { label: 'Dark', val: true }].map(opt => (
              <button key={opt.label} onClick={() => opt.val !== dark && toggle()}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer border-none relative"
                style={{
                  background: dark === opt.val
                    ? 'linear-gradient(135deg,#7c6bc4,#a78bfa)'
                    : 'transparent',
                  color: dark === opt.val ? '#fff' : '#6b6490',
                  boxShadow: dark === opt.val ? '0 2px 8px rgba(124,107,196,0.4)' : 'none',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1.5 relative z-10">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = pathname === tab.href
              ? tab.href !== '/dashboard' || active === tab.id
              : active === tab.id
            return (
              <div key={tab.id} className="w-full">
                <Magnetic strength={0.15} className="w-full">
                  <motion.button
                    onClick={() => handleTabClick(tab)}
                    whileTap={{ scale: 0.96 }}
                    className={cn(
                      "relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer border-none text-left overflow-hidden group active:bg-accent/10",
                      isActive ? "text-accent" : "text-muted hover:text-primary hover:bg-accent/5"
                    )}
                  >
                  {isActive && (
                    <>
                      <motion.div
                        layoutId="sidebarBg"
                        className="absolute inset-0 bg-accent/15 rounded-2xl pointer-events-none"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                      <motion.div
                        layoutId="sidebarIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                        style={{ background: 'var(--accent)' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    </>
                  )}
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
                    isActive ? "bg-accent/10 text-accent" : "bg-transparent text-muted group-hover:bg-accent/5 group-hover:text-primary"
                  )}>
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="font-bold tracking-tight">{tab.label}</span>
                  {isActive && (
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" style={{ boxShadow: '0 0 10px var(--accent)' }} />
                    </div>
                  )}
                </motion.button>
                </Magnetic>
              </div>
            )
          })}
        </nav>

        {/* -- Expandable Add Panel ------------------------------------------- */}
        <div className="mt-auto pt-4 space-y-2">
          {/* Expanded action list */}
          <AnimatePresence>
            {addOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="space-y-2 pb-1"
              >
                {ACTIONS.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ delay: i * 0.055 }}
                      onClick={() => handleAction(action.id)}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.96 }}
                      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left border-none cursor-pointer transition-all"
                      style={{
                        background: action.bg,
                        border: `1px solid ${action.border}`,
                        boxShadow: `0 2px 12px ${action.glow}`,
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `${action.color}20` }}>
                        <Icon size={16} style={{ color: action.color }} strokeWidth={2.2} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{action.label}</p>
                        <p className="text-[9px] font-medium leading-tight mt-0.5" style={{ color: 'var(--text-muted)' }}>{action.sub}</p>
                      </div>
                      <div className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: action.color, boxShadow: `0 0 6px ${action.color}` }} />
                    </motion.button>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main toggle button */}
          <Magnetic strength={0.25}>
            <motion.button
              onClick={() => setAddOpen(o => !o)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              className="relative w-full flex items-center justify-center gap-2.5 py-4 rounded-3xl text-white font-black text-sm border-none cursor-pointer overflow-hidden group shadow-2xl"
              style={{
                background: addOpen
                  ? 'linear-gradient(135deg,#5a4aaa,#8b73e0)'
                  : 'linear-gradient(135deg,#7c6bc4,#a78bfa)',
                transition: 'background 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {/* Border Beam Animation */}
              <div className="absolute inset-0 p-[1px] rounded-3xl overflow-hidden pointer-events-none">
                <motion.div 
                  className="absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_120deg,rgba(255,255,255,0.4)_180deg,transparent_240deg)]"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </div>

              {/* Inner highlight */}
              <div className="absolute inset-0 rounded-3xl border border-white/20 pointer-events-none" />

              <motion.div
                animate={{ rotate: addOpen ? 45 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="relative z-10"
              >
                <Plus size={20} strokeWidth={3} />
              </motion.div>
              <span className="relative z-10 tracking-widest uppercase text-[11px] font-black">
                {addOpen ? 'Close' : 'Add Entry'}
              </span>
              
              {/* Pulsing glow background */}
              <div className="absolute inset-0 bg-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.button>
          </Magnetic>

          <p className="text-center text-[9px] font-medium tracking-wider uppercase" style={{ color: 'var(--text-faint)' }}>
            v1.0 • Synapze AI
          </p>
        </div>
      </aside>

      {/* -- Mobile Bottom Nav ------------------------------------------------ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(40px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
          borderTop: '1px solid var(--nav-border)',
          boxShadow: dark ? '0 -4px 30px rgba(0,0,0,0.4)' : '0 -4px 30px rgba(124,107,196,0.08)',
        }}>
        <div className="w-full max-w-lg mx-auto flex items-center justify-between py-2 px-1 sm:px-4">
          {TABS.slice(0, 2).map(tab => <MobileNavItem key={tab.id} tab={tab} active={active} pathname={pathname} onTabClick={handleTabClick} />)}

          {/* Center FAB */}
          <div className="relative -mt-10 px-2">
            <Magnetic strength={0.4}>
              <motion.button
                onClick={onAdd}
                whileTap={{ scale: 0.82 }}
                whileHover={{ scale: 1.1 }}
                className="relative flex items-center justify-center border-none cursor-pointer group"
                style={{ width: 68, height: 68 }}
              >
                {/* Simple static glow instead of complex conic gradient */}
                <div className="absolute inset-0 rounded-full opacity-30 blur-xl"
                  style={{ background: 'var(--accent)' }} />
                
                {/* Optimized simple pulse */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-[var(--accent)]"
                  animate={{ opacity: [0.15, 0.05, 0.15] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                <div className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #7c6bc4, #8b5cf6, #a78bfa)',
                    boxShadow: '0 12px 32px rgba(124,107,196,0.6), inset 0 2px 8px rgba(255,255,255,0.4)',
                  }}>
                  
                  {/* Static high-performance border */}
                  <div className="absolute inset-0 p-[2px] rounded-full border border-white/30" />

                  {/* Glass Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
                  
                  {/* Subtle inner detail */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Sparkles size={48} className="text-white" />
                  </div>

                  <Plus size={32} className="text-white relative z-10 drop-shadow-lg" strokeWidth={3} />
                </div>
              </motion.button>
            </Magnetic>
          </div>

          {TABS.slice(2, 4).map(tab => <MobileNavItem key={tab.id} tab={tab} active={active} pathname={pathname} onTabClick={handleTabClick} />)}
        </div>
      </nav>

      {/* Mobile add panel overlay */}
    </>
  )
}

function MobileNavItem({ tab, active, pathname, onTabClick }) {
  const Icon = tab.icon
  const isActive = tab.href !== '/dashboard'
    ? pathname === tab.href
    : active === tab.id
  return (
    <motion.button
      onClick={() => onTabClick(tab)}
      whileTap={{ scale: 0.88 }}
      className="relative flex flex-col items-center gap-1 px-2 sm:px-4 py-2 bg-transparent border-none cursor-pointer min-w-[64px]"
    >
      <div className="relative">
        {isActive && (
          <motion.div layoutId="mobileActiveBg"
            className="absolute -inset-2 rounded-xl"
            style={{ background: 'rgba(124,107,196,0.1)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Icon size={22}
          className="relative z-10 transition-colors duration-200"
          style={{ color: isActive ? 'var(--accent)' : 'var(--text-faint)' }}
          strokeWidth={isActive ? 2.5 : 1.7}
        />
      </div>
      <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-tight sm:tracking-wider transition-colors"
        style={{ color: isActive ? 'var(--accent)' : 'var(--text-faint)' }}>
        {tab.label}
      </span>
      {isActive && (
        <motion.div
          layoutId="mobileIndicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full"
          style={{ background: 'var(--accent)', boxShadow: '0 0 12px var(--accent)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  )
}
