import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Droplets, 
  Move, 
  Zap,
  Flame,
  Target,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const WeeklyProgressChart = ({ stats }) => (
  <div className="flex justify-between items-end w-full h-20 gap-1 pt-4">
    {stats.map((day, idx) => (
      <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
        <div className="relative w-full h-[60px] bg-white/5 rounded-[4px] overflow-hidden">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${day.value}%` }}
            transition={{ duration: 1.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 w-full bg-gradient-to-t from-[#9D7BEA] to-[#FF6B6B] group-hover:from-[#FF6B6B] group-hover:to-[#FFB86C] transition-all"
          />
        </div>
        <span className={`text-[8px] font-black uppercase ${day.isToday ? 'text-white' : 'text-white/20'}`}>
          {day.day}
        </span>
      </div>
    ))}
  </div>
);

export const AICoach = ({ 
  completed = 3, 
  total = 7, 
  streak = 12, 
  successRate = 85,
  weeklyStats = [
    { day: 'M', value: 80 },
    { day: 'T', value: 95 },
    { day: 'W', value: 40 },
    { day: 'T', value: 85 },
    { day: 'F', value: 70, isToday: true },
    { day: 'S', value: 0 },
    { day: 'S', value: 0 },
  ]
}) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className="flex flex-col w-full my-8">
      {/* Header with Elite Badge */}
      <div className="flex items-center justify-between mb-8 px-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 glass-premium rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
            <BrainCircuit className="text-gradient-hero" size={20} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-white/80">Neural Suite v2</h2>
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[#A8FFA8] animate-pulse" />
               <span className="text-[9px] font-bold text-[#A8FFA8] uppercase tracking-widest">AI Engine Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 glass-premium rounded-full border border-white/10">
           <Zap size={14} className="text-[#FBBF24]" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">Top 5% Performer</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-[1px] bg-gradient-to-b from-white/20 to-transparent rounded-[48px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)]"
      >
        <div className="relative glass-premium backdrop-blur-[50px] rounded-[47px] p-8 md:p-10 overflow-hidden">
          
          {/* Background Visual Depth */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full glow-radial opacity-40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/5 blur-[120px] rounded-full pointer-events-none" />

          {/* 3-COLUMN RESPONSIVE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-4 items-stretch relative z-10">
            
            {/* 1. LEFT SIDE: Insights & Actions */}
            <div className="lg:col-span-3 flex flex-col justify-between py-2 order-2 lg:order-1">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="text-[#9D7BEA]" />
                    <h3 className="text-xl font-black text-white tracking-tight">Elite Consistency</h3>
                  </div>
                  <p className="text-sm font-bold text-white/40 leading-relaxed">
                    Your metabolic recovery is <span className="text-white">surging</span>. You&apos;ve maintained 85% efficiency this week.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20">Actionable Tasks</h4>
                  {[
                    { icon: Droplets, title: 'Hydration Fix', sub: '500ml water @ 7:00 AM', color: '#A8FFF3' },
                    { icon: Move, title: 'Active Prep', sub: '15m dynamic stretch', color: '#FF6B6B' }
                  ].map((act, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                      className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-[24px] cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner" style={{ backgroundColor: `${act.color}15`, color: act.color }}>
                        <act.icon size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{act.title}</span>
                        <span className="text-xs font-black text-white/80">{act.sub}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. CENTER: Hero Readiness Score */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center order-1 lg:order-2 py-4">
              <div className="relative group">
                {/* Hero Glow Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#9D7BEA]/20 via-[#FF6B6B]/10 to-[#FFB86C]/20 rounded-full scale-150 blur-[100px] opacity-50 glow-pulse" />
                
                <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px] flex items-center justify-center">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                    <defs>
                      <linearGradient id="suiteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#9D7BEA" />
                        <stop offset="50%" stopColor="#FF6B6B" />
                        <stop offset="100%" stopColor="#FFB86C" />
                      </linearGradient>
                    </defs>
                    <circle 
                      cx="50" cy="50" r="46" 
                      fill="none" stroke="rgba(255,255,255,0.02)" 
                      strokeWidth="4" 
                    />
                    <motion.circle 
                      initial={{ strokeDashoffset: 289 }}
                      animate={{ strokeDashoffset: 289 - (289 * 0.88) }}
                      transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                      cx="50" cy="50" r="46" 
                      fill="none" stroke="url(#suiteGradient)" 
                      strokeWidth="5" strokeDasharray="289" 
                      strokeLinecap="round" 
                      className="filter drop-shadow-[0_0_8px_rgba(255,107,107,0.4)]"
                    />
                  </svg>
                  
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, type: "spring", damping: 15 }}
                    >
                      <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white/20 block mb-2">Readiness</span>
                      <h1 className="text-9xl font-black tracking-tighter text-white leading-none drop-shadow-2xl">88</h1>
                      <div className="flex items-center gap-2 justify-center mt-4">
                        <div className="px-4 py-1.5 glass-premium rounded-full border border-white/5 flex items-center gap-2">
                           <CheckCircle2 size={12} className="text-[#A8FFA8]" />
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#A8FFA8]">Optimized</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. RIGHT SIDE: Performance Stats Card */}
            <div className="lg:col-span-3 flex flex-col gap-4 order-3">
              <motion.div 
                whileHover={{ y: -5 }}
                className="flex flex-col p-6 bg-white/[0.03] border border-white/[0.08] rounded-[36px] backdrop-blur-md h-full"
              >
                <div className="flex items-center justify-between mb-8">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Performance Stats</h4>
                   <TrendingUp size={16} className="text-white/20" />
                </div>

                <div className="flex flex-col gap-8">
                  {/* Completed Mini Ring */}
                  <div className="flex items-center gap-5">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                       <svg width="100%" height="100%" viewBox="0 0 100 100" className="transform -rotate-90">
                         <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                         <motion.circle 
                           initial={{ strokeDashoffset: 251 }}
                           animate={{ strokeDashoffset: 251 - (251 * (completed/total)) }}
                           transition={{ duration: 1.5, delay: 1 }}
                           cx="50" cy="50" r="40" fill="none" stroke="#7C3AED" strokeWidth="10" 
                           strokeDasharray="251" strokeLinecap="round" 
                         />
                       </svg>
                       <div className="absolute flex flex-col items-center">
                         <span className="text-[10px] font-black text-white">{completed}</span>
                       </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Completed</span>
                      <span className="text-xl font-black text-white">{completed}<span className="text-sm text-white/30"> / {total}</span></span>
                    </div>
                  </div>

                  {/* Streak Card */}
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 streak-pulse">
                      <Flame size={24} fill="currentColor" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Streak</span>
                      <span className="text-2xl font-black text-white">{streak}<span className="text-xs text-white/30 ml-1 uppercase">Days</span></span>
                    </div>
                  </div>

                  {/* Success Rate Bar */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Success Rate</span>
                      <span className="text-sm font-black text-[#A8FFA8]">{successRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${successRate}%` }}
                        transition={{ duration: 2, delay: 1.2, ease: "circOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A8FFA8]"
                      />
                    </div>
                  </div>

                  {/* 7-Day Performance Graph */}
                  <div className="flex flex-col gap-4 mt-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">7-Day Progress</span>
                    <WeeklyProgressChart stats={weeklyStats} />
                  </div>
                </div>
              </motion.div>
            </div>

          </div>

          {/* GLOBAL ELITE CTA */}
          <div className="mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-gray-800 overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover opacity-60" />
                    </div>
                 ))}
                 <div className="w-10 h-10 rounded-full border-2 border-[#0F172A] bg-indigo-600 flex items-center justify-center text-[10px] font-black">
                   +1.2k
                 </div>
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Analyzing your trends alongside the elite team</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-10 py-5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(124,58,237,0.3)] transition-all group"
            >
              View Full Insights
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
