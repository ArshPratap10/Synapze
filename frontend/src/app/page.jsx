'use client'
import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Flame, Zap, Plus, Utensils, Activity, TrendingUp, Sparkles, Apple, Heart, BarChart3, ChevronDown, ChevronUp, Trash2, Target } from 'lucide-react'
import { ResponsiveContainer, RadialBarChart, RadialBar, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import BottomNav from '@/components/ui/BottomNav'
import HabitCard from '@/components/ui/HabitCard'
import NutrientBar from '@/components/ui/NutrientBar'
import { GlobalActionMenu, HabitCreationModal, FoodLogModal, ActivityLogModal } from '@/components/ui/ActionModals'
import { ProgressAnalytics } from '@/components/ui/ProgressAnalytics'
import { useAuraStore } from '@/lib/store'
import { getDashboardData, getAnalyticsData, generateDailyScore, deleteFoodLog, deleteActivityLog, clarifyDayQuery, getDataForDate } from '@/app/actions'
import dynamic from 'next/dynamic'

const NeuralScoreParticles = dynamic(
  () => import('@/components/ui/NeuralScoreParticles'),
  { ssr: false, loading: () => <div className="w-full h-[180px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /></div> }
)

function Card({ children, className = '', delay = 0, span = '' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={`glass-card p-5 ${span} ${className}`}>
      {children}
    </motion.div>
  )
}

// ── Date Picker ────────────────────────────────────────────────────────────────
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-400/5 transition-all group cursor-pointer"
      >
        <span className="text-xs font-bold text-zinc-300 group-hover:text-cyan-300 transition-colors">{label}</span>
        <ChevronDown size={13} className={`text-zinc-500 group-hover:text-cyan-400 transition-all ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-10 z-50 w-52 max-h-72 overflow-y-auto glass-card !p-2 custom-scrollbar shadow-2xl shadow-black/50"
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
                    active ? 'bg-cyan-400/15 text-cyan-300' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                  }`}
                >
                  <span>{tod ? '✦ Today' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />}
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
        <div className="w-7 h-7 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-cyan-400" />
        </div>
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">{title}</h3>
      </div>
      {action}
    </div>
  )
}

function Counter({ target }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let frame, start
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / 1000, 1)
      setVal(Math.floor(p * target))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return <span className="font-mono">{val.toLocaleString()}</span>
}

// ── Macro Ring ────────────────────────────────────────────────────────────────
function MacroRing({ value, target, color, label, unit = 'g' }) {
  const pct = Math.min(value / target, 1)
  const isOver = value > target
  const ringColor = isOver ? '#ef4444' : color
  const r = 32, circ = 2 * Math.PI * r
  const stroke = circ * (1 - pct)
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
          <circle cx="40" cy="40" r={r} fill="none" stroke={ringColor} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={stroke}
            strokeLinecap="round" transform="rotate(-90 40 40)"
            style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 4px ${ringColor}40)` }}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-base font-black num-display leading-none ${isOver ? 'text-red-400' : 'text-white'}`}>{Math.round(value)}</span>
          <span className="text-[9px] font-bold text-zinc-500 uppercase mt-1">{unit}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

// ── Sugar Bar ─────────────────────────────────────────────────────────────────
function SugarBar({ natural, added }) {
  const total = natural + added || 1
  const natPct = (natural / total) * 100
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-xs font-semibold text-emerald-400">🌿 Natural <span className="font-black">{Math.round(natural)}g</span></span>
        <span className="text-xs font-semibold text-amber-400">⚡ Added <span className="font-black">{Math.round(added)}g</span></span>
      </div>
      <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-white/8">
        <div className="h-full rounded-l-full bg-emerald-500" style={{ width: `${natPct}%`, transition: 'width 1s ease' }}/>
        <div className="h-full rounded-r-full bg-amber-400" style={{ width: `${100 - natPct}%`, transition: 'width 1s ease' }}/>
      </div>
    </div>
  )
}

