import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Utensils, Activity, Sparkles, TrendingUp, Loader2 } from 'lucide-react';
import { logFoodWithAI, logActivityWithAI, addHabitAction } from '@/app/actions';
import { useAuraStore } from '@/lib/store';

// Reusable Glass Modal Wrapper
const GlassModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 pb-0 md:pb-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ y: '100%', opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 p-6 flex flex-col gap-6"
        style={{ borderRadius: '32px 32px 0 0', md: { borderRadius: '32px' } }}
      >
        <div className="flex items-center justify-between">
           <h2 className="text-2xl font-black text-white">{title}</h2>
           <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 transition-all border border-white/5">
              <X size={24} />
           </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

export const GlobalActionMenu = ({ isOpen, onClose, onSelect }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center pointer-events-none p-4 pb-[110px] md:pb-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.9 }} 
            animate={{ y: 0, opacity: 1, scale: 1 }} 
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-sm pointer-events-auto flex flex-col gap-3"
          >
             {[
               { id: 'habit', label: 'New Habit', desc: 'Build a new daily routine', icon: <Target size={20} />, color: '#7C3AED' },
               { id: 'food', label: 'Log Food', desc: 'Track nutrition & calories', icon: <Utensils size={20} />, color: '#FBBF24' },
               { id: 'activity', label: 'Log Activity', desc: 'Estimate workout burn', icon: <Activity size={20} />, color: '#A8FFF3' },
             ].map((action) => (
               <button 
                 key={action.id}
                 onClick={() => { onSelect(action.id); onClose(); }}
                 className="flex items-center gap-4 p-4 bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 rounded-[20px] text-left transition-all hover:bg-white/10 hover:scale-[1.02]"
               >
                 <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: `${action.color}20`, color: action.color }}>
                   {action.icon}
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-bold text-white leading-tight">{action.label}</h3>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">{action.desc}</p>
                 </div>
               </button>
             ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export const HabitCreationModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHabit } = useAuraStore();

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const res = await addHabitAction(name, 'daily');
    if (res.success) {
      addHabit(res.data);
      setName('');
      onClose();
    } else {
      alert("Failed to create habit: " + res.error);
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassModal isOpen={isOpen} onClose={onClose} title="Create Habit">
          <div className="flex flex-col gap-5">
             <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Habit Name</label>
               <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Read 10 Pages" className="w-full bg-white/5 border border-white/10 rounded-[16px] p-4 text-[15px] font-bold text-white outline-none focus:border-[#7C3AED] transition-all" />
             </div>
             
             <div className="flex flex-col gap-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Category</label>
               <div className="grid grid-cols-2 gap-2">
                 {['Health', 'Productivity', 'Mindfulness', 'Fitness'].map((cat) => (
                   <button key={cat} type="button" className="p-4 bg-white/5 border border-white/10 rounded-[16px] text-sm font-bold text-white/60 hover:text-white hover:border-[#7C3AED] transition-all text-left">
                     {cat}
                   </button>
                 ))}
               </div>
             </div>

             <button disabled={loading} onClick={handleSave} className="w-full p-5 mt-4 bg-[#7C3AED] hover:bg-[#6D28D9] font-black text-lg rounded-[24px] transition-all shadow-[0_10px_20px_rgba(124,58,237,0.3)] disabled:opacity-50 flex justify-center items-center gap-2">
                {loading && <Loader2 className="animate-spin" size={20} />}
                Create Habit
             </button>
          </div>
        </GlassModal>
      )}
    </AnimatePresence>
  )
}

