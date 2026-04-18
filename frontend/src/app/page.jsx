'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, Flame, Droplets, Dumbbell, BookOpen, Moon,
  Plus, ChevronRight, Utensils, Activity, TrendingUp,
  Sparkles, Zap, Apple, Coffee, Heart, BarChart3
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar
} from 'recharts'
import BottomNav from '@/components/ui/BottomNav'
import HabitCard from '@/components/ui/HabitCard'
import NutrientBar from '@/components/ui/NutrientBar'

// ─── Static Data ───
const HABITS = [
  { id: 1, name: 'Drink 3L Water', icon: Droplets, streak: 18, color: '#00f3ff' },
  { id: 2, name: 'Workout 45min', icon: Dumbbell, streak: 12, color: '#bf00ff' },
  { id: 3, name: 'Read 30 Pages', icon: BookOpen, streak: 7, color: '#22c55e' },
  { id: 4, name: 'Meditate', icon: Moon, streak: 24, color: '#f97316' },
]
const WEEKLY_DOTS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const WEEKLY_DONE = [true, true, true, true, false, false, false]

const CHART_DATA = [
  { day: 'Mon', cal: 1820, sugar: 12, added: 4 },
  { day: 'Tue', cal: 2100, sugar: 8, added: 2 },
  { day: 'Wed', cal: 1950, sugar: 15, added: 6 },
  { day: 'Thu', cal: 1780, sugar: 10, added: 3 },
  { day: 'Fri', cal: 2200, sugar: 9, added: 2 },
  { day: 'Sat', cal: 2400, sugar: 18, added: 8 },
  { day: 'Sun', cal: 1850, sugar: 11, added: 3 },
]

const FOOD_LOG = [
  { meal: 'Breakfast', desc: 'Scrambled Eggs & Avocado Toast', kcal: 420, natSugar: 8, addSugar: 2, protein: 24, carbs: 38, fat: 22 },
  { meal: 'Lunch', desc: 'Grilled Chicken Salad', kcal: 550, natSugar: 6, addSugar: 1, protein: 42, carbs: 28, fat: 18 },
]

const ACTIVITIES = [
  { name: 'Running', dur: '30 min', kcal: 320, icon: Activity, color: '#00f3ff' },
  { name: 'Yoga', dur: '45 min', kcal: 200, icon: Sparkles, color: '#bf00ff' },
]

// ─── Animated Counter ───
function Counter({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let frame, start
    const dur = 1200
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / dur, 1)
      setVal(Math.floor(p * target))
      if (p < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return <span className="font-mono">{val.toLocaleString()}{suffix}</span>
}

// ─── Card Wrapper ───
function Card({ children, className = '', delay = 0, span = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className={`glass-card p-5 ${span} ${className}`}
    >
      {children}
    </motion.div>
  )
}

function CardHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-cyan-400" />
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-300">{title}</h3>
      </div>
      {action}
    </div>
  )
}

