'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Flame } from 'lucide-react'

export default function HabitCard({ icon: Icon, name, streak, color, delay = 0 }) {
  const [done, setDone] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300 }}
      className="glass-card p-4 flex items-center justify-between group hover:border-white/15 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">{name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Flame size={12} className="text-orange-400" />
            <span className="text-[11px] font-mono text-zinc-500">{streak} day streak</span>
          </div>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => setDone(!done)}
        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
          done ? 'border-cyan-400 bg-cyan-400/20' : 'border-zinc-700 bg-transparent'
        }`}
      >
        {done && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            <Check size={16} className="text-cyan-400" />
          </motion.div>
        )}
      </motion.button>
    </motion.div>
  )
}
