import React from 'react';
import { motion } from 'framer-motion';

export const ProgressAnalytics = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col gap-8 w-full pb-32"
    >
       <div className="flex flex-col gap-4">
         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Trend Analysis</h2>
         
         {/* Graph 1: Intake vs Burn */}
         <div className="flex flex-col gap-4 p-6 bg-white/5 border border-white/10 rounded-[32px]">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-xl font-bold text-white">Intake vs Burn</h3>
             <span className="text-[10px] font-black uppercase bg-white/10 px-3 py-1 rounded-full">Weekly</span>
           </div>
           
           <div className="relative h-[180px] w-full flex items-end gap-2 md:gap-4 mt-4">
             {/* Mock bars for 7 days */}
             {[
               { i: 2000, b: 2400 },
               { i: 1800, b: 2200 },
               { i: 2200, b: 2500 },
               { i: 1500, b: 2100 },
               { i: 1900, b: 2600 },
               { i: 2100, b: 2300 },
               { i: 1700, b: 2400 },
             ].map((d, idx) => (
                <div key={idx} className="flex-1 flex flex-col justify-end gap-1 h-full relative group">
                  <div 
                    className="w-full bg-[#FBBF24]/80 rounded-[8px] transition-all group-hover:scale-105" 
                    style={{ height: `${(d.i / 3000) * 100}%` }}
                  />
                  <div 
                    className="w-full bg-[#A8FFF3]/60 rounded-[8px] transition-all group-hover:scale-105 absolute bottom-0 left-0 mix-blend-screen pointer-events-none" 
                    style={{ height: `${(d.b / 3000) * 100}%` }}
                  />
                </div>
             ))}
           </div>
           <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FBBF24]" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Intake</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#A8FFF3]" />
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Burn</span>
              </div>
           </div>
         </div>

         {/* Graph 2: Habit Completion Smooth Line Chart */}
         <div className="flex flex-col gap-4 p-6 bg-white/5 border border-white/10 rounded-[32px] overflow-hidden relative">
           <div className="flex justify-between items-center mb-8 relative z-10">
             <h3 className="text-xl font-bold text-white">Completion Rate</h3>
             <span className="text-[10px] font-black uppercase text-[#A8FFA8]">Trending Up</span>
           </div>
           
           <div className="absolute bottom-0 left-0 right-0 h-[120px] opacity-20">
              <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
                 <path d="M0,100 L0,50 C20,60 40,30 60,40 C80,50 90,20 100,10 L100,100 Z" fill="url(#grad)" />
                 <path d="M0,50 C20,60 40,30 60,40 C80,50 90,20 100,10" fill="none" stroke="#A8FFA8" strokeWidth="2" strokeLinecap="round" />
                 <defs>
                   <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#A8FFA8" stopOpacity="1" />
                     <stop offset="100%" stopColor="#061122" stopOpacity="0" />
                   </linearGradient>
                 </defs>
              </svg>
           </div>
           <div className="flex items-end justify-between relative z-10 pt-16">
              <h2 className="text-5xl font-black text-white">85<span className="text-xl text-white/40">%</span></h2>
           </div>
         </div>
       </div>

       {/* Daily Timeline */}
       <div className="flex flex-col gap-4 mt-4">
         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Activity Timeline</h2>
         
         <div className="flex flex-col bg-white/5 border border-white/10 rounded-[32px] overflow-hidden">
            {[
              { time: '08:30 AM', title: 'Logged Food', desc: 'Breakfast: Scrambled eggs', color: '#FBBF24' },
              { time: '09:00 AM', title: 'Habit Completed', desc: 'Meditation (15 min)', color: '#A8FFA8' },
              { time: '05:30 PM', title: 'Logged Activity', desc: 'Ran 5km at moderate pace', color: '#A8FFF3' },
              { time: '09:00 PM', title: 'Night Routine', desc: 'Read 10 pages', color: '#C2C2FF' },
            ].map((ev, i, arr) => (
               <div key={i} className="flex relative items-start gap-6 p-6 pb-8 border-b border-white/5 last:border-0 last:pb-6">
                 {/* Timeline dashed line */}
                 {i !== arr.length - 1 && <div className="absolute left-[39.5px] top-[48px] bottom-[-24px] w-[2px] border-l-2 border-dashed border-white/10" />}
                 
                 <div className="flex flex-col items-center">
                   <div className="w-4 h-4 rounded-full mt-1 z-10 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: ev.color }} />
                 </div>
                 <div className="flex-1">
                   <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block mb-1">{ev.time}</span>
                   <h4 className="text-lg font-bold text-white leading-none mb-2">{ev.title}</h4>
                   <p className="text-sm font-bold text-white/50">{ev.desc}</p>
                 </div>
               </div>
            ))}
         </div>
       </div>
    </motion.div>
  )
}
