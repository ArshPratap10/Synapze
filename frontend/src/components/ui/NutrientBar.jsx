'use client'
import { motion } from 'framer-motion'

export default function NutrientBar({ label, value, max, color = '#00f3ff', unit = 'g' }) {
  const pct = Math.min((value / max) * 100, 100)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#a09abc]">{label}</span>
        <span className="text-xs font-mono text-[#f0ecff]">{value}{unit}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)]/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}

