'use client'
import { motion } from 'framer-motion'
import { Home, Heart, BarChart3, User } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <motion.button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center gap-1 px-4 py-2 bg-transparent border-none cursor-pointer"
            >
              <Icon
                size={22}
                className={`transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-zinc-600'}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? 'text-cyan-400' : 'text-zinc-600'}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -bottom-1 w-8 h-0.5 rounded-full bg-cyan-400"
                  style={{ boxShadow: '0 0 12px rgba(0,243,255,0.6)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}
