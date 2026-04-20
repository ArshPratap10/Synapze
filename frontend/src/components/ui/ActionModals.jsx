import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Utensils, Activity, Sparkles, TrendingUp, Loader2, Trash2 } from 'lucide-react';
import { logFoodWithAI, logActivityWithAI, addHabitAction, deleteFoodLog, deleteActivityLog, clarifyFoodQuery, clarifyActivityQuery } from '@/app/actions';
import { useAuraStore } from '@/lib/store';

// ─── Reusable Glass Modal ─────────────────────────────────────────────────────
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
        initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 p-6 flex flex-col gap-5 rounded-t-[32px] md:rounded-[32px]"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 transition-all border border-white/5 cursor-pointer">
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

// ─── Global Action Menu ───────────────────────────────────────────────────────
export const GlobalActionMenu = ({ isOpen, onClose, onSelect }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center pointer-events-none p-4 pb-[110px] md:pb-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm pointer-events-auto flex flex-col gap-3"
        >
          {[
            { id: 'habit', label: 'New Task', desc: 'Build a daily routine', icon: <Target size={20} />, color: '#7C3AED' },
            { id: 'food',  label: 'Log Food',  desc: 'Track nutrition with AI', icon: <Utensils size={20} />, color: '#FBBF24' },
            { id: 'activity', label: 'Log Activity', desc: 'Estimate workout burn', icon: <Activity size={20} />, color: '#00f3ff' },
          ].map(a => (
            <button key={a.id} onClick={() => { onSelect(a.id); onClose(); }}
              className="flex items-center gap-4 p-4 bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 rounded-[20px] text-left transition-all hover:bg-white/10 hover:scale-[1.02] cursor-pointer">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl" style={{ backgroundColor: `${a.color}20`, color: a.color }}>
                {a.icon}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{a.label}</h3>
                <p className="text-[11px] text-white/40 font-bold uppercase tracking-wider mt-0.5">{a.desc}</p>
              </div>
            </button>
          ))}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// ─── Task Creation Modal ──────────────────────────────────────────────────────
export const HabitCreationModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHabit } = useAuraStore();

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const finalName = category ? `${category} — ${name.trim()}` : name.trim();
    const res = await addHabitAction(finalName, 'daily');
    if (res.success) { addHabit(res.data); setName(''); setCategory(''); onClose(); }
    else alert('Failed to create task: ' + res.error);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassModal isOpen={isOpen} onClose={onClose} title="Create Task">
          <div className="flex flex-col gap-4">
            <input
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Read 10 Pages, Drink 2L Water"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-[#7C3AED] transition-all"
            />
            <div className="grid grid-cols-2 gap-2">
              {['Health', 'Productivity', 'Mindfulness', 'Fitness'].map(cat => (
                <button key={cat} type="button" onClick={() => setCategory(category === cat ? '' : cat)}
                  className={`p-3 border rounded-2xl text-sm font-bold transition-all text-left cursor-pointer ${
                    category === cat 
                      ? 'bg-[#7C3AED]/20 border-[#7C3AED] text-[#7C3AED]' 
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/30'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            <button disabled={loading || !name.trim() || !category} onClick={handleSave}
              className="w-full p-4 mt-2 bg-[#7C3AED] hover:bg-[#6D28D9] font-black text-base rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer">
              {loading && <Loader2 className="animate-spin" size={18} />}
              Create Task
            </button>
          </div>
        </GlassModal>
      )}
    </AnimatePresence>
  );
};

// ─── Nutrient Row ─────────────────────────────────────────────────────────────
const NRow = ({ label, value, unit = 'g', color }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-xs text-zinc-400">{label}</span>
    <span className="text-xs font-mono font-bold" style={{ color }}>{value}{unit}</span>
  </div>
);

// ─── Food Log Modal ───────────────────────────────────────────────────────────
export const FoodLogModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [desc, setDesc] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addFoodLog } = useAuraStore();

  const handleAnalyze = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    
    const newHistory = [...chatHistory, { role: 'user', content: desc }];
    setChatHistory(newHistory);
    setDesc(''); // Clear input

    // Check if clarification is needed
    const clarifyRes = await clarifyFoodQuery(newHistory);
    
    if (clarifyRes.success && clarifyRes.data.status === 'clarification_needed') {
      setChatHistory([...newHistory, { role: 'ai', content: clarifyRes.data.question }]);
      setLoading(false);
      return;
    }

    // If success or failure in clarify, just proceed to log
    const fullDescription = newHistory.map(m => m.content).join('. ');
    const res = await logFoodWithAI(fullDescription);
    if (res.success) { setResult(res.data); setStep(2); }
    else alert('AI failed: ' + res.error);
    setLoading(false);
  };

  const handleSave = () => {
    addFoodLog(result);
    setDesc(''); setChatHistory([]); setResult(null); setStep(1); onClose();
  };

  const reset = () => { setStep(1); setDesc(''); setChatHistory([]); setResult(null); };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassModal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={step === 1 ? 'Log Nutrition' : 'AI Breakdown'}>
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              {chatHistory.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`p-3 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-[#FBBF24]/20 text-[#FBBF24] ml-auto w-[85%] rounded-br-sm' : 'bg-white/10 text-zinc-200 mr-auto w-[85%] rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  ))}
                </div>
              )}
              <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)}
                placeholder={chatHistory.length === 0 ? "e.g. 2 scrambled eggs with toast and butter" : "Type your answer..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-[#FBBF24] transition-all resize-none" />
              <button disabled={loading || !desc.trim()} onClick={handleAnalyze}
                className="w-full flex justify-center items-center gap-2 p-4 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-black text-sm rounded-2xl transition-all disabled:opacity-50 cursor-pointer">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {loading ? 'Analyzing...' : (chatHistory.length > 0 ? 'Reply & Analyze' : 'Analyze with AI')}
              </button>
            </div>
          ) : result && (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl">
                <p className="text-sm font-bold text-emerald-300">{result.description}</p>
                <p className="text-xs text-zinc-400 mt-1">AI-estimated nutritional values</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Calories', val: `${result.calories} kcal`, color: '#FBBF24' },
                  { label: 'Protein',  val: `${result.protein}g`,  color: '#f87171' },
                  { label: 'Carbs',    val: `${result.carbs}g`,    color: '#a78bfa' },
                  { label: 'Fat',      val: `${result.fat}g`,      color: '#00f3ff' },
                ].map(n => (
                  <div key={n.label} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">{n.label}</p>
                    <p className="text-xl font-black mt-1" style={{ color: n.color }}>{n.val}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1">
                <NRow label="Natural Sugar" value={result.naturalSugar} color="#22c55e" />
                <NRow label="Added Sugar"   value={result.addedSugar}   color="#ef4444" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 p-4 bg-white/5 border border-white/10 font-black rounded-2xl transition-all hover:bg-white/10 cursor-pointer">
                  Back
                </button>
                <button onClick={handleSave} className="flex-[2] p-4 bg-[#FBBF24] hover:bg-[#F59E0B] text-black font-black rounded-2xl transition-all cursor-pointer">
                  Save Log
                </button>
              </div>
            </div>
          )}
        </GlassModal>
      )}
    </AnimatePresence>
  );
};