// ── Home Tab ──────────────────────────────────────────────────────────────────
function HomeTab({ onAddHabit, onAddFood, onAddActivity, viewData, isHistorical }) {
  const { user, habits: storeHabits, foodLogs: storeFoodLogs, activityLogs: storeActivityLogs, dailyScore: storeDailyScore, analytics, removeFoodLog, removeActivityLog, setDashboardData, setAnalyticsData } = useAuraStore()
  const [expandedFood, setExpandedFood] = useState(null)
  const [chartTab, setChartTab] = useState('calories')

  // Use historical view data if available, else live store data
  const foodLogs = viewData?.foodLogs ?? storeFoodLogs
  const activityLogs = viewData?.activityLogs ?? storeActivityLogs
  const dailyScore = viewData?.dailyScore ?? storeDailyScore
  const habits = viewData?.habits ?? storeHabits

  const todayStr = new Date().toDateString()
  const totalCalIn  = foodLogs.reduce((s, f) => s + (f.calories || 0), 0)
  const totalCalOut = activityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0)
  const net = totalCalIn - totalCalOut

  const totalProtein = foodLogs.reduce((s, f) => s + (f.protein || 0), 0)
  const totalCarbs   = foodLogs.reduce((s, f) => s + (f.carbs || 0), 0)
  const totalFat     = foodLogs.reduce((s, f) => s + (f.fat || 0), 0)
  const totalNatSugar= foodLogs.reduce((s, f) => s + (f.naturalSugar || 0), 0)
  const totalAddedSugar= foodLogs.reduce((s, f) => s + (f.addedSugar || 0), 0)

  const targetCals = 1900
  const targetProtein = 110
  const targetCarbs = 200
  const targetFat = 55
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
    const res = await deleteFoodLog(id)
    if (res.success) {
      const [dash, analytics] = await Promise.all([getDashboardData(), getAnalyticsData()])
      if (dash.success) setDashboardData(dash.data)
      if (analytics.success) setAnalyticsData(analytics.data)
    }
  }

  const handleDeleteActivity = async (id) => {
    removeActivityLog(id)
    const res = await deleteActivityLog(id)
    if (res.success) {
      const [dash, analytics] = await Promise.all([getDashboardData(), getAnalyticsData()])
      if (dash.success) setDashboardData(dash.data)
      if (analytics.success) setAnalyticsData(analytics.data)
    }
  }

  const scoreLevel = (dailyScore?.score || 0) > 80 ? 'Elite' : (dailyScore?.score || 0) > 50 ? 'On Track' : 'Building'
  const scoreColor = (dailyScore?.score || 0) > 80 ? '#10b981' : (dailyScore?.score || 0) > 50 ? '#00f3ff' : '#fbbf24'

  return (
    <div className="space-y-4">

      {/* ── Row 1: Score + Energy/Macros Stack ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Neural Score */}
        <Card delay={0.05} className="flex flex-col h-full">
          <div className="flex flex-col gap-3 flex-1">
            <div className="rounded-xl overflow-hidden flex-1 flex flex-col relative min-h-[260px]" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <NeuralScoreParticles score={dailyScore?.score || 0} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">Neural Score</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: `${scoreColor}18`, border: `1px solid ${scoreColor}35` }}>
                <Zap size={11} style={{ color: scoreColor }} />
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: scoreColor }}>{scoreLevel}</span>
              </div>
            </div>
            {dailyScore?.insight ? (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <p className="text-sm font-semibold text-zinc-100 leading-relaxed">{dailyScore.insight.split('.')[0]}.</p>
                <div className="space-y-1 mt-1">
                  <div className="flex items-start gap-2"><span className="text-emerald-400 text-sm shrink-0">✓</span><span className="text-sm text-zinc-300">Keep up your momentum — consistency compounds!</span></div>
                  <div className="flex items-start gap-2"><span className="text-amber-400 text-sm shrink-0">💡</span><span className="text-sm text-zinc-300">{dailyScore.insight.split('.')[1]?.trim() || 'Log your next meal to stay on track.'}</span></div>
                  <div className="flex items-start gap-2"><span className="text-cyan-400 text-sm shrink-0">ℹ</span><span className="text-sm text-zinc-300">{(targetCals - totalCalIn + totalCalOut).toLocaleString()} kcal remaining today</span></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 text-center pb-1">Log your day in the Health tab to generate your score.</p>
            )}
          </div>
        </Card>

        {/* Right Column Stack: Energy + Macros */}
        <div className="flex flex-col gap-4">
          {/* Net Energy */}
          <Card delay={0.1}>
            <CardHeader icon={Zap} title="Net Energy Balance" />
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { icon: Apple, label: 'In', value: totalCalIn, color: 'emerald' },
                { icon: Flame, label: 'Out', value: totalCalOut, color: 'orange' },
                { icon: TrendingUp, label: 'Net', value: net, color: 'purple' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <Icon size={16} className={`text-${color}-400 mx-auto mb-1`} />
                  <p className="text-xl font-black text-zinc-100 leading-none"><Counter target={Math.abs(value)} /></p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">{label}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Daily Macros */}
          <Card delay={0.15}>
            <CardHeader icon={BarChart3} title="Daily Macros" />
            <div className="flex justify-around items-center mb-4">
              <MacroRing value={totalCalIn} target={targetCals} color="#fbbf24" label="Calories" unit="kcal" />
              <MacroRing value={totalProtein} target={targetProtein} color="#00f3ff" label="Protein" />
              <MacroRing value={totalCarbs} target={targetCarbs} color="#bf00ff" label="Carbs" />
              <MacroRing value={totalFat} target={targetFat} color="#f97316" label="Fat" />
            </div>
            <SugarBar natural={totalNatSugar} added={totalAddedSugar} />
          </Card>
        </div>
      </div>{/* end row1 */}




      {/* ── Row 2: 60/40 Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LEFT 60% — Habits + Food Log */}
        <div className="lg:col-span-3 space-y-4">

        {/* Habits */}
        <Card delay={0.15}>
        <CardHeader icon={Flame} title="Today&apos;s Tasks"
          action={
            <button onClick={onAddHabit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-cyan-400/20 transition-colors">
              <Plus size={14} /> Add
            </button>
          }
        />
        <div className="space-y-2.5">
          {sortedHabits.length === 0
            ? <p className="text-zinc-500 text-xs text-center py-4">No habits yet. Click + Add to start.</p>
            : sortedHabits.map((h, i) => {
              const done = (h.logs || []).some(l => new Date(l.completedDate).toDateString() === todayStr)
              return <HabitCard key={h.id} id={h.id} name={h.name} streak={h.currentStreak || 0} color="#00f3ff" done={done} delay={0.05 * i} />
            })
          }
        </div>
      </Card>
        </div>{/* end left */}

        {/* RIGHT 40% — Activity + Macro Summary */}
        <div className="lg:col-span-2 space-y-4">

        {/* Activity Log */}
        <Card delay={0.25}>
        <CardHeader icon={Activity} title="Activity Log"
          action={!isHistorical && (
            <button onClick={onAddActivity} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-cyan-400/20 transition-colors">
              <Plus size={14} /> Add
            </button>
          )}
        />
        <div className="space-y-2">
          {activityLogs.length === 0
            ? <p className="text-zinc-500 text-xs text-center py-4">No activities logged yet.</p>
            : activityLogs.map((a) => (
              <div key={a.id} className="glass-card p-3 flex items-center justify-between group !bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-purple-500/10">
                    <Activity size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{a.name}</p>
                    <p className="text-[10px] text-zinc-500">{a.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-orange-300">{a.caloriesBurned} <span className="text-[9px] text-zinc-500">kcal</span></span>
                  <button onClick={() => handleDeleteActivity(a.id)} className="p-1 border-none bg-transparent cursor-pointer text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          }
        </div>
      </Card>

      {/* Nutrition Log (List view) */}
      <Card delay={0.2}>
        <CardHeader icon={Utensils} title="Nutrition Log"
          action={!isHistorical && (
            <button onClick={onAddFood} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer hover:bg-cyan-400/20 transition-colors">
              <Plus size={14} /> Add
            </button>
          )}
        />
        <div className="space-y-2">
          {foodLogs.length === 0 ? (
            <p className="text-zinc-500 text-xs text-center py-4">No food logged yet.</p>
          ) : (
            foodLogs.map((f) => (
              <div key={f.id} className="glass-card p-3 border border-white/5 bg-white/[0.01]">
                <div onClick={() => setExpandedFood(expandedFood === f.id ? null : f.id)} className="flex items-start justify-between cursor-pointer select-none">
                  <div className="pr-4">
                    <p className="text-sm font-medium text-zinc-200 leading-snug">{f.description}</p>
                    <p className="text-[11px] font-bold text-cyan-400 mt-1">{f.calories} kcal</p>
                  </div>
                  <div className="text-zinc-500 mt-0.5">
                    {expandedFood === f.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
                <AnimatePresence>
                  {expandedFood === f.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
                        <NutrientBar label="Protein" value={Math.round(f.protein || 0)} max={targetProtein} color="#00f3ff" />
                        <NutrientBar label="Carbs" value={Math.round(f.carbs || 0)} max={targetCarbs} color="#bf00ff" />
                        <NutrientBar label="Fat" value={Math.round(f.fat || 0)} max={targetFat} color="#f97316" />
                        <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/5">
                          <span className="text-[10px] text-zinc-500">Nat Sugar: {Math.round(f.naturalSugar||0)}g | Added: {Math.round(f.addedSugar||0)}g</span>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteFood(f.id); }} className="text-xs text-red-400 hover:text-red-300 border-none bg-transparent cursor-pointer">Delete</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </Card>

        </div>{/* end right */}
      </div>

      {/* ── Row 3: Nutrition Summary Table (Full Width) ── */}
      <Card delay={0.25}>
        <CardHeader icon={Target} title="Daily Nutrition Summary" />
        <div className="w-full overflow-x-auto">
          {foodLogs.length === 0 ? (
            <p className="text-zinc-500 text-xs text-center py-6">No food logged yet.</p>
          ) : (
            <table className="w-full text-left text-sm border-collapse whitespace-normal">
              <thead>
                <tr className="border-b border-white/5 text-zinc-500 uppercase text-[10px] font-bold tracking-widest">
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
                  <tr key={f.id} className="border-b border-white/5 group hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 pl-6 text-zinc-500 font-mono">{i + 1}</td>
                    <td className="p-4 text-zinc-200 font-semibold max-w-xs">{f.description}</td>
                    <td className="p-4 text-zinc-100 font-mono text-base text-right">{f.calories}</td>
                    <td className="p-4 text-zinc-300 font-mono text-base text-right">{Math.round(f.protein || 0)}g</td>
                    <td className="p-4 text-zinc-300 font-mono text-base text-right">{Math.round(f.carbs || 0)}g</td>
                    <td className="p-4 text-zinc-300 font-mono text-base text-right">{Math.round(f.fat || 0)}g</td>
                    <td className="p-4 text-zinc-300 font-mono text-base text-right">{Math.round(f.naturalSugar || 0)}g</td>
                    <td className="p-4 text-zinc-300 font-mono text-base text-right">{Math.round(f.addedSugar || 0)}g</td>
                    <td className="p-4 text-right pr-6">
                      <button onClick={() => handleDeleteFood(f.id)} className="p-2 rounded-lg bg-red-500/0 cursor-pointer text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 border-none">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <td colSpan={2} className="p-4 pl-6 font-black text-zinc-100 uppercase text-xs tracking-wider">Day total</td>
                  <td className="p-4 font-black text-zinc-100 font-mono text-base text-right">{totalCalIn}</td>
                  <td className="p-4 font-black text-zinc-100 font-mono text-base text-right">{Math.round(totalProtein)}g</td>
                  <td className="p-4 font-black text-zinc-100 font-mono text-base text-right">{Math.round(totalCarbs)}g</td>
                  <td className="p-4 font-black text-zinc-100 font-mono text-base text-right">{Math.round(totalFat)}g</td>
                  <td className="p-4 font-black text-zinc-100 font-mono text-base text-right">{Math.round(totalNatSugar)}g</td>
                  <td className="p-4 font-black text-zinc-100 font-mono text-base text-right">{Math.round(totalAddedSugar)}g</td>
                  <td></td>
                </tr>

                <tr className="border-b border-white/5 bg-black/20">
                  <td colSpan={2} className="p-4 pl-6 font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Target</td>
                  <td className="p-4 text-zinc-500 font-mono text-sm text-right">{targetCals}</td>
                  <td className="p-4 text-zinc-500 font-mono text-sm text-right">{targetProtein}g</td>
                  <td className="p-4 text-zinc-500 font-mono text-sm text-right">{targetCarbs}g</td>
                  <td className="p-4 text-zinc-500 font-mono text-sm text-right">{targetFat}g</td>
                  <td className="p-4 text-zinc-600 font-mono text-sm text-right">—</td>
                  <td className="p-4 text-zinc-500 font-mono text-sm text-right">&lt;25g</td>
                  <td></td>
                </tr>

                <tr className="bg-white/[0.01]">
                  <td colSpan={2} className="p-4 pl-6 font-black text-zinc-300 pt-6 pb-8 uppercase text-xs tracking-widest">Status</td>
                  {[
                    { val: totalCalIn, tar: targetCals, reverse: false, suffix: '' },
                    { val: totalProtein, tar: targetProtein, reverse: true, suffix: 'g' },
                    { val: totalCarbs, tar: targetCarbs, reverse: false, suffix: 'g' },
                    { val: totalFat, tar: targetFat, reverse: false, suffix: 'g' },
                    { val: null },
                    { val: totalAddedSugar, tar: 25, reverse: false, suffix: 'g' }
                  ].map((s, idx) => {
                    if (s.val === null) return <td key={idx} className="p-4 text-zinc-700 text-right">—</td>
                    const delta = s.val - s.tar
                    const isGood = s.reverse ? delta >= 0 : delta <= 0
                    const Icon = isGood ? Heart : Flame
                    return (
                      <td key={idx} className="p-4 pt-6 pb-8 font-mono text-right">
                        <div className={`flex flex-col items-end gap-1 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
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
      {/* ── Row 3: Trend Chart ── */}
      <Card delay={0.35}>
        <CardHeader icon={TrendingUp} title="Trend Analysis" />
        <div className="flex gap-2 mb-4">
          {['calories', 'sugar', 'habits'].map(t => (
            <button key={t} onClick={() => setChartTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer transition-colors ${chartTab === t ? 'bg-cyan-400/15 text-cyan-400' : 'bg-white/5 text-zinc-500 hover:text-zinc-300'}`}>
              {t}
            </button>
          ))}
        </div>
        {liveAnalytics.length === 0
          ? <div className="h-44 flex items-center justify-center text-zinc-600 text-xs">No weekly data yet</div>
          : (
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'calories' ? (
                  <BarChart data={liveAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} unit=" kcal" width={55} />
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="calories" name="Intake" fill="#FBBF24" radius={[4,4,0,0]} />
                    <Bar dataKey="burned"   name="Burned" fill="#00f3ff" radius={[4,4,0,0]} opacity={0.8} />
                  </BarChart>
                ) : chartTab === 'sugar' ? (
                  <BarChart data={liveAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} unit=" g" />
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12 }} />
                    <Bar dataKey="naturalSugar" name="Natural" fill="#22c55e" radius={[4,4,0,0]} />
                    <Bar dataKey="addedSugar"   name="Added"   fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                ) : (
                  <LineChart data={liveAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                    <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 12 }} />
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

// ── Health Tab ─────────────────────────────────────────────────────────────────
function HealthTab({ viewData, isHistorical }) {
  const { dailyScore: storeDailyScore, setDailyScore, foodLogs: storeFoodLogs, activityLogs: storeActivityLogs, habits: storeHabits, setDashboardData, setAnalyticsData } = useAuraStore()

  const foodLogs = viewData?.foodLogs ?? storeFoodLogs
  const activityLogs = viewData?.activityLogs ?? storeActivityLogs
  const dailyScore = viewData?.dailyScore ?? storeDailyScore
  const habits = viewData?.habits ?? storeHabits
  const [dayText, setDayText] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [lastExtracted, setLastExtracted] = useState(null) // { foods, activities, completedHabitNames }

  const totalCalIn  = foodLogs.reduce((s, f) => s + (f.calories || 0), 0)
  const totalCalOut = activityLogs.reduce((s, a) => s + (a.caloriesBurned || 0), 0)
  const DAILY_CAL_GOAL = 2000
  const calRemaining = Math.max(0, DAILY_CAL_GOAL - totalCalIn + totalCalOut)
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
    } else {
      alert('Failed: ' + res.error)
    }
    setIsGenerating(false)
  }

  return (
    <div className="space-y-4">

      {/* Daily Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card delay={0} className="!p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Calories Remaining</p>
          <p className="text-3xl font-black mt-1" style={{ color: calRemaining < 300 ? '#ef4444' : '#22c55e' }}>
            {calRemaining.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">of {DAILY_CAL_GOAL} kcal goal</p>
          <div className="mt-2 h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (totalCalIn / DAILY_CAL_GOAL) * 100)}%`, background: totalCalIn > DAILY_CAL_GOAL ? '#ef4444' : '#22c55e' }} />
          </div>
          <div className="flex justify-between text-[9px] text-zinc-600 mt-1">
            <span>{totalCalIn} in</span><span>{totalCalOut} burned</span>
          </div>
        </Card>
        <Card delay={0.05} className="!p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Habits Progress</p>
          <p className="text-3xl font-black text-white mt-1">{completedHabits.length}<span className="text-base text-zinc-500">/{habits.length}</span></p>
          <p className="text-[10px] text-zinc-500 mt-0.5">completed today</p>
          {pendingHabits.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {pendingHabits.slice(0, 2).map(h => (
                <p key={h.id} className="text-[10px] text-amber-400 font-bold">⏳ {h.name}</p>
              ))}
              {pendingHabits.length > 2 && <p className="text-[10px] text-zinc-600">+{pendingHabits.length - 2} more</p>}
            </div>
          )}
        </Card>
      </div>

      {/* AI Action Plan */}
      {dailyScore && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 border-l-4 border-cyan-400">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={16} className="text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Your Action Plan</span>
              </div>
              <p className="text-sm font-semibold text-zinc-100 leading-relaxed">{dailyScore.insight}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-3xl font-black gradient-text">{dailyScore.score}</p>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wider">score</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* What AI Extracted — shown after generation */}
      {lastExtracted && (lastExtracted.foods.length > 0 || lastExtracted.activities.length > 0 || lastExtracted.completedHabitNames.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">What AI Logged From Your Input</p>

          {lastExtracted.foods.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Utensils size={11} /> Foods</p>
              <div className="space-y-1.5">
                {lastExtracted.foods.map((f, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-amber-400/5 border border-amber-400/15 rounded-xl">
                    <span className="text-xs text-zinc-200">{f.description}</span>
                    <div className="text-right ml-3 shrink-0">
                      <span className="text-xs font-black text-amber-400">{f.calories} kcal</span>
                      <span className="text-[9px] text-zinc-500 ml-2">{f.protein}p · {f.carbs}c · {f.fat}f</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastExtracted.activities.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Activity size={11} /> Activities</p>
              <div className="space-y-1.5">
                {lastExtracted.activities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 bg-cyan-400/5 border border-cyan-400/15 rounded-xl">
                    <span className="text-xs text-zinc-200">{a.name}</span>
                    <div className="text-right ml-3 shrink-0">
                      <span className="text-xs font-black text-cyan-400">{a.caloriesBurned} kcal</span>
                      <span className="text-[9px] text-zinc-500 ml-2">{a.duration}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastExtracted.completedHabitNames.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Target size={11} /> Habits Marked Done</p>
              <div className="flex flex-wrap gap-2">
                {lastExtracted.completedHabitNames.map((n, i) => (
                  <span key={i} className="px-2.5 py-1 text-[11px] font-bold bg-purple-400/10 border border-purple-400/20 text-purple-300 rounded-lg">✓ {n}</span>
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
            <p className="text-sm font-bold text-zinc-400">Viewing historical data</p>
            <p className="text-xs text-zinc-600">Switch back to <b className="text-zinc-500">Today</b> from the date picker above to log new entries.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-zinc-500">Describe what you ate, did, and which habits you completed. The AI will extract and log everything automatically.</p>
            <div className="bg-amber-400/10 border border-amber-400/20 p-2.5 rounded-lg flex items-start gap-2">
              <span className="text-amber-400 text-[10px] mt-0.5">⚠️</span>
              <p className="text-[11px] text-amber-200/80 leading-relaxed font-medium">
                If you already checked off your <b>Health</b> or <b>Fitness</b> habits in the Dashboard, they are logged automatically! Do not rewrite them here to avoid double-logging.
              </p>
            </div>
            
            {chatHistory.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-cyan-400/20 text-cyan-400 ml-auto w-[85%] rounded-br-sm' : 'bg-white/10 text-zinc-200 mr-auto w-[85%] rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                ))}
              </div>
            )}

            <textarea value={dayText} onChange={e => setDayText(e.target.value)} disabled={isGenerating}
              placeholder={chatHistory.length === 0 ? "e.g. Had oatmeal for breakfast, ran 5km, drank 2L water, did my meditation…" : "Type your answer..."}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-zinc-200 outline-none focus:border-cyan-400 transition-colors resize-none h-20" />
            <button onClick={handleGenerate} disabled={isGenerating || !dayText.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-white font-bold text-sm tracking-wide disabled:opacity-50 transition-opacity cursor-pointer">
              {isGenerating
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing your day…</>
                : <><Sparkles size={16} /> {chatHistory.length > 0 ? 'Reply & Analyze' : 'Analyze & Log Everything'}</>
              }
            </button>
          </div>
        )}
      </Card>

      {/* All Food Logs for today */}
      <Card delay={0.15}>
        <CardHeader icon={Utensils} title={`Food Log (${foodLogs.length} items)`} />
        {foodLogs.length === 0
          ? <p className="text-zinc-600 text-xs text-center py-4">No food logged yet. Describe your meals above.</p>
          : (
            <div className="space-y-2">
              {foodLogs.map(f => (
                <div key={f.id} className="flex items-start justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{f.description}</p>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                      <span className="text-[10px] font-bold text-amber-400">{f.calories} kcal</span>
                      <span className="text-[10px] text-zinc-600">P:{f.protein}g</span>
                      <span className="text-[10px] text-zinc-600">C:{f.carbs}g</span>
                      <span className="text-[10px] text-zinc-600">F:{f.fat}g</span>
                      {f.addedSugar > 0 && <span className="text-[10px] text-red-400">Sugar+:{f.addedSugar}g</span>}
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono ml-2 shrink-0">
                    {new Date(f.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 bg-amber-400/5 border border-amber-400/20 rounded-xl mt-1">
                <span className="text-xs font-bold text-zinc-400">Total Consumed</span>
                <span className="text-sm font-black text-amber-400">{totalCalIn.toLocaleString()} kcal</span>
              </div>
            </div>
          )
        }
      </Card>

      {/* Activity Logs for today */}
      <Card delay={0.2}>
        <CardHeader icon={Activity} title={`Activity Log (${activityLogs.length} items)`} />
        {activityLogs.length === 0
          ? <p className="text-zinc-600 text-xs text-center py-4">No activities logged yet.</p>
          : (
            <div className="space-y-2">
              {activityLogs.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{a.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{a.duration} min</p>
                  </div>
                  <span className="text-sm font-black text-cyan-400">{a.caloriesBurned} <span className="text-[10px] text-zinc-500">kcal</span></span>
                </div>
              ))}
              <div className="flex items-center justify-between px-3 py-2 bg-cyan-400/5 border border-cyan-400/20 rounded-xl mt-1">
                <span className="text-xs font-bold text-zinc-400">Total Burned</span>
                <span className="text-sm font-black text-cyan-400">{totalCalOut.toLocaleString()} kcal</span>
              </div>
            </div>
          )
        }
      </Card>
    </div>
  )

}

// ── Profile Tab ────────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user } = useAuraStore()
  return (
    <Card>
      <CardHeader icon={Heart} title="Your Profile" />
      {user ? (
        <div className="space-y-3">
          {[
            { label: 'Name',   value: user.name },
            { label: 'Goal',   value: user.goal },
            { label: 'Height', value: user.height ? `${user.height} cm` : '—' },
            { label: 'Weight', value: user.weight ? `${user.weight} kg` : '—' },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">{r.label}</span>
              <span className="text-sm font-semibold text-zinc-200">{r.value}</span>
            </div>
          ))}
        </div>
      ) : <p className="text-zinc-500 text-sm text-center py-8">Loading profile…</p>}
    </Card>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { setDashboardData, setAnalyticsData, setError, isLoading, user } = useAuraStore()
  const [tab, setTab] = useState('home')
  const [actionMenu, setActionMenu] = useState(false)
  const [showHabitModal, setShowHabitModal]     = useState(false)
  const [showFoodModal, setShowFoodModal]       = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString())
  const [histViewData, setHistViewData] = useState(null)
  const [histLoading, setHistLoading] = useState(false)

  const isHistorical = new Date(selectedDate).toDateString() !== new Date().toDateString()

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
      if (dash.success)      setDashboardData(dash.data)
      else                   setError(dash.error)
      if (analytics.success) setAnalyticsData(analytics.data)
    }).catch(e => setError(e.message))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-[#080810] pb-24 relative">
      <header className="sticky top-0 z-40 glass-nav py-4 px-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{today}</p>
            <h1 className="text-lg font-bold text-zinc-100 mt-0.5">
              Hello, <span className="gradient-text">{isLoading ? '…' : user?.name || 'Aura'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {user?.createdAt && (
              <DatePicker
                selectedDate={selectedDate}
                onSelect={handleDateSelect}
                joinedAt={user.createdAt}
              />
            )}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-black text-white">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 md:px-6 pt-5">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : histLoading ? (
          <div className="flex h-64 items-center justify-center flex-col gap-3">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-xs">Loading historical data…</p>
          </div>
        ) : (
          <>
            {isHistorical && (
              <div className="mb-4 px-1 flex items-center gap-2">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-2">
                  Viewing {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <div className="flex-1 h-px bg-white/5" />
              </div>
            )}
            <AnimatePresence mode="wait">
              {tab === 'home'     && <motion.div key="home"     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HomeTab onAddHabit={() => setShowHabitModal(true)} onAddFood={() => setShowFoodModal(true)} onAddActivity={() => setShowActivityModal(true)} viewData={histViewData} isHistorical={isHistorical} /></motion.div>}
              {tab === 'health'   && <motion.div key="health"   initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HealthTab viewData={histViewData} isHistorical={isHistorical} /></motion.div>}
              {tab === 'progress' && <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProgressAnalytics /></motion.div>}
              {tab === 'profile'  && <motion.div key="profile"  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProfileTab /></motion.div>}
            </AnimatePresence>
          </>
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} onAdd={() => setActionMenu(true)} />

      <GlobalActionMenu isOpen={actionMenu} onClose={() => setActionMenu(false)}
        onSelect={id => { if (id==='habit') setShowHabitModal(true); else if (id==='food') setShowFoodModal(true); else setShowActivityModal(true); }} />
      <HabitCreationModal isOpen={showHabitModal} onClose={() => setShowHabitModal(false)} />
      <FoodLogModal        isOpen={showFoodModal}  onClose={() => setShowFoodModal(false)}  />
      <ActivityLogModal    isOpen={showActivityModal} onClose={() => setShowActivityModal(false)} />
    </div>
  )
}
