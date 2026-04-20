import React from 'react';
import { motion } from 'framer-motion';
import { useAuraStore } from '@/lib/store';
import { Utensils, Activity, Target, TrendingUp, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="font-bold text-zinc-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <span className="font-mono font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

export const ProgressAnalytics = () => {
  const { analytics, foodLogs, activityLogs, habits } = useAuraStore();

  // ─ Build today's timeline
  const todayStr = new Date().toDateString();
  const timeline = [
    ...foodLogs.map(f => ({
      time: new Date(f.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Logged Food', desc: f.description,
      color: '#FBBF24', icon: Utensils, rawDate: new Date(f.loggedAt),
      meta: `${f.calories} kcal`,
    })),
    ...activityLogs.map(a => ({
      time: new Date(a.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Activity', desc: `${a.name}`,
      color: '#00f3ff', icon: Activity, rawDate: new Date(a.loggedAt),
      meta: `${a.caloriesBurned} kcal burned · ${a.duration}m`,
    })),
    ...habits.flatMap(h =>
      (h.logs || [])
        .filter(l => new Date(l.completedDate).toDateString() === todayStr)
        .map(l => ({
          time: new Date(l.completedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Task Completed', desc: h.name,
          color: '#a78bfa', icon: Target, rawDate: new Date(l.completedDate),
          meta: `${h.currentStreak} day streak`,
        }))
    ),
  ].sort((a, b) => b.rawDate - a.rawDate);

  const currentCompletion = analytics.length > 0 ? analytics[analytics.length - 1].habitCompletion : 0;
  const weekAvgCal = analytics.length > 0
    ? Math.round(analytics.reduce((s, d) => s + d.calories, 0) / analytics.filter(d => d.calories > 0).length || 0)
    : 0;

  const maxCalValue = Math.max(...analytics.map(d => Math.max(d.calories || 0, d.burned || 0)), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pb-32">

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Task Completion</p>
          <p className="text-3xl font-black text-white mt-1">{currentCompletion}<span className="text-base text-zinc-500">%</span></p>
          <p className="text-[10px] text-zinc-500 mt-1">Today&apos;s rate</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Avg Daily Intake</p>
          <p className="text-3xl font-black text-white mt-1">{weekAvgCal}<span className="text-base text-zinc-500"> kcal</span></p>
          <p className="text-[10px] text-zinc-500 mt-1">7-day average</p>
        </div>
      </div>

      {/* Calories Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider">Calories — 7 Days</h3>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FBBF24] inline-block" />Intake</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00f3ff] inline-block" />Burned</span>
          </div>
        </div>
        {analytics.length === 0 ? (
          <div className="h-44 flex items-center justify-center text-zinc-600 text-xs">No data yet — log food and activities</div>
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <BarChart data={analytics} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calories" name="Intake" fill="#FBBF24" radius={[4, 4, 0, 0]} opacity={0.9} />
              <Bar dataKey="burned"   name="Burned" fill="#00f3ff" radius={[4, 4, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sugar Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Sugar Intake — 7 Days</h3>
        {analytics.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-zinc-600 text-xs">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={144}>
            <BarChart data={analytics} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="naturalSugar" name="Natural" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="addedSugar"   name="Added"   fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Habit Completion Line */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Task Rate — 7 Days</h3>
        {analytics.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-zinc-600 text-xs">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={144}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#71717a' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="habitCompletion" name="Completion %" stroke="#a78bfa" strokeWidth={2.5}
                dot={{ fill: '#a78bfa', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Today's Timeline */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Today&apos;s Timeline</h3>
        {timeline.length === 0 ? (
          <p className="text-center text-zinc-600 text-xs py-8">No activity logged yet today</p>
        ) : (
          <div className="flex flex-col divide-y divide-white/5">
            {timeline.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${ev.color}15`, color: ev.color }}>
                  <ev.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-zinc-200">{ev.title}</p>
                    <span className="text-[10px] text-zinc-500 font-mono">{ev.time}</span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{ev.desc}</p>
                  {ev.meta && <p className="text-[10px] font-bold mt-0.5" style={{ color: ev.color }}>{ev.meta}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
