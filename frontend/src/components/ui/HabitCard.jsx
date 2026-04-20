'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Flame, Loader2, Trash2 } from 'lucide-react'
import { logHabitCompletion, deleteHabit, getDashboardData, getAnalyticsData } from '@/app/actions'
import { useAuraStore } from '@/lib/store'

export default function HabitCard({ id, name, streak, color = '#00f3ff', done = false, delay = 0 }) {
  const { toggleHabitCompletion, removeHabit, setDashboardData, setAnalyticsData } = useAuraStore()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (loading) return
    setLoading(true)
    toggleHabitCompletion(id) // optimistic toggle
    const res = await logHabitCompletion(id)
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
    const res = await deleteHabit(id)
    if (res && res.refreshNeeded) {
      const [dash, analytics] = await Promise.all([getDashboardData(), getAnalyticsData()])
      if (dash.success) setDashboardData(dash.data)
      if (analytics.success) setAnalyticsData(analytics.data)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      className="glass-card p-4 flex items-center justify-between group hover:border-white/15 transition-colors"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
          <Flame size={20} style={{ color }} />
        </div>
        <div className={`min-w-0 transition-opacity ${done ? 'opacity-40' : ''}`}>
          <p className={`text-sm font-semibold text-zinc-100 truncate transition-all ${done ? 'line-through' : ''}`}>{name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Flame size={12} className="text-orange-400" />
            <span className="text-[11px] font-mono text-zinc-500">{streak} day streak</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2">
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-400/10 border-none cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleToggle}
          disabled={loading}
          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
            done ? 'border-cyan-400 bg-cyan-400/20' : 'border-zinc-700 bg-transparent'
          }`}
        >
          {loading ? (
            <Loader2 size={14} className="text-cyan-400 animate-spin" />
          ) : done ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
              <Check size={16} className="text-cyan-400" />
            </motion.div>
          ) : null}
        </motion.button>
      </div>
    </motion.div>
  )
}
