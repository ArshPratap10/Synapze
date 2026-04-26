'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Target, Shield, Palette, Database, ChevronRight, LogOut, Moon, Sun, Download, Trash2, Link, Save, Utensils, Apple, Zap, Flame } from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'
import { useSynapzeStore } from '@/lib/store'
import { updateProfile } from '@/app/actions'
import { SignOutButton } from "@clerk/nextjs"

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
  <div className="flex items-center justify-between py-3.5 last:border-none" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
        <Icon size={15} style={{ color: 'var(--accent)' }} />
      </div>
      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
    </div>
    {children}
  </div>
)

const GoalInput = ({ icon: Icon, label, value, onChange, unit = 'g', color }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <span className="text-sm font-bold text-[var(--text-secondary)]">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      <input 
        type="number" 
        value={value} 
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-20 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-right font-mono text-sm font-bold text-[var(--text-primary)] focus:border-[var(--accent)] outline-none"
      />
      <span className="text-xs font-black text-[var(--text-faint)] w-4">{unit}</span>
    </div>
  </div>
)

function Toggle({ defaultOn = false, onChange }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button
      onClick={() => { setOn(!on); onChange?.(!on) }}
      className="w-12 h-6 rounded-full relative transition-colors cursor-pointer border-none"
      style={{ background: on ? 'var(--accent)' : 'var(--border)' }}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white absolute top-0.5"
        animate={{ left: on ? '24px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}
      />
    </button>
  )
}

export default function ProfilePage() {
  const { dark, toggle } = useTheme()
  const { user, setUser } = useSynapzeStore()
  const [isSaving, setIsSaving] = useState(false)
  const [targets, setTargets] = useState({
    calories: user?.targetCalories || 2000,
    protein: user?.targetProtein || 120,
    carbs: user?.targetCarbs || 200,
    fat: user?.targetFat || 60
  })

  useEffect(() => {
    if (user) {
      setTargets({
        calories: user.targetCalories,
        protein: user.targetProtein,
        carbs: user.targetCarbs,
        fat: user.targetFat
      })
    }
  }, [user])

  const handleSave = async () => {
    setIsSaving(true)
    const res = await updateProfile({
      targetCalories: targets.calories,
      targetProtein: targets.protein,
      targetCarbs: targets.carbs,
      targetFat: targets.fat
    })
    if (res.success) {
      setUser(res.data)
      alert("Profile updated!")
    } else {
      alert("Error: " + res.error)
    }
    setIsSaving(false)
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="bg-mesh" />
      <div className="max-w-2xl mx-auto space-y-5 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-black"
            style={{ color: 'var(--text-primary)' }}
          >
            Profile
          </motion.h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#7c6bc4] to-[#a78bfa] text-white font-black text-sm shadow-lg shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>

        {/* User Info */}
        <Card delay={0.1}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c6bc4, #a78bfa)', boxShadow: '0 4px 20px rgba(124,107,196,0.25)' }}>
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</h2>
              <p className="text-xs font-bold mt-0.5" style={{ color: 'var(--text-muted)' }}>{user?.email || 'health.enthusiast@synapze.ai'}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full" style={{ background: 'var(--accent-bg)' }}>
                <Target size={12} style={{ color: 'var(--accent)' }} />
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Goal: {user?.goal || 'General Health'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Nutritional Goals */}
        <Card delay={0.2}>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Apple size={14} className="text-[#7c6bc4]" /> Daily Nutritional Targets
          </h3>
          <div className="divide-y divide-[var(--border-subtle)]">
            <GoalInput icon={Flame} label="Daily Calories" unit="kcal" color="#7c6bc4" value={targets.calories} onChange={v => setTargets({...targets, calories: v})} />
            <GoalInput icon={Zap} label="Protein Target" color="#f87171" value={targets.protein} onChange={v => setTargets({...targets, protein: v})} />
            <GoalInput icon={Utensils} label="Carbs Target" color="#a78bfa" value={targets.carbs} onChange={v => setTargets({...targets, carbs: v})} />
            <GoalInput icon={Utensils} label="Fat Target" color="#f59e0b" value={targets.fat} onChange={v => setTargets({...targets, fat: v})} />
          </div>
        </Card>

        {/* Preferences */}
        <Card delay={0.3}>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Palette size={14} /> Preferences
          </h3>
          <SettingRow icon={dark ? Moon : Sun} label="Dark Mode">
            <Toggle defaultOn={dark} onChange={toggle} />
          </SettingRow>
        </Card>

        {/* Data */}
        <Card delay={0.4}>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
            <Database size={14} /> Data & Privacy
          </h3>
          <div className="space-y-2.5">
            <motion.button whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] text-sm font-bold cursor-pointer flex items-center justify-center gap-2 text-[var(--text-secondary)]">
              <Download size={16} /> Export Data
            </motion.button>
            <motion.button whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-colors"
              style={{
                background: dark ? 'rgba(239,68,68,0.1)' : 'rgba(220,38,38,0.06)',
                border: `1px solid ${dark ? 'rgba(239,68,68,0.2)' : 'rgba(220,38,38,0.15)'}`,
                color: 'var(--red)'
              }}>
              <Trash2 size={16} /> Delete Account
            </motion.button>
          </div>
        </Card>

        <SignOutButton>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm font-black cursor-pointer flex items-center justify-center gap-2 text-[var(--text-primary)]"
          >
            <LogOut size={16} /> Sign Out
          </motion.button>
        </SignOutButton>
      </div>
    </div>
  )
}

