import React from 'react';
import { motion } from 'framer-motion';
import { useSynapzeStore } from '@/lib/store';
import { Utensils, Activity, Target, TrendingUp, TrendingDown } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border rounded-xl px-3 py-2 text-xs" style={{ background: 'var(--surface-elevated)', backdropFilter: 'blur(12px)', borderColor: 'var(--border)' }}>
      <p className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: <span className="font-mono font-bold">{p.value}</span></p>
      ))}
    </div>
  );
};

export const ProgressAnalytics = () => {
  const { analytics, foodLogs, activityLogs, habits } = useSynapzeStore();

  // --- Build today's timeline
  const todayStr = new Date().toDateString();
  const timeline = [
    ...foodLogs.map(f => ({
      time: new Date(f.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Logged Food', desc: f.description,
      color: '#7c6bc4', icon: Utensils, rawDate: new Date(f.loggedAt),
      meta: `${f.calories} kcal`,
    })),
    ...activityLogs.map(a => ({
      time: new Date(a.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: 'Activity', desc: `${a.name}`,
      color: '#a78bfa', icon: Activity, rawDate: new Date(a.loggedAt),
      meta: `${a.caloriesBurned} kcal burned - ${a.duration}m`,
    })),
    ...habits.flatMap(h =>
      (h.logs || [])
        .filter(l => new Date(l.completedDate).toDateString() === todayStr)
        .map(l => ({
          time: new Date(l.completedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: 'Task Completed', desc: h.name,
          color: '#7c6bc4', icon: Target, rawDate: new Date(l.completedDate),
          meta: `${h.currentStreak} day streak`,
        }))
    ),
  ].sort((a, b) => b.rawDate - a.rawDate);

  const currentCompletion = analytics.length > 0 ? analytics[analytics.length - 1].habitCompletion : 0;
  const weekAvgCal = analytics.length > 0
    ? Math.round(analytics.reduce((s, d) => s + d.calories, 0) / analytics.filter(d => d.calories > 0).length || 0)
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 pb-32 lg:pb-8">

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Task Completion</p>
          <p className="text-3xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>{currentCompletion}<span className="text-base" style={{ color: 'var(--text-muted)' }}>%</span></p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Today&apos;s rate</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Avg Daily Intake</p>
          <p className="text-3xl font-black mt-1" style={{ color: 'var(--text-primary)' }}>{weekAvgCal}<span className="text-base" style={{ color: 'var(--text-muted)' }}> kcal</span></p>
          <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>7-day average</p>
        </div>
      </div>

      {/* Calories Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Calories - 7 Days</h3>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7c6bc4] inline-block" />Intake</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#a78bfa] inline-block" />Burned</span>
          </div>
        </div>
        {analytics.length === 0 ? (
          <div className="flex items-center justify-center text-xs py-8" style={{ color: 'var(--text-faint)' }}>No data yet - log food and activities</div>
        ) : (
          <ResponsiveContainer width="100%" height={176}>
            <BarChart data={analytics} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,107,196,0.08)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b6490' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6490' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calories" name="Intake" fill="#7c6bc4" radius={[6, 6, 0, 0]} opacity={0.9} />
              <Bar dataKey="burned"   name="Burned" fill="#a78bfa" radius={[6, 6, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Sugar Chart */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>Sugar Intake - 7 Days</h3>
        {analytics.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs" style={{ color: 'var(--text-faint)' }}>No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={144}>
            <BarChart data={analytics} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,107,196,0.08)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b6490' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6490' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="naturalSugar" name="Natural" fill="#86efac" radius={[6, 6, 0, 0]} />
              <Bar dataKey="addedSugar"   name="Added"   fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Habit Completion Line */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>Task Rate - 7 Days</h3>
        {analytics.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-xs" style={{ color: 'var(--text-faint)' }}>No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={144}>
            <LineChart data={analytics}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,107,196,0.08)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b6490' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6490' }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="habitCompletion" name="Completion %" stroke="#7c6bc4" strokeWidth={2.5}
                dot={{ fill: '#7c6bc4', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Today's Timeline */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: 'var(--text-primary)' }}>Today&apos;s Timeline</h3>
        {timeline.length === 0 ? (
          <p className="text-center text-xs py-8" style={{ color: 'var(--text-faint)' }}>No activity logged yet today</p>
        ) : (
          <div className="flex flex-col" style={{ borderColor: 'var(--border)' }}>
            {timeline.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${ev.color}15`, color: ev.color }}>
                  <ev.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{ev.title}</p>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{ev.time}</span>
                  </div>
                  <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{ev.desc}</p>
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

