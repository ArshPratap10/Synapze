'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Target, Shield, Palette, Database, ChevronRight, LogOut, Moon, Sun, Download, Trash2, Link } from 'lucide-react'

const Card = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card p-5"
  >
    {children}
  </motion.div>
)

const SettingRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-none">
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-zinc-500" />
      <span className="text-sm text-zinc-300">{label}</span>
    </div>
    {children}
  </div>
)

function Toggle({ defaultOn = false }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => setOn(!on)}
      className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer border-none ${on ? 'bg-cyan-400' : 'bg-zinc-700'}`}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white absolute top-0.5"
        animate={{ left: on ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-5">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-bold text-zinc-100 mb-6"
        >
          Profile
        </motion.h1>

        {/* User Info */}
        <Card delay={0.1}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-black text-white shrink-0">
              A
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-zinc-100">Alex Johnson</h2>
              <p className="text-xs text-zinc-500 mt-0.5">alex.johnson@email.com</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-cyan-400/10">
                <Target size={12} className="text-cyan-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Goal: Lose Weight</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Settings */}
        <Card delay={0.2}>
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-3 flex items-center gap-2">
            <Shield size={14} /> Account Settings
          </h3>
          <SettingRow icon={Mail} label="Change Email">
            <ChevronRight size={16} className="text-zinc-600" />
          </SettingRow>
          <SettingRow icon={Shield} label="Change Password">
            <ChevronRight size={16} className="text-zinc-600" />
          </SettingRow>
          <SettingRow icon={Link} label="Google Account">
            <Toggle defaultOn={true} />
          </SettingRow>
        </Card>

        {/* Preferences */}
        <Card delay={0.3}>
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-3 flex items-center gap-2">
            <Palette size={14} /> Preferences
          </h3>
          <SettingRow icon={Moon} label="Dark Mode">
            <Toggle defaultOn={true} />
          </SettingRow>
        </Card>

        {/* Data */}
        <Card delay={0.4}>
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400 mb-3 flex items-center gap-2">
            <Database size={14} /> Data & Privacy
          </h3>
          <div className="space-y-2">
            <motion.button whileTap={{ scale: 0.98 }} className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-300 cursor-pointer flex items-center justify-center gap-2 hover:bg-white/10 transition-colors">
              <Download size={16} /> Export Data
            </motion.button>
            <motion.button whileTap={{ scale: 0.98 }} className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 cursor-pointer flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
              <Trash2 size={16} /> Delete Account
            </motion.button>
          </div>
        </Card>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-zinc-500 cursor-pointer flex items-center justify-center gap-2 hover:text-zinc-300 transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </motion.button>
      </div>
    </div>
  )
}
