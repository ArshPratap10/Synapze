'use client'
// Force hot reload
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Flame, Zap, Plus, Utensils, Activity, TrendingUp, Sparkles, Apple, Heart, BarChart3, ChevronDown, ChevronUp, Trash2, Target, Leaf, Bike, Dumbbell, Footprints, PersonStanding, Timer, CheckCircle2, Droplets, Calendar, User } from 'lucide-react'
import { ResponsiveContainer, RadialBarChart, RadialBar, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import BottomNav from '@/components/ui/BottomNav'
import { JournalTab } from '@/components/ui/JournalTab'
import HabitCard from '@/components/ui/HabitCard'
import NutrientBar from '@/components/ui/NutrientBar'
import { GlobalActionMenu, HabitCreationModal, FoodLogModal, ActivityLogModal } from '@/components/ui/ActionModals'
import { ProgressAnalytics } from '@/components/ui/ProgressAnalytics'
import { useSynapzeStore } from '@/lib/store'
import { getDashboardData, getAnalyticsData, generateDailyScore, deleteFoodLog, deleteActivityLog, clarifyDayQuery, getDataForDate, updateProfile, getWeightLogs, logWater, getTodayWater } from '@/app/actions'
import { UserButton } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useTheme } from '@/lib/ThemeContext'

const NeuralBloom = dynamic(
  () => import('@/components/ui/NeuralScoreParticles'),
  { ssr: false, loading: () => <div className="w-full h-[180px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#7c6bc4] border-t-transparent rounded-full animate-spin" /></div> }
)

function Card({ children, className = '', delay = 0, span = '' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className={`glass-card p-5 ${span} ${className}`}>
      {children}
    </motion.div>
  )
}

