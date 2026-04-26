'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame, Loader2, Trash2, Heart, Dumbbell, Brain, Droplets, Moon, Coffee, BookOpen, Bike } from 'lucide-react'
import { logHabitCompletion, deleteHabit, getDashboardData, getAnalyticsData } from '@/app/actions'
import { useSynapzeStore } from '@/lib/store'

// --- Category detection ------------------------------------------------------
function detectCategory(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('health') || n.includes('drink') || n.includes('water') || n.includes('hydrat'))
    return { label: 'Health', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: Droplets }
  if (n.includes('fitness') || n.includes('run') || n.includes('gym') || n.includes('workout') || n.includes('exercise') || n.includes('km') || n.includes('walk'))
    return { label: 'Fitness', color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: Dumbbell }
  if (n.includes('sleep') || n.includes('rest') || n.includes('bed'))
    return { label: 'Sleep', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: Moon }
  if (n.includes('meditat') || n.includes('mindful') || n.includes('breath') || n.includes('calm'))
    return { label: 'Mind', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: Brain }
  if (n.includes('read') || n.includes('book') || n.includes('learn') || n.includes('study'))
    return { label: 'Learn', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: BookOpen }
  if (n.includes('eat') || n.includes('food') || n.includes('meal') || n.includes('diet') || n.includes('protein') || n.includes('chicken'))
    return { label: 'Nutrition', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: Coffee }
  // default
  return { label: 'Habit', color: '#7c6bc4', bg: 'rgba(124,107,196,0.1)', icon: Flame }
}

// --- Confetti burst on completion -------------------------------------------
function ConfettiBurst({ show }) {
  if (!show) return null
  const dots = Array.from({ length: 8 }, (_, i) => ({
    x: Math.cos((i / 8) * Math.PI * 2) * 28,
    y: Math.sin((i / 8) * Math.PI * 2) * 28,
    color: ['#7c6bc4', '#a78bfa', '#22c55e', '#f59e0b', '#06b6d4'][i % 5],
  }))
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {dots.map((d, i) => (
        <motion.div key={i}
          initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
          animate={{ x: d.x, y: d.y, scale: 0, opacity: 0 }}
          transition={{ duration: 0.5, delay: i * 0.03, ease: 'easeOut' }}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: d.color }}
        />
      ))}
    </div>
  )
}

export default function HabitCard({ id, name, streak, color = '#7c6bc4', done = false, delay = 0, selectedDate = null }) {
  const { toggleHabitCompletion, removeHabit, setDashboardData, setAnalyticsData } = useSynapzeStore()
  const [loading, setLoading] = useState(false)
  const [burst, setBurst] = useState(false)

  const cat = detectCategory(name)
  const CatIcon = cat.icon

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)
    if (!done) { setBurst(true); setTimeout(() => setBurst(false), 600) }
    toggleHabitCompletion(id)
    const res = await logHabitCompletion(id, selectedDate)
    if (res && res.refreshNeeded) {
      const [dash, analytics] = await Promise.all([getDashboardData(), getAnalyticsData()])
      if (dash.success) setDashboardData(dash.data)
      if (analytics.success) setAnalyticsData(analytics.data)
    }
    setLoading(false)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    removeHabit(id)
    const res = await deleteHabit(id, selectedDate)
    if (res && res.refreshNeeded) {
      const [dash, analytics] = await Promise.all([getDashboardData(), getAnalyticsData()])
      if (dash.success) setDashboardData(dash.data)
      if (analytics.success) setAnalyticsData(analytics.data)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 320, damping: 28 }}
      className="relative group glass-card"
      style={{
        background: done
          ? `linear-gradient(135deg, ${cat.bg}, var(--surface))`
          : 'var(--surface)',
        border: done
          ? `1px solid ${cat.color}30`
          : '1px solid var(--border)',
        borderRadius: '1rem',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: done
          ? `0 2px 16px ${cat.color}18, 0 1px 3px rgba(0,0,0,0.03)`
          : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <ConfettiBurst show={burst} />

      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Category icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{ background: cat.bg, border: `1px solid ${cat.color}20` }}>
          <CatIcon size={18} style={{ color: cat.color }} />
        </div>

        <div className={`min-w-0 flex-1 transition-all duration-300 ${done ? 'opacity-50' : ''}`}>
          {/* Category chip */}
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md"
              style={{ color: cat.color, background: cat.bg, border: `1px solid ${cat.color}25` }}>
              {cat.label}
            </span>
          </div>
          <p className="text-sm font-semibold truncate transition-all" style={{ color: 'var(--text-primary)', textDecoration: done ? 'line-through' : 'none', textDecorationColor: 'var(--text-muted)' }}>
            {/* Strip any prefix followed by " --- " or " - " */}
            {name.includes(' --- ') ? name.split(' --- ')[1] : name.includes(' - ') ? name.split(' - ')[1] : name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Flame size={11} className="text-orange-400" />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
              {streak > 0 ? `${streak} day streak` : 'Start your streak today'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2 shrink-0">
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:text-red-400 hover:bg-red-50 border-none cursor-pointer"
          style={{ color: 'var(--text-faint)' }}
        >
          <Trash2 size={13} />
        </button>

        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={handleToggle}
          disabled={loading}
          className={`relative w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer overflow-hidden ${!done ? 'bg-white/[0.04] dark:bg-white/5 border-[#d4c8e8] dark:border-white/10' : ''}`}
          style={{
            borderColor: done ? cat.color : undefined,
            background: done
              ? `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)`
              : undefined,
            boxShadow: done ? `0 2px 10px ${cat.color}40` : 'none',
          }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 size={15} className="animate-spin" style={{ color: cat.color }} />
              </motion.div>
            ) : done ? (
              <motion.div key="done"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <Check size={17} strokeWidth={3.5} className="text-white" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  )
}