// ─── Activity Log Modal ───────────────────────────────────────────────────────
export const ActivityLogModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [desc, setDesc] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addActivityLog } = useAuraStore();

  const handleAnalyze = async () => {
    if (!desc.trim()) return;
    setLoading(true);

    const newHistory = [...chatHistory, { role: 'user', content: desc }];
    setChatHistory(newHistory);
    setDesc(''); // Clear input

    // Check if clarification is needed
    const clarifyRes = await clarifyActivityQuery(newHistory);
    
    if (clarifyRes.success && clarifyRes.data.status === 'clarification_needed') {
      setChatHistory([...newHistory, { role: 'ai', content: clarifyRes.data.question }]);
      setLoading(false);
      return;
    }

    // If success or failure in clarify, just proceed to log
    const fullDescription = newHistory.map(m => m.content).join('. ');
    const res = await logActivityWithAI(fullDescription);
    if (res.success) { setResult(res.data); setStep(2); }
    else alert('AI failed: ' + res.error);
    setLoading(false);
  };

  const handleSave = () => {
    addActivityLog(result);
    setDesc(''); setChatHistory([]); setResult(null); setStep(1); onClose();
  };

  const reset = () => { setStep(1); setDesc(''); setChatHistory([]); setResult(null); };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassModal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={step === 1 ? 'Log Activity' : 'Burn Estimate'}>
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              {chatHistory.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`p-3 rounded-2xl text-sm font-medium ${msg.role === 'user' ? 'bg-[#00f3ff]/20 text-[#00f3ff] ml-auto w-[85%] rounded-br-sm' : 'bg-white/10 text-zinc-200 mr-auto w-[85%] rounded-bl-sm'}`}>
                      {msg.content}
                    </div>
                  ))}
                </div>
              )}
              <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)}
                placeholder={chatHistory.length === 0 ? "e.g. Ran 5km at moderate pace for 30 minutes" : "Type your answer..."}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none focus:border-[#00f3ff] transition-all resize-none" />
              <button disabled={loading || !desc.trim()} onClick={handleAnalyze}
                className="w-full flex justify-center items-center gap-2 p-4 bg-[#00f3ff] hover:bg-cyan-300 text-black font-black text-sm rounded-2xl transition-all disabled:opacity-50 cursor-pointer">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                {loading ? 'Calculating...' : (chatHistory.length > 0 ? 'Reply & Calculate' : 'Calculate Burn')}
              </button>
            </div>
          ) : result && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center py-8 bg-white/5 border border-white/10 rounded-[32px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                  {result.name} · {result.duration} min
                </p>
                <h3 className="text-7xl font-black text-[#00f3ff] drop-shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                  {result.caloriesBurned}
                </h3>
                <span className="text-sm font-bold text-white/30 uppercase tracking-widest mt-1">kcal burned</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 p-4 bg-white/5 border border-white/10 font-black rounded-2xl transition-all hover:bg-white/10 cursor-pointer">
                  Back
                </button>
                <button onClick={handleSave} className="flex-[2] p-4 bg-[#00f3ff] hover:bg-cyan-300 text-black font-black rounded-2xl transition-all cursor-pointer">
                  Save Activity
                </button>
              </div>
            </div>
          )}
        </GlassModal>
      )}
    </AnimatePresence>
  );
};