// --- Date Picker ----------------------------------------------------------------
function DatePicker({ selectedDate, onSelect, joinedAt }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Build list of dates from joinDate to today
  const dates = useMemo(() => {
    const list = []
    const start = new Date(joinedAt)
    start.setHours(0,0,0,0)
    const today = new Date()
    today.setHours(0,0,0,0)
    for (let d = new Date(today); d >= start; d.setDate(d.getDate() - 1)) {
      list.push(new Date(d))
    }
    return list
  }, [joinedAt])

  const isToday = (d) => new Date(d).toDateString() === new Date().toDateString()
  const label = isToday(selectedDate)
    ? 'Today'
    : new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 dark:bg-white/10 border border-white/50 dark:border-white/10 hover:border-[#a78bfa]/40 hover:bg-white/80 dark:hover:bg-white/20 transition-all group cursor-pointer"
      >
        <span className="text-xs font-bold text-[var(--text-secondary)] dark:!text-white/90 group-hover:text-[#7c6bc4] dark:group-hover:!text-white transition-colors">{label}</span>
        <ChevronDown size={13} className={`text-[var(--text-muted)] dark:!text-white/60 group-hover:text-[#7c6bc4] dark:group-hover:!text-white/90 transition-all ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-50 w-52 max-h-72 overflow-y-auto glass-card !p-2 custom-scrollbar shadow-soft-lg"
          >
            {dates.map((d, i) => {
              const ds = d.toISOString()
              const active = new Date(selectedDate).toDateString() === d.toDateString()
              const tod = isToday(d)
              return (
                <button
                  key={i}
                  onClick={() => { onSelect(ds); setOpen(false) }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    active ? 'bg-[#7c6bc4]/10 text-[#7c6bc4]' : 'text-[var(--text-muted)] hover:bg-[#7c6bc4]/5 hover:text-[var(--text-secondary)]'
                  }`}
                >
                  <span>{tod ? '✦ Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-[#7c6bc4] shrink-0" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function CardHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-[#7c6bc4]/10 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-[#7c6bc4]" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>
      </div>
      {action}
    </div>
  )
}

function Counter({ target }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let frame, start
    setVal(0)
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 900, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(Math.floor(ease * target))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return <span className="font-mono text-[var(--text-primary)]">{val.toLocaleString()}</span>
}

// --- Macro Ring ----------------------------------------------------------------
function MacroRing({ value, target, color, label, unit = 'g' }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t) }, [])
  const pct = Math.min(value / target, 1)
  const isOver = value > target
  const ringColor = isOver ? '#ef4444' : color
  const r = 32, circ = 2 * Math.PI * r
  const stroke = mounted ? circ * (1 - pct) : circ

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" viewBox="0 0 80 80" className="ring-glow">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(124,107,196,0.08)" strokeWidth="7"/>
          <circle cx="40" cy="40" r={r} fill="none" stroke={ringColor} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={stroke}
            strokeLinecap="round" transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${ringColor}50)` }}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-base font-black num-display leading-none ${isOver ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>{Math.round(value)}</span>
          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-0.5">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</span>
    </div>
  )
}

// --- Sugar Bar -----------------------------------------------------------------
function SugarBar({ natural, added }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 200); return () => clearTimeout(t) }, [])
  const total = natural + added || 1
  const natPct = mounted ? (natural / total) * 100 : 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <Leaf size={11} />
          Natural <span className="font-black">{Math.round(natural)}g</span>
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600">
          <Zap size={11} />
          Added <span className="font-black">{Math.round(added)}g</span>
        </span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden flex bg-[var(--border)]/60">
        <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-l-full" style={{ width: `${natPct}%`, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}/>
        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500" style={{ width: `${100 - natPct}%`, transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}/>
      </div>
    </div>
  )
}

// --- Toast -----------------------------------------------------------------
function useToast() {
  const [toast, setToast] = useState(null)
  const show = useCallback((msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }, [])
  const Toast = toast ? (
    <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
  ) : null
  return { show, Toast }
}

// --- Activity icon helper -------------------------------------------------
function getActivityIcon(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('run') || n.includes('jog')) return Footprints
  if (n.includes('cycl') || n.includes('bike')) return Bike
  if (n.includes('gym') || n.includes('lift') || n.includes('weight') || n.includes('dumbbell')) return Dumbbell
  if (n.includes('walk')) return PersonStanding
  if (n.includes('yoga') || n.includes('stretch') || n.includes('meditat')) return Timer
  return Activity
}

// --- Custom Chart Tooltip -------------------------------------------------
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#110c24]/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl min-w-[140px]">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8b82b0] mb-2.5 border-b border-white/5 pb-2">
          {label}
        </p>
        <div className="space-y-2">
          {payload.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-bold text-[#f0ecff]/80">{item.name}</span>
              </div>
              <span className="text-[11px] font-black text-white">
                {item.value}{item.unit || ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// --- Home Tab -----------------------------------------------------------------
function HomeTab({ onAddHabit, onAddFood, onAddActivity, viewData, isHistorical, selectedDate }) {
  const { user, habits: storeHabits, foodLogs: storeFoodLogs, activityLogs: storeActivityLogs, dailyScore: storeDailyScore, analytics, removeFoodLog, removeActivityLog, setDashboardData, setAnalyticsData } = useSynapzeStore()
  const [expandedFood, setExpandedFood] = useState(null)
  const [chartTab, setChartTab] = useState('calories')
  const [isEditingTarget, setIsEditingTarget] = useState(false)
  const [targetForm, setTargetForm] = useState({
    calories: user?.targetCalories || 2000,
    protein: user?.targetProtein || 120,
    carbs: user?.targetCarbs || 200,
    fat: user?.targetFat || 60
  })

  const handleUpdateTargets = async () => {
    setLoading(true)
    const res = await updateProfile({
      targetCalories: Number(targetForm.calories),
      targetProtein: Number(targetForm.protein),
      targetCarbs: Number(targetForm.carbs),
      targetFat: Number(targetForm.fat)
    })
    if (res.success) {
      setDashboardData({ ...viewData, user: res.data })
      setIsEditingTarget(false)
    } else {
      alert("Failed to update targets: " + res.error)
    }
    setLoading(false)
  }

  // Use historical view data if available, else live store data
  const foodLogs = viewData?.foodLogs ?? storeFoodLogs
  const activityLogs = viewData?.activityLogs ?? storeActivityLogs
  const dailyScore = viewData?.dailyScore ?? storeDailyScore
  const habits = viewData?.habits ?? storeHabits

  const age = user?.age || 25
  const gender = user?.gender || 'male'
  const weight = user?.weight || 70
  const height = user?.height || 170
  
  let bmr = (10 * weight) + (6.25 * height) - (5 * age)
  if (gender === 'male') bmr += 5
  else bmr -= 161

  const todayStr = new Date(selectedDate).toDateString()
  const totalCalIn  = foodLogs.reduce((s, f) => s + (f.calories || 0), 0)
  const totalCalOut = Math.round(bmr + activityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0))
  const net = totalCalIn - totalCalOut

  const totalProtein = foodLogs.reduce((s, f) => s + (f.protein || 0), 0)
  const totalCarbs   = foodLogs.reduce((s, f) => s + (f.carbs || 0), 0)
  const totalFat     = foodLogs.reduce((s, f) => s + (f.fat || 0), 0)
  const totalNatSugar= foodLogs.reduce((s, f) => s + (f.naturalSugar || 0), 0)
  const totalAddedSugar= foodLogs.reduce((s, f) => s + (f.addedSugar || 0), 0)

  const targetCals    = user?.targetCalories || 2000
  const targetProtein = user?.targetProtein  || 120
  const targetCarbs   = user?.targetCarbs    || 200
  const targetFat     = user?.targetFat      || 55
  const targetAddedSugar = 25


  const deltaCals = totalCalIn - targetCals
  const deltaProtein = totalProtein - targetProtein
  const deltaCarbs = totalCarbs - targetCarbs
  const deltaFat = totalFat - targetFat
  const deltaAddedSugar = totalAddedSugar - targetAddedSugar

  const getMacroStatus = (delta, target) => {
    const p = delta / target;
    if (Math.abs(p) <= 0.1) return { color: 'text-green-400', icon: '' }; 
    if (Math.abs(p) <= 0.2) return { color: 'text-orange-400', icon: '⚠️' };
    return { color: 'text-red-400', icon: '❌' };
  }

  const calStatus = getMacroStatus(deltaCals, targetCals);
  const proStatus = getMacroStatus(deltaProtein, targetProtein);
  const carbStatus = getMacroStatus(deltaCarbs, targetCarbs);
  const fatStatus = getMacroStatus(deltaFat, targetFat);

  const sortedHabits = [...habits].sort((a, b) => {
    const aDone = (a.logs || []).some(l => new Date(l.completedDate).toDateString() === todayStr)
    const bDone = (b.logs || []).some(l => new Date(l.completedDate).toDateString() === todayStr)
    return (aDone === bDone) ? 0 : aDone ? 1 : -1
  })

  const liveAnalytics = analytics.length === 7 ? [...analytics] : []
  if (liveAnalytics.length === 7) {
    const completedCount = habits.filter(h => (h.logs || []).some(l => new Date(l.completedDate).toDateString() === todayStr)).length
    liveAnalytics[6] = {
      ...liveAnalytics[6],
      calories: totalCalIn,
      burned: totalCalOut,
      net: net,
      naturalSugar: foodLogs.reduce((s, f) => s + (f.naturalSugar || 0), 0),
      addedSugar: foodLogs.reduce((s, f) => s + (f.addedSugar || 0), 0),
      habitCompletion: habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0
    }
  }

  const handleDeleteFood = async (id) => {
    removeFoodLog(id)
    const res = await deleteFoodLog(id, selectedDate)
    if (res.success) {
      const [dash, analytics] = await Promise.all([getDashboardData(), getAnalyticsData()])
      if (dash.success) setDashboardData(dash.data)
      if (analytics.success) setAnalyticsData(analytics.data)
    }
  }

  const handleDeleteActivity = async (id) => {
    removeActivityLog(id)
    const res = await deleteActivityLog(id, selectedDate)
    if (res.success) {
      const [dash, analytics] = await Promise.all([getDashboardData(), getAnalyticsData()])
      if (dash.success) setDashboardData(dash.data)
      if (analytics.success) setAnalyticsData(analytics.data)
    }
  }

  const scoreLevel = (dailyScore?.score || 0) > 80 ? 'Elite' : (dailyScore?.score || 0) > 50 ? 'On Track' : 'Building'
  const scoreColor = (dailyScore?.score || 0) > 80 ? '#22c55e' : (dailyScore?.score || 0) > 50 ? '#7c6bc4' : '#f59e0b'

  return (
    <div className="space-y-6">

      {/* --- Row 1: Score + Energy/Macros Stack --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Neural Score */}
        <Card delay={0.05} className="flex flex-col h-full lg:col-span-3">
          <div className="flex flex-col gap-3 flex-1">
            <div className="rounded-xl overflow-hidden flex-1 flex flex-col relative min-h-[260px]" style={{ background: 'rgba(0,243,255,0.02)', border: '1px solid rgba(0,243,255,0.08)' }}>
              <NeuralBloom 
                score={dailyScore?.score || 0} 
                bodyPct={dailyScore?.bodyPct}
                mindPct={dailyScore?.mindPct}
                energyPct={dailyScore?.energyPct}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Neural Score</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: `${scoreColor}18`, border: `1px solid ${scoreColor}35` }}>
                <Zap size={11} style={{ color: scoreColor }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: scoreColor }}>{scoreLevel}</span>
              </div>
            </div>
            {dailyScore?.insight ? (
              <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">{dailyScore.insight.split('.')[0]}.</p>
                <div className="space-y-1 mt-1">
                  <div className="flex items-start gap-2"><span className="text-emerald-500 text-sm shrink-0">✓</span><span className="text-sm text-[var(--text-secondary)]">Keep up your momentum — consistency compounds!</span></div>
                  <div className="flex items-start gap-2"><span className="text-amber-500 text-sm shrink-0">💡</span><span className="text-sm text-[var(--text-secondary)]">{dailyScore.insight.split('.')[1]?.trim() || 'Log your next meal to stay on track.'}</span></div>
                  <div className="flex items-start gap-2"><span className="text-[#7c6bc4] text-sm shrink-0">ℹ</span><span className="text-sm text-[var(--text-secondary)]">{(targetCals - totalCalIn + activityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0)).toLocaleString()} kcal remaining today</span></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center pb-1">Log your day in the Health tab to generate your score.</p>
            )}
          </div>
        </Card>

        {/* Right Column Stack: Energy + Macros */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Net Energy */}
          <Card delay={0.1}>
            <CardHeader icon={Zap} title="Net Energy Balance" />
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Apple, label: 'In', value: totalCalIn, color: 'emerald' },
                { icon: Flame, label: 'Out', value: totalCalOut, color: 'orange' },
                { icon: TrendingUp, label: 'Net', value: net, color: 'purple' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="p-3 rounded-xl bg-[var(--accent-soft)]/50 border border-[var(--border)]">
                  <Icon size={16} className={`text-${color}-400 mx-auto mb-1`} />
                  <p className="text-xl font-black text-[var(--text-primary)] leading-none"><Counter target={Math.abs(value)} /></p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Daily Macros */}
          <Card delay={0.15}>
            <CardHeader icon={BarChart3} title="Daily Macros" />
            <div className="flex justify-around items-center mb-4">
              <MacroRing value={totalCalIn} target={targetCals} color="#e9a8fc" label="Calories" unit="kcal" />
              <MacroRing value={totalProtein} target={targetProtein} color="#7c6bc4" label="Protein" />
              <MacroRing value={totalCarbs} target={targetCarbs} color="#a78bfa" label="Carbs" />
              <MacroRing value={totalFat} target={targetFat} color="#f59e0b" label="Fat" />
            </div>
            <SugarBar natural={totalNatSugar} added={totalAddedSugar} />
          </Card>
        </div>
      </div>{/* end row1 */}




      {/* --- Row 2: 60/40 Split --- */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT 60% — Habits + Food Log */}
        <div className="lg:col-span-3 space-y-6">

        {/* Habits */}
        <Card delay={0.15}>
        <CardHeader icon={Flame} title="Today&apos;s Tasks"
          action={
            <button onClick={onAddHabit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7c6bc4]/10 text-[#7c6bc4] text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-[#7c6bc4]/20 transition-colors">
              <Plus size={14} /> Add
            </button>
          }
        />
        <div className="space-y-2.5">
          {sortedHabits.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Flame size={20} className="text-[#7c6bc4]" /></div>
              <p className="text-sm font-bold text-[var(--text-secondary)]">No habits yet</p>
              <p className="text-xs text-[var(--text-muted)] mb-2">Build your streak by adding your first habit.</p>
              <button onClick={onAddHabit} className="px-4 py-2 rounded-xl bg-[#7c6bc4]/10 text-[#7c6bc4] text-xs font-bold cursor-pointer hover:bg-[#7c6bc4]/20 transition-colors">
                + Add First Habit
              </button>
            </div>
          ) : sortedHabits.map((h, i) => {
              const done = (h.logs || []).some(l => new Date(l.completedDate).toDateString() === todayStr)
              return <HabitCard key={h.id} id={h.id} name={h.name} streak={h.currentStreak || 0} color="#7c6bc4" done={done} delay={0.05 * i} selectedDate={selectedDate} />
            })
          }
        </div>
      </Card>
        </div>{/* end left */}

        {/* RIGHT 40% — Activity + Macro Summary */}
        <div className="lg:col-span-2 space-y-6">

        {/* Activity Log */}
        <Card delay={0.25}>
        <CardHeader icon={Activity} title="Activity Log"
          action={!isHistorical && (
            <button onClick={onAddActivity} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7c6bc4]/10 text-[#7c6bc4] text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-[#7c6bc4]/20 transition-colors">
              <Plus size={14} /> Add
            </button>
          )}
        />
        <div className="space-y-2">
          {activityLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Activity size={20} className="text-[#7c6bc4]" /></div>
              <p className="text-sm font-bold text-[var(--text-secondary)]">No activities yet</p>
              <p className="text-xs text-[var(--text-muted)]">Log a run, gym session, or walk.</p>
            </div>
          ) : activityLogs.map((a) => {
            const AIcon = getActivityIcon(a.name)
            return (
              <div key={a.id} className="glass-card p-3 flex items-center justify-between group !bg-[var(--surface-hover)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#7c6bc4]/10">
                    <AIcon size={16} className="text-[#7c6bc4]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{a.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{a.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#7c6bc4]">{a.caloriesBurned} <span className="text-[9px] text-[var(--text-muted)]">kcal</span></span>
                  <button onClick={() => handleDeleteActivity(a.id)} className="p-1 border-none bg-transparent cursor-pointer text-[var(--text-faint)] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Nutrition Log (List view) */}
      <Card delay={0.2}>
        <CardHeader icon={Utensils} title="Nutrition Log"
          action={!isHistorical && (
            <button onClick={onAddFood} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7c6bc4]/10 text-[#7c6bc4] text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-[#7c6bc4]/20 transition-colors">
              <Plus size={14} /> Add
            </button>
          )}
        />
        <div className="space-y-2">
          {foodLogs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><Utensils size={20} className="text-[#7c6bc4]" /></div>
              <p className="text-sm font-bold text-[var(--text-secondary)]">Nothing logged yet</p>
              <p className="text-xs text-[var(--text-muted)]">Snap a photo or describe your meal.</p>
            </div>
          ) : (
            foodLogs.map((f) => {
              const density = f.calories < 300 ? 'food-low' : f.calories < 600 ? 'food-mid' : 'food-high'
              return (
                <div key={f.id} className={`glass-card p-3 border border-white/50 bg-[var(--surface)] ${density}`}>
                  <div onClick={() => setExpandedFood(expandedFood === f.id ? null : f.id)} className="flex items-start justify-between cursor-pointer select-none">
                    <div className="pr-4">
                      <p className="text-sm font-medium text-[var(--text-primary)] leading-snug">{f.description}</p>
                      <p className="text-[11px] font-bold text-[#7c6bc4] mt-1">{f.calories} kcal</p>
                    </div>
                    <div className="text-[var(--text-muted)] mt-0.5">
                      {expandedFood === f.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {expandedFood === f.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="pt-3 mt-3 border-t border-[var(--border)] space-y-2">
                          <NutrientBar label="Protein" value={Math.round(f.protein || 0)} max={targetProtein} color="#7c6bc4" />
                          <NutrientBar label="Carbs" value={Math.round(f.carbs || 0)} max={targetCarbs} color="#a78bfa" />
                          <NutrientBar label="Fat" value={Math.round(f.fat || 0)} max={targetFat} color="#f59e0b" />
                          <div className="flex justify-between items-center pt-2 mt-2 border-t border-[var(--border)]">
                            <span className="text-[10px] text-[var(--text-muted)]">Nat Sugar: {Math.round(f.naturalSugar||0)}g | Added: {Math.round(f.addedSugar||0)}g</span>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteFood(f.id); }} className="text-xs text-red-400 hover:text-red-300 border-none bg-transparent cursor-pointer">Delete</button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </div>
      </Card>

        </div>{/* end right */}
      </div>

      {/* --- Row 3: Nutrition Summary Table (Full Width) --- */}
      <Card delay={0.25}>
        <CardHeader icon={Target} title="Daily Nutrition Summary" />
        <div className="w-full overflow-x-auto">
          {foodLogs.length === 0 ? (
            <p className="text-[var(--text-muted)] text-xs text-center py-6">No food logged yet.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse whitespace-normal">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] uppercase text-[10px] font-bold tracking-widest">
                  <th className="p-4 pl-6 w-12">#</th>
                  <th className="p-4 min-w-[200px]">Food</th>
                  <th className="p-4 text-right">Calories</th>
                  <th className="p-4 text-right">Protein</th>
                  <th className="p-4 text-right">Carbs</th>
                  <th className="p-4 text-right">Fat</th>
                  <th className="p-4 leading-tight text-right">Nat Sugar</th>
                  <th className="p-4 leading-tight text-right">Add Sugar</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {foodLogs.map((f, i) => (
                  <tr key={f.id} className="border-b border-[var(--border)] group hover:bg-[#7c6bc4]/[0.03] transition-colors">
                    <td className="p-4 pl-6 text-[var(--text-muted)] font-mono">{i + 1}</td>
                    <td className="p-4 text-[var(--text-primary)] font-semibold max-w-xs">{f.description}</td>
                    <td className="p-4 text-[var(--text-primary)] font-mono text-base text-right">{f.calories}</td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono text-base text-right">{Math.round(f.protein || 0)}g</td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono text-base text-right">{Math.round(f.carbs || 0)}g</td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono text-base text-right">{Math.round(f.fat || 0)}g</td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono text-base text-right">{Math.round(f.naturalSugar || 0)}g</td>
                    <td className="p-4 text-[var(--text-secondary)] font-mono text-base text-right">{Math.round(f.addedSugar || 0)}g</td>
                    <td className="p-4 text-right pr-6">
                      <button onClick={() => handleDeleteFood(f.id)} className="p-2 rounded-lg cursor-pointer text-[var(--text-faint)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 border-none">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                <tr className="border-b border-[var(--border)] bg-[#7c6bc4]/[0.04]">
                  <td colSpan={2} className="p-4 pl-6 font-black text-[var(--text-primary)] uppercase text-xs tracking-wider">Day total</td>
                  <td className="p-4 font-black text-[var(--text-primary)] font-mono text-base text-right">{totalCalIn}</td>
                  <td className="p-4 font-black text-[var(--text-primary)] font-mono text-base text-right">{Math.round(totalProtein)}g</td>
                  <td className="p-4 font-black text-[var(--text-primary)] font-mono text-base text-right">{Math.round(totalCarbs)}g</td>
                  <td className="p-4 font-black text-[var(--text-primary)] font-mono text-base text-right">{Math.round(totalFat)}g</td>
                  <td className="p-4 font-black text-[var(--text-primary)] font-mono text-base text-right">{Math.round(totalNatSugar)}g</td>
                  <td className="p-4 font-black text-[var(--text-primary)] font-mono text-base text-right">{Math.round(totalAddedSugar)}g</td>
                  <td></td>
                </tr>

                <tr className="border-b border-[var(--border)] bg-[var(--surface-hover)]/30">
                  <td colSpan={2} className="p-4 pl-6 flex items-center gap-2 font-bold text-[var(--text-primary)] uppercase text-[10px] tracking-widest">
                    Target
                     <button onClick={() => { 
                        if (isEditingTarget) {
                          handleUpdateTargets();
                        } else {
                          setTargetForm({ calories: targetCals, protein: targetProtein, carbs: targetCarbs, fat: targetFat }); 
                          setIsEditingTarget(true); 
                        }
                      }} 
                      className="p-1.5 hover:bg-[#7c6bc4]/10 rounded-lg transition-all border-none bg-transparent cursor-pointer text-[#7c6bc4] flex items-center justify-center">
                      {isEditingTarget ? <CheckCircle2 size={14} className="animate-in zoom-in duration-300" /> : <Target size={14} />}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    {isEditingTarget ? (
                      <input type="number" className="w-16 bg-[#161229] border border-[#7c6bc4]/30 rounded p-1 text-xs font-mono text-center text-[#f0ecff]" 
                        value={targetForm.calories} onChange={e => setTargetForm({...targetForm, calories: e.target.value})} />
                    ) : (
                      <span className="text-[var(--text-primary)] opacity-70 font-mono text-sm">{targetCals}</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {isEditingTarget ? (
                      <input type="number" className="w-12 bg-[#161229] border border-[#7c6bc4]/30 rounded p-1 text-xs font-mono text-center text-[#f0ecff]" 
                        value={targetForm.protein} onChange={e => setTargetForm({...targetForm, protein: e.target.value})} />
                    ) : (
                      <span className="text-[var(--text-primary)] opacity-70 font-mono text-sm">{targetProtein}g</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {isEditingTarget ? (
                      <input type="number" className="w-12 bg-[#161229] border border-[#7c6bc4]/30 rounded p-1 text-xs font-mono text-center text-[#f0ecff]" 
                        value={targetForm.carbs} onChange={e => setTargetForm({...targetForm, carbs: e.target.value})} />
                    ) : (
                      <span className="text-[var(--text-primary)] opacity-70 font-mono text-sm">{targetCarbs}g</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {isEditingTarget ? (
                      <input type="number" className="w-12 bg-[#161229] border border-[#7c6bc4]/30 rounded p-1 text-xs font-mono text-center text-[#f0ecff]" 
                        value={targetForm.fat} onChange={e => setTargetForm({...targetForm, fat: e.target.value})} />
                    ) : (
                      <span className="text-[var(--text-primary)] opacity-70 font-mono text-sm">{targetFat}g</span>
                    )}
                  </td>
                  <td className="p-4 text-[var(--text-faint)] font-mono text-sm text-right">—</td>
                  <td className="p-4 text-[var(--text-primary)] opacity-70 font-mono text-sm text-right">&lt;25g</td>
                  <td></td>
                </tr>

                <tr className="bg-[#7c6bc4]/[0.12] backdrop-blur-md">
                  <td colSpan={2} className="p-4 pl-6 font-black text-[var(--text-primary)] pt-6 pb-8 uppercase text-xs tracking-widest">Status</td>
                  {[
                    { val: totalCalIn, tar: targetCals, reverse: false, suffix: '' },
                    { val: totalProtein, tar: targetProtein, reverse: true, suffix: 'g' },
                    { val: totalCarbs, tar: targetCarbs, reverse: false, suffix: 'g' },
                    { val: totalFat, tar: targetFat, reverse: false, suffix: 'g' },
                    { val: null },
                    { val: totalAddedSugar, tar: 25, reverse: false, suffix: 'g' }
                  ].map((s, idx) => {
                    if (s.val === null) return <td key={idx} className="p-4 text-[var(--text-faint)] text-right">—</td>
                    const delta = s.val - s.tar
                    const isGood = s.reverse ? delta >= 0 : delta <= 0
                    const Icon = isGood ? Heart : Flame
                    return (
                      <td key={idx} className="p-4 pt-6 pb-8 font-mono text-right">
                        <div className={`flex flex-col items-end gap-1 ${isGood ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                          <span className="text-xs font-black">
                            {delta > 0 ? '+' : ''}{Math.round(delta)}{s.suffix}
                          </span>
                          <div className={`p-1 rounded-md ${isGood ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                            <Icon size={14} fill="currentColor" className="opacity-80" />
                          </div>
                        </div>
                      </td>
                    )
                  })}
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </Card>
      {/* --- Row 3: Trend Chart --- */}
      <Card delay={0.35}>
        <CardHeader icon={TrendingUp} title="Trend Analysis" />
        <div className="flex gap-2 mb-4">
          {[
            { id: 'calories', label: '🔥 Calories' },
            { id: 'sugar',    label: '🍬 Sugar' },
            { id: 'habits',   label: '✦ Habits' },
          ].map(t => (
            <button key={t.id} onClick={() => setChartTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider border-none cursor-pointer transition-all ${
                chartTab === t.id
                  ? 'bg-[#7c6bc4] text-white shadow-md'
                  : 'bg-[#f0eaf8]/60 text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[#f0eaf8]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        {liveAnalytics.length === 0
          ? <div className="h-44 flex items-center justify-center text-[var(--text-faint)] text-xs">No weekly data yet</div>
          : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'calories' ? (
                  <BarChart data={liveAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,107,196,0.08)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b82b0' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8b82b0' }} axisLine={false} tickLine={false} unit=" kcal" width={55} />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar dataKey="calories" name="Intake" fill="#e9a8fc" radius={[6,6,0,0]} />
                    <Bar dataKey="burned"   name="Burned" fill="#a78bfa" radius={[6,6,0,0]} opacity={0.8} />
                  </BarChart>
                ) : chartTab === 'sugar' ? (
                  <BarChart data={liveAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,107,196,0.08)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b82b0' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8b82b0' }} axisLine={false} tickLine={false} unit=" g" />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar dataKey="naturalSugar" name="Natural" fill="#22c55e" radius={[4,4,0,0]} />
                    <Bar dataKey="addedSugar"   name="Added"   fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                ) : (
                  <LineChart data={liveAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,107,196,0.08)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8b82b0' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#8b82b0' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124,107,196,0.2)', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="habitCompletion" name="Completion %" stroke="#a78bfa" strokeWidth={2.5} dot={{ fill: '#a78bfa', r: 3 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )
        }
      </Card>

    </div>
  )
}

// --- Water Tracker --------------------------------------------------------------
function WaterTracker() {
  const [totalMl, setTotalMl] = useState(0)
  const [loading, setLoading] = useState(false)
  const WATER_GOAL = 2500

  useEffect(() => {
    getTodayWater().then(res => { if (res.success) setTotalMl(res.data.totalMl) })
  }, [])

  const addWater = async (ml) => {
    setLoading(true)
    setTotalMl(prev => prev + ml) // optimistic
    const res = await logWater(ml)
    if (!res.success) setTotalMl(prev => prev - ml) // rollback
    setLoading(false)
  }

  const pct = Math.min(100, Math.round((totalMl / WATER_GOAL) * 100))
  const glasses = Math.round(totalMl / 250)

  return (
    <Card delay={0.1} className="!p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Hydration</p>
        <Droplets size={14} className="text-blue-400" />
      </div>
      <p className="text-3xl font-black text-blue-400">{glasses}<span className="text-base text-[var(--text-muted)]"> glasses</span></p>
      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{totalMl}ml of {WATER_GOAL}ml goal</p>
      <div className="mt-2 h-1.5 rounded-full bg-[var(--border)]/60 overflow-hidden">
        <motion.div className="h-full rounded-full bg-blue-400" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => addWater(250)} disabled={loading} className="flex-1 py-1.5 rounded-lg bg-blue-400/10 text-blue-400 text-[10px] font-bold hover:bg-blue-400/20 transition-colors disabled:opacity-50">+250ml</button>
        <button onClick={() => addWater(500)} disabled={loading} className="flex-1 py-1.5 rounded-lg bg-blue-400/10 text-blue-400 text-[10px] font-bold hover:bg-blue-400/20 transition-colors disabled:opacity-50">+500ml</button>
      </div>
    </Card>
  )
}

// --- Health Tab -----------------------------------------------------------------
function HealthTab({ viewData, isHistorical }) {
  const { user: storeUser, dailyScore: storeDailyScore, setDailyScore, foodLogs: storeFoodLogs, activityLogs: storeActivityLogs, habits: storeHabits, setDashboardData, setAnalyticsData } = useSynapzeStore()
  const { show: showToast, Toast } = useToast()

  const foodLogs = viewData?.foodLogs ?? storeFoodLogs
  const activityLogs = viewData?.activityLogs ?? storeActivityLogs
  const dailyScore = viewData?.dailyScore ?? storeDailyScore
  const habits = viewData?.habits ?? storeHabits
  const [dayText, setDayText] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastExtracted, setLastExtracted] = useState(null) // { foods, activities, completedHabitNames }

  const age = storeUser?.age || 25
  const gender = storeUser?.gender || 'male'
  const weight = storeUser?.weight || 70
  const height = storeUser?.height || 170
  let bmr = (10 * weight) + (6.25 * height) - (5 * age)
  if (gender === 'male') bmr += 5; else bmr -= 161

  const totalCalIn  = foodLogs.reduce((s, f) => s + (f.calories || 0), 0)
  const DAILY_CAL_GOAL = storeUser?.targetCalories || 2000
  const activeBurned = activityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0)
  const totalCalOut = Math.round(bmr + activeBurned)
  const calRemaining = Math.max(0, DAILY_CAL_GOAL - totalCalIn + activeBurned)
  
  const todayStr = new Date().toDateString()
  const completedHabits = habits.filter(h => (h.logs || []).some(l => new Date(l.completedDate).toDateString() === todayStr))
  const pendingHabits   = habits.filter(h => !(h.logs || []).some(l => new Date(l.completedDate).toDateString() === todayStr))

  const handleGenerate = async () => {
    if (!dayText.trim()) return
    setIsGenerating(true)
    
    const newHistory = [...chatHistory, { role: 'user', content: dayText }]
    setChatHistory(newHistory)
    setDayText('')

    const clarifyRes = await clarifyDayQuery(newHistory);

    if (clarifyRes.success && clarifyRes.data.status === 'clarification_needed') {
      setChatHistory([...newHistory, { role: 'ai', content: clarifyRes.data.question }])
      setIsGenerating(false)
      return
    }

    const fullDescription = newHistory.map(m => m.content).join('. ')
    const res = await generateDailyScore(fullDescription)
    if (res.success) {
      setDailyScore(res.data)
      if (res.extracted) setLastExtracted(res.extracted)
      const [dash, analytics] = await Promise.all([getDashboardData(), getAnalyticsData()])
      if (dash.success) setDashboardData(dash.data)
      if (analytics.success) setAnalyticsData(analytics.data)
      setChatHistory([])
      showToast('Day analysed and logged!', 'success')
    } else {
      showToast('Analysis failed: ' + res.error, 'error')
    }
    setIsGenerating(false)
  }

  return (
    <div className="space-y-4">

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card delay={0} className="!p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Calories Remaining</p>
          <p className="text-3xl font-black mt-1" style={{ color: calRemaining < 300 ? '#ef4444' : '#22c55e' }}>
            {calRemaining.toLocaleString()}
          </p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">of {DAILY_CAL_GOAL} kcal goal</p>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--border)]/60 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (totalCalIn / DAILY_CAL_GOAL) * 100)}%`, background: totalCalIn > DAILY_CAL_GOAL ? '#ef4444' : '#22c55e' }} />
          </div>
          <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-1">
            <span>{totalCalIn} in</span><span>{totalCalOut} burned</span>
          </div>
        </Card>
        <Card delay={0.05} className="!p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Habits Progress</p>
          <p className="text-3xl font-black text-[var(--text-primary)] mt-1">{completedHabits.length}<span className="text-base text-[var(--text-muted)]">/{habits.length}</span></p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">completed today</p>
          {pendingHabits.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {pendingHabits.slice(0, 2).map(h => (
                <p key={h.id} className="text-[10px] text-amber-500 font-bold">⏳ {h.name}</p>
              ))}
              {pendingHabits.length > 2 && <p className="text-[10px] text-[var(--text-faint)]">+{pendingHabits.length - 2} more</p>}
            </div>
          )}
        </Card>
        <WaterTracker />
      </div>

      {/* AI Action Plan */}
      {dailyScore && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-l-4 border-[#7c6bc4]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={16} className="text-[#7c6bc4]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#7c6bc4]">Your Action Plan</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed">{dailyScore.insight}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-black gradient-text">{dailyScore.score}</p>
              <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">score</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* What AI Extracted — shown after generation */}
      {lastExtracted && (lastExtracted.foods.length > 0 || lastExtracted.activities.length > 0 || lastExtracted.completedHabitNames.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">What AI Logged From Your Input</p>

          {lastExtracted.foods.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#e9a8fc] uppercase tracking-wider mb-2 flex items-center gap-1"><Utensils size={11} /> Foods</p>
              <div className="space-y-1.5">
                {lastExtracted.foods.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#e9a8fc]/10 border border-[#e9a8fc]/20 rounded-xl">
                    <span className="text-xs text-[var(--text-primary)]">{f.description}</span>
                    <div className="text-right ml-3 shrink-0">
                      <span className="text-xs font-black text-[#e9a8fc]">{f.calories} kcal</span>
                      <span className="text-[9px] text-[var(--text-muted)] ml-2">{f.protein}p · {f.carbs}c · {f.fat}f</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastExtracted.activities.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#a78bfa] uppercase tracking-wider mb-2 flex items-center gap-1"><Activity size={11} /> Activities</p>
              <div className="space-y-1.5">
                {lastExtracted.activities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#a78bfa]/10 border border-[#a78bfa]/15 rounded-xl">
                    <span className="text-xs text-[var(--text-primary)]">{a.name}</span>
                    <div className="text-right ml-3 shrink-0">
                      <span className="text-xs font-black text-[#a78bfa]">{a.caloriesBurned} kcal</span>
                      <span className="text-[9px] text-[var(--text-muted)] ml-2">{a.duration}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastExtracted.completedHabitNames.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-[#7c6bc4] uppercase tracking-wider mb-2 flex items-center gap-1"><Target size={11} /> Habits Marked Done</p>
              <div className="flex flex-wrap gap-2">
                {lastExtracted.completedHabitNames.map((n, i) => (
                  <span key={i} className="px-2.5 py-1 text-[11px] font-bold bg-[#7c6bc4]/10 border border-[#7c6bc4]/20 text-[#7c6bc4] rounded-lg">✓ {n}</span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* AI Review Input */}
      <Card delay={0.1}>
        <CardHeader icon={Sparkles} title="Tell the AI About Your Day" />
        {isHistorical ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
            <span className="text-3xl">📅</span>
            <p className="text-sm font-bold text-[var(--text-muted)]">Viewing historical data</p>
            <p className="text-xs text-[var(--text-faint)]">Switch back to <b className="text-[var(--text-secondary)]">Today</b> from the date picker above to log new entries.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-[var(--text-muted)]">Describe what you ate, did, and which habits you completed. The AI will extract and log everything automatically.</p>
            <div className="bg-[#facc15]/10 border border-[#facc15]/20 p-3 rounded-xl flex items-start gap-2.5">
              <span className="text-[#facc15] text-xs mt-0.5">⚠️</span>
              <p className="text-[11px] text-[#facc15] leading-relaxed font-bold">
                If you already checked off your <b>Health</b> or <b>Fitness</b> habits in the Dashboard, they are logged automatically! Do not rewrite them here to avoid double-logging.
              </p>
            </div>
            
            {chatHistory.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-2xl text-sm font-bold ${msg.role === 'user' ? 'bg-[#7c6bc4]/20 text-[#a78bfa] border border-[#7c6bc4]/30 ml-auto w-[85%] rounded-br-sm' : 'bg-[#2d264d] text-[#f0ecff] border border-white/5 mr-auto w-[85%] rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
            )}

            <textarea value={dayText} onChange={e => setDayText(e.target.value)} disabled={isGenerating}
              placeholder={chatHistory.length === 0 ? "e.g. Had oatmeal for breakfast, ran 5km, drank 2L water, did my meditation…" : "Type your answer..."}
              className="w-full bg-[#161229] border border-[rgba(255,255,255,0.1)] rounded-xl p-3 text-sm text-[#f0ecff] outline-none focus:border-[#7c6bc4] focus:ring-1 focus:ring-[#7c6bc4]/50 transition-all resize-none h-24 placeholder:text-[#4b4577]" />
            <button onClick={handleGenerate} disabled={isGenerating || !dayText.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[#7c6bc4] to-[#a78bfa] text-white font-black text-sm tracking-wide disabled:opacity-40 transition-all cursor-pointer active:scale-[0.98]"
              style={{ boxShadow: '0 4px 20px rgba(124,107,196,0.4)' }}>
              {isGenerating
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing your day…</>
                : <><Sparkles size={18} className="text-[#e0d7ff]" /> {chatHistory.length > 0 ? 'Reply & Analyze' : 'Analyze & Log Everything'}</>
              }
            </button>
          </div>
        )}
      </Card>

      {/* All Food Logs for today */}
      <Card delay={0.15}>
        <CardHeader icon={Utensils} title={`Food Log (${foodLogs.length} items)`} />
        {foodLogs.length === 0
          ? <p className="text-[var(--text-faint)] text-xs text-center py-4">No food logged yet. Describe your meals above.</p>
          : (
            <div className="space-y-2">
              {foodLogs.map(f => (
                <div key={f.id} className="flex items-start justify-between p-3 bg-[var(--surface)] border border-white/50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{f.description}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                      <span className="text-[10px] font-bold text-[#e9a8fc]">{f.calories} kcal</span>
                      <span className="text-[10px] text-[var(--text-muted)]">P:{f.protein}g</span>
                      <span className="text-[10px] text-[var(--text-muted)]">C:{f.carbs}g</span>
                      <span className="text-[10px] text-[var(--text-muted)]">F:{f.fat}g</span>
                      {f.addedSugar > 0 && <span className="text-[10px] text-red-500">Sugar+:{f.addedSugar}g</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-[var(--text-faint)] font-mono ml-2 shrink-0">
                    {new Date(f.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 bg-[#e9a8fc]/10 border border-[#e9a8fc]/20 rounded-xl mt-1">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Total Consumed</span>
                <span className="text-sm font-black text-[#e9a8fc]">{totalCalIn.toLocaleString()} kcal</span>
              </div>
            </div>
          )
        }
      </Card>

      {/* Activity Logs for today */}
      <Card delay={0.2}>
        <CardHeader icon={Activity} title={`Activity Log (${activityLogs.length} items)`} />
        {activityLogs.length === 0
          ? <p className="text-[var(--text-faint)] text-xs text-center py-4">No activities logged yet.</p>
          : (
            <div className="space-y-2">
              {activityLogs.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-[var(--surface)] border border-white/50 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{a.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{a.duration} min</p>
                  </div>
                  <span className="text-sm font-black text-[#7c6bc4]">{a.caloriesBurned} <span className="text-[10px] text-[var(--text-muted)]">kcal</span></span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 bg-[#a78bfa]/10 border border-[#a78bfa]/20 rounded-xl mt-1">
                <span className="text-xs font-bold text-[var(--text-secondary)]">Total Burned</span>
                <span className="text-sm font-black text-[#a78bfa]">{totalCalOut.toLocaleString()} kcal</span>
              </div>
            </div>
          )
        }
      </Card>
    </div>
  )

}

function ProfileTab() {
  const { user, setDashboardData } = useSynapzeStore()
  const { dark } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [weightLogs, setWeightLogs] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      let prefs = ''
      try {
        if (user.foodPrefs) prefs = JSON.parse(user.foodPrefs).join(', ')
      } catch(e) { prefs = user.foodPrefs }
      
      setFormData({
        name: user.name || '',
        goal: user.goal || '',
        height: user.height || '',
        weight: user.weight || '',
        dietType: user.dietType || '',
        foodPrefs: prefs,
        age: user.age || '',
        gender: user.gender || 'male',
        targetCalories: user.targetCalories || 2000,
        targetProtein: user.targetProtein || 120,
        targetCarbs: user.targetCarbs || 200,
        targetFat: user.targetFat || 60
      })
    }
    // Fetch weight logs
    getWeightLogs().then(res => {
      if (res.success) {
        // format for recharts
        const data = res.data.map(log => ({
          date: new Date(log.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          weight: log.weight
        }))
        setWeightLogs(data)
      }
    })
  }, [user])

  const handleSave = async () => {
    setLoading(true)
    const payload = {
      ...formData,
      foodPrefs: formData.foodPrefs.split(',').map(s => s.trim()).filter(Boolean)
    }
    const res = await updateProfile(payload)
    if (res.success) {
      const dash = await getDashboardData()
      if(dash.success) setDashboardData(dash.data)
      
      const wRes = await getWeightLogs()
      if (wRes.success) {
        setWeightLogs(wRes.data.map(log => ({
          date: new Date(log.loggedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          weight: log.weight
        })))
      }
      setIsEditing(false)
    }
    setLoading(false)
  }

  if (!user) return <Card><p className="text-[var(--text-muted)] text-sm text-center py-8">Loading profile…</p></Card>

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e9a8fc]/20 flex items-center justify-center">
              <Heart className="w-4 h-4 text-[#e9a8fc]" />
            </div>
            <h3 className={`font-bold ${dark ? 'text-white' : 'text-[var(--text-primary)]'}`}>Your Profile</h3>
          </div>
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            className="text-xs font-bold px-4 py-1.5 rounded-full bg-[#7c6bc4]/10 text-[#7c6bc4] hover:bg-[#7c6bc4]/20 transition-colors"
          >
            {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            {[
              { id: 'name', label: 'Name', type: 'text' },
              { id: 'age', label: 'Age', type: 'number' },
              { id: 'gender', label: 'Gender (male/female)', type: 'text' },
              { id: 'goal', label: 'Goal', type: 'text' },
              { id: 'height', label: 'Height (cm)', type: 'number' },
              { id: 'weight', label: 'Weight (kg)', type: 'number' },
              { id: 'dietType', label: 'Diet Type', type: 'text' },
              { id: 'foodPrefs', label: 'Food Prefs (comma separated)', type: 'text' },
              { id: 'targetCalories', label: 'Target Calories', type: 'number' },
              { id: 'targetProtein', label: 'Target Protein (g)', type: 'number' },
              { id: 'targetCarbs', label: 'Target Carbs (g)', type: 'number' },
              { id: 'targetFat', label: 'Target Fat (g)', type: 'number' },
            ].map(field => (
              <div key={field.id} className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] mb-1">{field.label}</label>
                <input 
                  type={field.type}
                  value={formData[field.id]}
                  onChange={e => setFormData({ ...formData, [field.id]: e.target.value })}
                  className={`border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c6bc4] transition-all ${
                    dark ? 'bg-[#151025] border-[#2d2256] text-white' : 'bg-white/50 border-[var(--border)] text-[var(--text-primary)]'
                  }`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: 'Name',   value: user.name },
              { label: 'Age',    value: user.age || '—' },
              { label: 'Gender', value: user.gender || '—' },
              { label: 'Goal',   value: user.goal },
              { label: 'Height', value: user.height ? `${user.height} cm` : '—' },
              { label: 'Weight', value: user.weight ? `${user.weight} kg` : '—' },
              { label: 'Diet Type', value: user.dietType || '—' },
              { label: 'Food Prefs', value: user.foodPrefs ? (Array.isArray(user.foodPrefs) ? user.foodPrefs.join(', ') : (typeof user.foodPrefs === 'string' && user.foodPrefs.startsWith('[') ? JSON.parse(user.foodPrefs).join(', ') : user.foodPrefs)) : '—' },
              { label: 'Daily Calories', value: `${user.targetCalories || 2000} kcal` },
              { label: 'Daily Protein', value: `${user.targetProtein || 120} g` },
              { label: 'Daily Carbs', value: `${user.targetCarbs || 200} g` },
              { label: 'Daily Fat', value: `${user.targetFat || 60} g` },
            ].map(r => (
              <div key={r.label} className={`flex items-center justify-between py-2 border-b last:border-0 ${dark ? 'border-[#2d2256]' : 'border-[var(--border)]'}`}>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold">{r.label}</span>
                <span className={`text-sm font-semibold text-right max-w-[60%] truncate ${dark ? 'text-white' : 'text-[var(--text-primary)]'}`}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader icon={TrendingUp} title="Weight Tracking" />
        {weightLogs.length > 0 ? (
          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightLogs} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#2d2256' : '#e4daf2'} vertical={false} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b82b0' }} dy={10} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8b82b0' }} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124,107,196,0.2)', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="weight" stroke="#e9a8fc" strokeWidth={3} dot={{ r: 4, fill: '#7c6bc4', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#7c6bc4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[var(--text-muted)] text-xs text-center py-6">No weight history logged yet.</p>
        )}
      </Card>
      
      <div className="flex justify-center mt-8 pb-8">
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-14 h-14" } }} />
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const { setDashboardData, setAnalyticsData, setError, isLoading, user } = useSynapzeStore()
  const [tab, setTab] = useState('home')
  const [actionMenu, setActionMenu] = useState(false)
  const [showHabitModal, setShowHabitModal]     = useState(false)
  const [showFoodModal, setShowFoodModal]       = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [histViewData, setHistViewData] = useState(null)
  const [histLoading, setHistLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSelectedDate(new Date().toISOString())
    setMounted(true)
  }, [])

  const isHistorical = selectedDate ? new Date(selectedDate).toDateString() !== new Date().toDateString() : false

  const handleDateSelect = async (dateStr) => {
    setSelectedDate(dateStr)
    const isToday = new Date(dateStr).toDateString() === new Date().toDateString()
    if (isToday) { setHistViewData(null); return }
    setHistLoading(true)
    const res = await getDataForDate(dateStr)
    if (res.success) setHistViewData(res.data)
    setHistLoading(false)
  }

  useEffect(() => {
    Promise.all([getDashboardData(), getAnalyticsData()]).then(([dash, analytics]) => {
      if (dash.success) {
        if (dash.data.user && !dash.data.user.onboardingDone) {
          router.replace('/onboarding')
          return
        }
        setDashboardData(dash.data)
      } else {
        setError(dash.error)
      }
      if (analytics.success) setAnalyticsData(analytics.data)
    }).catch(e => setError(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
  // For header progress bar — get totals from store
  const { foodLogs: hFoodLogs, activityLogs: hActLogs } = useSynapzeStore()
  const headerCalIn  = hFoodLogs.reduce((s, f) => s + (f.calories || 0), 0)
  const headerCalOut = hActLogs.reduce((s, a)  => s + (a.caloriesBurned || 0), 0)
  const headerPct    = Math.min((headerCalIn / 1900) * 100, 100)

  if (!mounted) return <div className="min-h-screen bg-[var(--bg-primary)]" />

  return (
    <div className="min-h-screen pb-28 lg:pb-8 relative">
      {/* Decorative background */}
      <div className="bg-mesh" />

      <header className="sticky top-0 z-40 glass-nav px-5 lg:pl-[240px] relative" style={{ paddingTop: '0.875rem', paddingBottom: '0.875rem' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.22em]">{today}</p>
            <h1 className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5 tracking-tight">
              Hello, <span className="gradient-text">{isLoading ? '…' : user?.name?.split(' ')[0] || 'there'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Calorie quick-stat */}
            {headerCalIn > 0 && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Today</span>
                <span className="text-sm font-black" style={{
                  color: headerCalIn > 1900 ? '#ef4444' : '#22c55e'
                }}>{headerCalIn.toLocaleString()} <span className="text-[10px] font-semibold text-[var(--text-muted)]">kcal</span></span>
              </div>
            )}
            {user?.createdAt ? (
              <DatePicker
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                joinedAt={user.createdAt}
              />
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--surface)] border border-[var(--border)] opacity-50 animate-pulse">
                <Calendar size={16} />
                <span className="text-xs font-bold">Today</span>
              </div>
            )}
            {/* Avatar & Mobile Profile Toggle */}
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setTab('profile')}
                className={`lg:hidden flex items-center justify-center w-10 h-10 rounded-2xl transition-all active:scale-95 border-none cursor-pointer ${
                  tab === 'profile' 
                    ? 'bg-[#7c6bc4] text-white shadow-lg' 
                    : 'bg-[#7c6bc4]/10 text-[#7c6bc4] border border-[#7c6bc4]/20'
                }`}
              >
                <User size={20} strokeWidth={2.5} />
              </button>
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full animate-pulse opacity-40"
                  style={{ background: 'linear-gradient(135deg,#7c6bc4,#a78bfa)', transform: 'scale(1.18)' }} />
                <UserButton afterSignOutUrl="/landing" />
              </div>
            </div>
          </div>
        </div>
        {/* Calorie progress bar */}
        <div className="progress-header-bar">
          <div className="progress-header-fill" style={{ width: `${headerPct}%` }} />
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-5 lg:pl-[240px]">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#7c6bc4] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : histLoading ? (
          <div className="flex h-64 items-center justify-center flex-col gap-3">
            <div className="w-8 h-8 border-4 border-[#7c6bc4] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--text-muted)] text-xs">Loading historical data…</p>
          </div>
        ) : (
          <>
            {isHistorical && (
              <div className="mb-4 px-1 flex items-center gap-2">
                <div className="flex-1 h-px bg-[#e4daf2]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] px-2">
                  Viewing {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex-1 h-px bg-[#e4daf2]" />
              </div>
            )}
            <AnimatePresence mode="wait">
              {tab === 'home'     && <motion.div key="home"     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HomeTab onAddHabit={() => setShowHabitModal(true)} onAddFood={() => setShowFoodModal(true)} onAddActivity={() => setShowActivityModal(true)} viewData={histViewData} isHistorical={isHistorical} selectedDate={selectedDate} /></motion.div>}
              {tab === 'journal'  && <motion.div key="journal"  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><JournalTab /></motion.div>}
              {tab === 'health'   && <motion.div key="health"   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HealthTab viewData={histViewData} isHistorical={isHistorical} /></motion.div>}
              {tab === 'progress' && <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProgressAnalytics /></motion.div>}
              {tab === 'profile'  && <motion.div key="profile"  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProfileTab /></motion.div>}
            </AnimatePresence>
          </>
        )}
      </main>

      <BottomNav
        active={tab}
        onChange={setTab}
        onAdd={() => setActionMenu(true)}
        onAddFood={() => setShowFoodModal(true)}
        onAddHabit={() => setShowHabitModal(true)}
        onAddActivity={() => setShowActivityModal(true)}
        onAddJournal={() => setTab('journal')}
      />

      <GlobalActionMenu isOpen={actionMenu} onClose={() => setActionMenu(false)}
        onSelect={id => { 
          if (id==='habit') setShowHabitModal(true); 
          else if (id==='food') setShowFoodModal(true); 
          else if (id==='activity') setShowActivityModal(true);
          else if (id==='journal') setTab('journal');
        }} />
      <HabitCreationModal isOpen={showHabitModal} onClose={() => setShowHabitModal(false)} />
      <FoodLogModal 
        isOpen={showFoodModal} 
        onClose={() => setShowFoodModal(false)} 
        selectedDate={selectedDate}
      />
      <ActivityLogModal 
        isOpen={showActivityModal} 
        onClose={() => setShowActivityModal(false)} 
        selectedDate={selectedDate}
      />
    </div>
  )
}