// ─── TABS ───
function HomeTab() {
  const [expandedFood, setExpandedFood] = useState(null)
  const [chartTab, setChartTab] = useState('calories')

  const scoreData = [{ value: 85, fill: 'url(#scoreGrad)' }]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* AI Neural Score */}
      <Card delay={0.1} span="lg:col-span-2">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="78%" outerRadius="100%" startAngle={90} endAngle={-270} data={scoreData} barSize={10}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#00f3ff" />
                    <stop offset="100%" stopColor="#bf00ff" />
                  </linearGradient>
                </defs>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.05)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black gradient-text"><Counter target={85} /></span>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 mt-1">Neural Score</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-400/10 mb-3">
              <Zap size={12} className="text-cyan-400" />
              <span className="text-[10px] font-bold uppercase text-cyan-400 tracking-wider">Elite Consistency</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Your metabolic recovery is surging. You&apos;ve maintained <span className="text-cyan-300 font-semibold">85% efficiency</span> this week. Keep pushing.
            </p>
          </div>
        </div>
      </Card>

      {/* Net Energy */}
      <Card delay={0.2} span="lg:col-span-2">
        <CardHeader icon={Zap} title="Net Energy Balance" />
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="glass-card p-3 !bg-emerald-500/5 !border-emerald-500/10">
            <Apple size={18} className="text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-black text-emerald-300"><Counter target={1850} /></p>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">kcal in</p>
          </div>
          <div className="glass-card p-3 !bg-orange-500/5 !border-orange-500/10">
            <Flame size={18} className="text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-black text-orange-300"><Counter target={2100} /></p>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">kcal out</p>
          </div>
          <div className="glass-card p-3 !bg-purple-500/5 !border-purple-500/10">
            <TrendingUp size={18} className="text-purple-400 mx-auto mb-1" />
            <p className="text-lg font-black text-purple-300">-<Counter target={250} /></p>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500 mt-0.5">deficit</p>
          </div>
        </div>
      </Card>

      {/* Habit Tracker */}
      <Card delay={0.3} span="md:col-span-2">
        <CardHeader
          icon={Flame}
          title="Today's Habits"
          action={
            <motion.button whileTap={{ scale: 0.95 }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400/10 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer">
              <Plus size={14} /> Add
            </motion.button>
          }
        />
        <div className="space-y-2.5">
          {HABITS.map((h, i) => (
            <HabitCard key={h.id} {...h} delay={0.3 + i * 0.08} />
          ))}
        </div>
        {/* Weekly dots */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
          {WEEKLY_DOTS.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold text-zinc-600 uppercase">{d}</span>
              <div className={`w-2.5 h-2.5 rounded-full transition-colors ${WEEKLY_DONE[i] ? 'bg-cyan-400 shadow-glow-cyan' : 'bg-zinc-800'}`} />
            </div>
          ))}
        </div>
      </Card>

      {/* Nutrition Log */}
      <Card delay={0.4}>
        <CardHeader icon={Utensils} title="Nutrition Log" />
        <div className="space-y-2.5">
          {FOOD_LOG.map((f, i) => (
            <div key={i}>
              <motion.button
                onClick={() => setExpandedFood(expandedFood === i ? null : i)}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left glass-card p-3 !bg-white/[0.02] hover:!bg-white/[0.04] cursor-pointer border-none transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">{f.meal}</p>
                    <p className="text-xs text-zinc-200 mt-0.5">{f.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-bold text-cyan-300">{f.kcal}</span>
                    <span className="text-[9px] text-zinc-500">kcal</span>
                    <ChevronRight size={14} className={`text-zinc-600 transition-transform ${expandedFood === i ? 'rotate-90' : ''}`} />
                  </div>
                </div>
              </motion.button>
              <AnimatePresence>
                {expandedFood === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="glass-card p-3 mt-1 space-y-2">
                      <NutrientBar label="Protein" value={f.protein} max={50} color="#00f3ff" />
                      <NutrientBar label="Carbs" value={f.carbs} max={60} color="#bf00ff" />
                      <NutrientBar label="Fat" value={f.fat} max={40} color="#f97316" />
                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <NutrientBar label="Natural Sugar" value={f.natSugar} max={20} color="#22c55e" />
                        <NutrientBar label="Added Sugar" value={f.addSugar} max={20} color="#ef4444" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Card>

      {/* Activity Log */}
      <Card delay={0.5}>
        <CardHeader icon={Activity} title="Activity Log" />
        <div className="space-y-2.5">
          {ACTIVITIES.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="glass-card p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${a.color}15` }}>
                  <a.icon size={18} style={{ color: a.color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-200">{a.name}</p>
                  <p className="text-[10px] text-zinc-500">{a.dur}</p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-orange-300">{a.kcal} <span className="text-[9px] text-zinc-500">kcal</span></span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Trend Charts */}
      <Card delay={0.6} span="md:col-span-2 lg:col-span-4">
        <CardHeader icon={TrendingUp} title="Trend Analysis" />
        {/* Tab pills */}
        <div className="flex gap-2 mb-4">
          {['calories', 'sugar', 'habits'].map(t => (
            <button
              key={t}
              onClick={() => setChartTab(t)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none cursor-pointer transition-colors ${
                chartTab === t ? 'bg-cyan-400/15 text-cyan-400' : 'bg-white/5 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
          <div className="flex-1" />
          {['1W', '1M', '3M'].map(f => (
            <button key={f} className="px-2.5 py-1 rounded-md text-[9px] font-bold text-zinc-600 bg-white/[0.03] border-none cursor-pointer hover:text-zinc-400 transition-colors">{f}</button>
          ))}
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            {chartTab === 'calories' ? (
              <LineChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <defs>
                  <linearGradient id="calLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00f3ff" />
                    <stop offset="100%" stopColor="#bf00ff" />
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="cal" stroke="url(#calLine)" strokeWidth={2.5} dot={{ fill: '#00f3ff', r: 3 }} activeDot={{ r: 5, fill: '#00f3ff' }} />
              </LineChart>
            ) : chartTab === 'sugar' ? (
              <BarChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="sugar" fill="#22c55e" radius={[4, 4, 0, 0]} name="Natural" />
                <Bar dataKey="added" fill="#ef4444" radius={[4, 4, 0, 0]} name="Added" />
              </BarChart>
            ) : (
              <RadialBarChart innerRadius="40%" outerRadius="90%" startAngle={90} endAngle={-270} data={[{ name: 'Habits', value: 85, fill: 'url(#scoreGrad)' }]} barSize={14}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.05)' }} />
              </RadialBarChart>
            )}
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}

function HealthTab() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16">
        <Heart size={40} className="text-cyan-400/20 mb-3" />
        <p className="text-zinc-500 text-sm font-medium">Health Insights</p>
        <p className="text-zinc-600 text-xs mt-1">Coming soon</p>
      </div>
    </Card>
  )
}

function ProgressTab() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center py-16">
        <BarChart3 size={40} className="text-purple-400/20 mb-3" />
        <p className="text-zinc-500 text-sm font-medium">Progress Reports</p>
        <p className="text-zinc-600 text-xs mt-1">Coming soon</p>
      </div>
    </Card>
  )
}



// ─── Main Export ───
export default function DashboardPage() {
  const [tab, setTab] = useState('home')
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen bg-[#0a0a0f] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-nav py-4 px-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{today}</p>
            <h1 className="text-lg font-bold text-zinc-100 mt-0.5">Hello, <span className="gradient-text">Alex</span></h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-black text-white">
            A
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-5">
        <AnimatePresence mode="wait">
          {tab === 'home' && <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HomeTab /></motion.div>}
          {tab === 'health' && <motion.div key="health" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><HealthTab /></motion.div>}
          {tab === 'progress' && <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ProgressTab /></motion.div>}
          {tab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card>
                <div className="flex flex-col items-center justify-center py-16">
                  <p className="text-zinc-500 text-sm">Profile page</p>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