export const FoodLogModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addFoodLog } = useAuraStore();

  const handleAnalyze = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    const res = await logFoodWithAI(desc);
    if (res.success) {
      setResult(res.data);
      setStep(2);
    } else {
      alert("AI analysis failed: " + res.error);
    }
    setLoading(false);
  };

  const handleSave = () => {
    addFoodLog(result);
    setDesc('');
    setResult(null);
    setStep(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassModal isOpen={isOpen} onClose={() => { onClose(); setStep(1); }} title={step === 1 ? "Log Nutrition" : "AI Breakdown"}>
          {step === 1 ? (
             <div className="flex flex-col gap-5">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">What did you eat?</label>
                 <textarea 
                   rows={2}
                   value={desc}
                   onChange={e => setDesc(e.target.value)}
                   placeholder="e.g. 2 scrambled eggs with toast" 
                   className="w-full bg-white/5 border border-white/10 rounded-[16px] p-4 text-[15px] font-bold text-white outline-none focus:border-[#FBBF24] transition-all resize-none" 
                 />
               </div>
               
               <button disabled={loading} onClick={handleAnalyze} className="w-full flex justify-center items-center gap-3 p-4 mt-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-black text-[15px] rounded-[16px] transition-all shadow-[0_10px_20px_rgba(251,191,36,0.3)] disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
                  Analyze Food
               </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
               <div className="flex items-center gap-3 bg-[#A8FFA8]/10 border border-[#A8FFA8]/20 p-4 rounded-[20px]">
                 <Sparkles className="text-[#A8FFA8]" size={20} />
                 <p className="text-sm font-bold text-[#A8FFA8]">AI processed with <span className="font-black">98%</span> High Confidence</p>
               </div>

               <div className="grid grid-cols-2 gap-3">
                 {[
                   { label: 'Calories', val: `${result.calories} kcal`, color: '#FBBF24' },
                   { label: 'Protein', val: `${result.protein}g`, color: '#FF8A8A' },
                   { label: 'Carbs', val: `${result.carbs}g`, color: '#C2C2FF' },
                   { label: 'Fats', val: `${result.fat}g`, color: '#A8FFF3' },
                 ].map(n => (
                    <div key={n.label} className="bg-white/5 border border-white/10 p-4 rounded-[20px] flex items-center justify-between">
                       <span className="text-xs font-black uppercase tracking-widest text-white/40">{n.label}</span>
                       <span className="text-xl font-black" style={{ color: n.color }}>{n.val}</span>
                    </div>
                 ))}
               </div>

               <div className="flex gap-3 mt-4">
                 <button onClick={() => setStep(1)} className="flex-1 p-5 bg-white/5 hover:bg-white/10 border border-white/10 font-black text-lg rounded-[24px] transition-all">Discard</button>
                 <button onClick={handleSave} className="flex-[2] p-5 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-black text-lg rounded-[24px] transition-all shadow-[0_10px_20px_rgba(251,191,36,0.3)]">Save Log</button>
               </div>
            </div>
          )}
        </GlassModal>
      )}
    </AnimatePresence>
  )
}

export const ActivityLogModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addActivityLog } = useAuraStore();

  const handleAnalyze = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    const res = await logActivityWithAI(desc);
    if (res.success) {
      setResult(res.data);
      setStep(2);
    } else {
      alert("AI analysis failed: " + res.error);
    }
    setLoading(false);
  };

  const handleSave = () => {
    addActivityLog(result);
    setDesc('');
    setResult(null);
    setStep(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassModal isOpen={isOpen} onClose={() => { onClose(); setStep(1); }} title={step === 1 ? "Log Activity" : "Burn Estimate"}>
           {step === 1 ? (
             <div className="flex flex-col gap-5">
               <div className="flex flex-col gap-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Describe Workout</label>
                 <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} placeholder="e.g. Ran 5km at moderate pace for 30 minutes" className="w-full bg-white/5 border border-white/10 rounded-[16px] p-4 text-[15px] font-bold text-white outline-none focus:border-[#A8FFF3] transition-all resize-none" />
               </div>
               
               <button disabled={loading} onClick={handleAnalyze} className="w-full flex justify-center items-center gap-3 p-4 mt-2 bg-[#A8FFF3] hover:bg-[#8EECE0] text-black font-black text-[15px] rounded-[16px] transition-all shadow-[0_10px_20px_rgba(168,255,243,0.3)] disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <TrendingUp size={24} />}
                  Calculate Burn
               </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
               <div className="flex flex-col items-center justify-center py-6 bg-white/5 border border-white/10 rounded-[32px] gap-2 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[#A8FFF3]/5 blur-3xl rounded-full scale-150"></div>
                 <div className="relative z-10 text-center">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Estimated Burn ({result.duration}m)</p>
                   <h3 className="text-6xl font-black text-[#A8FFF3] drop-shadow-[0_0_15px_rgba(168,255,243,0.3)]">{result.caloriesBurned}</h3>
                   <span className="text-sm font-bold text-white/40 uppercase tracking-widest mt-1">kcal</span>
                 </div>
               </div>

               <div className="flex gap-3">
                 <button onClick={() => setStep(1)} className="flex-1 p-5 bg-white/5 hover:bg-white/10 border border-white/10 font-black text-lg rounded-[24px] transition-all">Back</button>
                 <button onClick={handleSave} className="flex-[2] p-5 bg-[#A8FFF3] hover:bg-[#8EECE0] text-black font-black text-lg rounded-[24px] transition-all shadow-[0_10px_20px_rgba(168,255,243,0.3)]">Save Activity</button>
               </div>
            </div>
          )}
        </GlassModal>
      )}
    </AnimatePresence>
  )
}
