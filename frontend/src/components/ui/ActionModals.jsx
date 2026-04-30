'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Utensils, Activity, Sparkles, TrendingUp, Loader2, CheckCircle, AlertTriangle, Edit3, ShieldCheck, BookOpen } from 'lucide-react';
import { logFoodWithAI, confirmFoodLog, logActivityWithAI, addHabitAction, clarifyFoodQuery, clarifyActivityQuery } from '@/app/actions';
import { useSynapzeStore } from '@/lib/store';

// --- Glass Modal shell -------------------------------------------------------
const GlassModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 pb-0 md:pb-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 backdrop-blur-sm" style={{ background: 'var(--overlay-bg)' }} onClick={onClose} />
      <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-lg backdrop-blur-xl border p-6 flex flex-col gap-5 rounded-t-[32px] md:rounded-[32px]"
        style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full transition-all border-none cursor-pointer" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

// --- Global Action Menu ------------------------------------------------------
export const GlobalActionMenu = ({ isOpen, onClose, onSelect }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center pointer-events-none p-4 pb-[110px] md:pb-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 backdrop-blur-sm pointer-events-auto" style={{ background: 'var(--overlay-bg)' }} onClick={onClose} />
        <motion.div initial={{ y: 50, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm pointer-events-auto flex flex-col gap-3">
          {[
            { id: 'habit',    label: 'New Task',     desc: 'Build a daily routine',     icon: <Target size={20} />,   color: '#7c6bc4' },
            { id: 'food',     label: 'Log Food',     desc: 'Track nutrition with AI',   icon: <Utensils size={20} />, color: '#7c6bc4' },
            { id: 'activity', label: 'Log Activity', desc: 'Estimate workout burn',      icon: <Activity size={20} />, color: '#a78bfa' },
            { id: 'journal',  label: 'Journal Entry', desc: 'Write your thoughts',       icon: <BookOpen size={20} />, color: '#3b82f6' },
          ].map(a => (
            <button key={a.id} onClick={() => { onSelect(a.id); onClose(); }}
              className="flex items-center gap-4 p-4 backdrop-blur-xl border rounded-[20px] text-left transition-all hover:scale-[1.02] cursor-pointer"
              style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl" style={{ backgroundColor: `${a.color}15`, color: a.color }}>{a.icon}</div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{a.label}</h3>
                <p className="text-[11px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
              </div>
            </button>
          ))}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Habit Creation Modal ----------------------------------------------------
export const HabitCreationModal = ({ isOpen, onClose, selectedDate = null }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const { addHabit } = useSynapzeStore();

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const finalName = category ? `${category} --- ${name.trim()}` : name.trim();
    const res = await addHabitAction(finalName, 'daily', selectedDate);
    if (res.success) { addHabit(res.data); setName(''); setCategory(''); onClose(); }
    else alert('Failed: ' + res.error);
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassModal isOpen={isOpen} onClose={onClose} title="Create Task">
          <div className="flex flex-col gap-4">
            <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="e.g. Read 10 Pages, Drink 2L Water"
              className="w-full border rounded-2xl p-4 text-sm font-bold outline-none transition-all" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            <div className="grid grid-cols-2 gap-2">
              {['Health', 'Productivity', 'Mindfulness', 'Fitness'].map(cat => (
                <button key={cat} type="button" onClick={() => setCategory(category === cat ? '' : cat)}
                  className={`p-3 border rounded-2xl text-sm font-bold transition-all text-left cursor-pointer ${category === cat ? 'border-[var(--accent)]' : ''}`}
                  style={{
                    background: category === cat ? 'var(--accent-bg)' : 'var(--surface)',
                    borderColor: category === cat ? 'var(--accent)' : 'var(--border)',
                    color: category === cat ? 'var(--accent)' : 'var(--text-muted)',
                  }}>
                  {cat}
                </button>
              ))}
            </div>
            <button disabled={loading || !name.trim() || !category} onClick={handleSave}
              className="w-full p-4 mt-2 bg-gradient-to-r from-[#7c6bc4] to-[#a78bfa] text-white font-black text-base rounded-2xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 cursor-pointer"
              style={{ boxShadow: '0 4px 16px rgba(124,107,196,0.3)' }}>
              {loading && <Loader2 className="animate-spin" size={18} />} Create Task
            </button>
          </div>
        </GlassModal>
      )}
    </AnimatePresence>
  );
};

// --- Confidence Badge --------------------------------------------------------
const ConfidenceBadge = ({ score }) => {
  const pct   = Math.round((score ?? 0) * 100);
  const isHi  = score >= 0.85;
  const isMed = score >= 0.65;
  const color = isHi ? '#22c55e' : isMed ? '#f59e0b' : '#ef4444';
  const label = isHi ? 'High Confidence' : isMed ? 'Medium - Please Review' : 'Low - Cannot Save';
  const Icon  = isHi ? ShieldCheck : AlertTriangle;
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ backgroundColor: `${color}10`, borderColor: `${color}40` }}>
      <Icon size={14} style={{ color }} />
      <span className="text-xs font-black" style={{ color }}>{label} ({pct}%)</span>
    </div>
  );
};

// --- Nutrient Row ------------------------------------------------------------
const NRow = ({ label, value, unit = 'g', color }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span className="text-xs font-mono font-bold" style={{ color }}>{value}{unit}</span>
  </div>
);

// --- Food Log Modal (policy-compliant) ---------------------------------------
export const FoodLogModal = ({ isOpen, onClose, selectedDate = null }) => {
  const [step, setStep] = useState(1);   // 1=chat  2=preview  3=edit
  const [desc, setDesc] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [edited, setEdited]   = useState(null);
  const { addFoodLog } = useSynapzeStore();

  const reset = () => { setStep(1); setDesc(''); setChatHistory([]); setPreview(null); setEdited(null); };

  // --- Step 1: analyze ---
  const handleAnalyze = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    const history = [...chatHistory, { role: 'user', content: desc }];
    setChatHistory(history);
    setDesc('');

    const clarify = await clarifyFoodQuery(history);
    if (clarify.success && clarify.data.status === 'clarification_needed') {
      setChatHistory([...history, { role: 'ai', content: clarify.data.question }]);
      setLoading(false);
      return;
    }

    const full = history.map(m => m.content).join('. ');
    const res  = await logFoodWithAI(full, selectedDate);
    if (res.success) { setPreview(res.preview); setEdited({ ...res.preview }); setStep(2); }
    else alert('AI failed: ' + res.error);
    setLoading(false);
  };

  // --- Step 2: confirm ---
  const handleConfirm = async () => {
    setLoading(true);
    const res = await confirmFoodLog(preview, selectedDate);
    if (res.success) { addFoodLog(res.data); reset(); onClose(); }
    else alert(res.error);
    setLoading(false);
  };

  // --- Step 3: save edited ---
  const handleSaveEdited = async () => {
    setLoading(true);
    const res = await confirmFoodLog({ ...edited, confidenceScore: preview.confidenceScore, generationSource: preview.generationSource, modelId: preview.modelId, promptHash: preview.promptHash }, selectedDate);
    if (res.success) { addFoodLog(res.data); reset(); onClose(); }
    else alert(res.error);
    setLoading(false);
  };

  const canSave = preview && (preview.confidenceScore ?? 0) >= 0.65;
  const isMed   = preview && preview.confidenceScore >= 0.65 && preview.confidenceScore < 0.85;
  const titles  = { 1: 'Log Nutrition', 2: 'AI Breakdown', 3: 'Edit Values' };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassModal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={titles[step]}>

          {/* Step 1 - chat */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              {chatHistory.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {chatHistory.map((m, i) => (
                    <div key={i} className={`p-3 rounded-2xl text-sm font-bold ${m.role === 'user' ? 'ml-auto w-[85%] rounded-br-sm' : 'mr-auto w-[85%] rounded-bl-sm'}`}
                      style={m.role === 'user'
                        ? { background: 'rgba(124, 107, 196, 0.2)', color: '#a78bfa', border: '1px solid rgba(124, 107, 196, 0.3)' }
                        : { background: '#2d264d', color: '#f0ecff', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {m.content}
                    </div>
                  ))}
                </div>
              )}
              <textarea rows={2} value={desc} onChange={e => setDesc(e.target.value)}
                placeholder={chatHistory.length === 0 ? 'e.g. 2 scrambled eggs with toast' : 'Type your answer...'}
                className="w-full bg-[#161229] border border-[rgba(255,255,255,0.1)] rounded-2xl p-4 text-sm font-bold text-[#f0ecff] outline-none focus:border-[#7c6bc4] focus:ring-1 focus:ring-[#7c6bc4]/50 resize-none placeholder:text-[#4b4577]" />
              <button disabled={loading || !desc.trim()} onClick={handleAnalyze}
                className="w-full flex justify-center items-center gap-2 p-4 bg-gradient-to-r from-[#7c6bc4] to-[#a78bfa] text-white font-black text-sm rounded-2xl disabled:opacity-40 cursor-pointer active:scale-[0.98] transition-all"
                style={{ boxShadow: '0 4px 20px rgba(124,107,196,0.4)' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-[#e0d7ff]" />}
                {loading ? 'Analyzing...' : chatHistory.length > 0 ? 'Reply & Analyze' : 'Analyze with AI'}
              </button>
            </div>
          )}

          {/* Step 2 - preview */}
          {step === 2 && preview && (
            <div className="flex flex-col gap-3">
              <ConfidenceBadge score={preview.confidenceScore} />

              {preview._macroWarning && (
                <div className="flex gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">{preview._macroWarning}</p>
                </div>
              )}

              <div className="p-3 bg-[#0e0b1a]/60 border border-[rgba(255,255,255,0.08)] rounded-2xl">
                <p className="text-sm font-bold text-[#f0ecff]">{preview.description}</p>
                {preview.sourceNotes && <p className="text-xs text-[#6b6490] mt-1 italic">{preview.sourceNotes}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Calories', val: `${preview.calories} kcal`, color: '#7c6bc4' },
                  { label: 'Protein',  val: `${preview.protein}g`,      color: '#f87171' },
                  { label: 'Carbs',    val: `${preview.carbs}g`,        color: '#8b5cf6' },
                  { label: 'Fat',      val: `${preview.fat}g`,          color: '#f59e0b' },
                ].map(n => (
                  <div key={n.label} className="bg-[#0e0b1a]/60 border border-[rgba(255,255,255,0.08)] p-3 rounded-2xl">
                    <p className="text-[10px] uppercase tracking-widest text-[#6b6490] font-black">{n.label}</p>
                    <p className="text-lg font-black mt-1" style={{ color: n.color }}>{n.val}</p>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-[#0e0b1a]/60 border border-[rgba(255,255,255,0.08)] rounded-2xl space-y-1">
                <NRow label="Fiber"         value={preview.fiber}       color="#22c55e" />
                <NRow label="Sodium"        value={preview.sodium} unit="mg" color="#f59e0b" />
                <NRow label="Natural Sugar" value={preview.naturalSugar} color="#10b981" />
                <NRow label="Added Sugar"   value={preview.addedSugar}   color="#ef4444" />
              </div>

              {isMed && <p className="text-xs text-amber-400 font-medium text-center">! Medium confidence - please verify before saving.</p>}

              {!canSave ? (
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                    <p className="text-xs font-bold text-red-400">Cannot save - confidence too low. Add more detail.</p>
                  </div>
                  <button onClick={() => setStep(1)} className="w-full p-4 bg-[#0e0b1a] border border-[rgba(255,255,255,0.08)] text-[#a09abc] font-black rounded-2xl cursor-pointer">Try Again</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 p-3 bg-[#0e0b1a] border border-[rgba(255,255,255,0.08)] text-[#a09abc] font-black rounded-2xl cursor-pointer text-sm">Back</button>
                  <button onClick={() => setStep(3)} className="flex items-center justify-center gap-1 px-4 p-3 bg-[#0e0b1a] border border-[rgba(255,255,255,0.08)] text-[#a09abc] font-black rounded-2xl cursor-pointer text-sm">
                    <Edit3 size={13} /> Edit
                  </button>
                  <button disabled={loading} onClick={handleConfirm}
                    className="flex-[2] flex justify-center items-center gap-2 p-3 bg-gradient-to-r from-[#7c6bc4] to-[#a78bfa] text-white font-black rounded-2xl cursor-pointer text-sm disabled:opacity-50"
                    style={{ boxShadow: '0 4px 16px rgba(124,107,196,0.3)' }}>
                    {loading ? <Loader2 className="animate-spin" size={15} /> : <CheckCircle size={15} />}
                    Confirm & Save
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3 - edit */}
          {step === 3 && edited && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[#6b6490] font-medium">Changes are tracked as user-edited.</p>
              <input value={edited.description} onChange={e => setEdited(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-[#0e0b1a]/60 border border-[rgba(255,255,255,0.08)] rounded-xl p-3 text-sm font-bold text-[#f0ecff] outline-none" />
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['calories','Calories (kcal)',1], ['protein','Protein (g)',0.1],
                  ['carbs','Carbs (g)',0.1],        ['fat','Fat (g)',0.1],
                  ['fiber','Fiber (g)',0.1],         ['sodium','Sodium (mg)',1],
                  ['naturalSugar','Natural Sugar (g)',0.1], ['addedSugar','Added Sugar (g)',0.1],
                ].map(([key, label, step]) => (
                  <div key={key}>
                    <label className="text-[10px] text-[#6b6490] font-black uppercase tracking-wider">{label}</label>
                    <input type="number" step={step} min="0" value={edited[key] ?? 0}
                      onChange={e => setEdited(p => ({ ...p, [key]: Number(e.target.value) }))}
                      className="w-full mt-1 bg-[#0e0b1a]/60 border border-[rgba(255,255,255,0.08)] rounded-xl p-2.5 text-sm font-bold text-[#f0ecff] outline-none focus:border-[#00f3ff]" />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setStep(2)} className="flex-1 p-3 bg-[#0e0b1a] border border-[rgba(255,255,255,0.08)] text-[#a09abc] font-black rounded-2xl cursor-pointer text-sm">Back</button>
                <button disabled={loading} onClick={handleSaveEdited}
                  className="flex-[2] flex justify-center items-center gap-2 p-3 bg-gradient-to-r from-[#7c6bc4] to-[#a78bfa] text-white font-black rounded-2xl cursor-pointer text-sm disabled:opacity-50"
                  style={{ boxShadow: '0 4px 16px rgba(124,107,196,0.3)' }}>
                  {loading ? <Loader2 className="animate-spin" size={15} /> : <CheckCircle size={15} />}
                  Save Edited Values
                </button>
              </div>
            </div>
          )}

        </GlassModal>
      )}
    </AnimatePresence>
  );
};

// --- Activity Log Modal ------------------------------------------------------
export const ActivityLogModal = ({ isOpen, onClose, selectedDate = null }) => {
  const [step, setStep] = useState(1);
  const [desc, setDesc] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addActivityLog } = useSynapzeStore();

  const handleAnalyze = async () => {
    if (!desc.trim()) return;
    setLoading(true);
    const history = [...chatHistory, { role: 'user', content: desc }];
    setChatHistory(history);
    setDesc('');
    const clarify = await clarifyActivityQuery(history);
    if (clarify.success && clarify.data.status === 'clarification_needed') {
      setChatHistory([...history, { role: 'ai', content: clarify.data.question }]);
      setLoading(false);
      return;
    }
    const full = history.map(m => m.content).join('. ');
    const res  = await logActivityWithAI(full, selectedDate);
    if (res.success) { setResult(res.data); setStep(2); }
    else alert('AI failed: ' + res.error);
    setLoading(false);
  };

  const handleSave = () => { addActivityLog(result); setStep(1); setDesc(''); setChatHistory([]); setResult(null); onClose(); };
  const reset = () => { setStep(1); setDesc(''); setChatHistory([]); setResult(null); };

  return (
    <AnimatePresence>
      {isOpen && (
        <GlassModal isOpen={isOpen} onClose={() => { reset(); onClose(); }} title={step === 1 ? 'Log Activity' : 'Burn Estimate'}>
          {step === 1 ? (
            <div className="flex flex-col gap-4">
              {chatHistory.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {chatHistory.map((m, i) => (
                    <div key={i} className={`p-3 rounded-2xl text-sm font-medium ${m.role === 'user' ? 'bg-[#8b5cf6]/10 text-[#00f3ff] ml-auto w-[85%] rounded-br-sm' : 'bg-[#0e0b1a] text-[#f0ecff] mr-auto w-[85%] rounded-bl-sm'}`}>{m.content}</div>
                  ))}
                </div>
              )}
              <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)}
                placeholder={chatHistory.length === 0 ? 'e.g. Ran 5km at moderate pace for 30 minutes' : 'Type your answer...'}
                className="w-full bg-[#0e0b1a]/60 border border-[rgba(255,255,255,0.08)] rounded-2xl p-4 text-sm font-bold text-[#f0ecff] outline-none focus:border-[#8b5cf6] resize-none placeholder:text-[#3d3860]" />
              <button disabled={loading || !desc.trim()} onClick={handleAnalyze}
                className="w-full flex justify-center items-center gap-2 p-4 bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white font-black text-sm rounded-2xl disabled:opacity-50 cursor-pointer"
                style={{ boxShadow: '0 4px 16px rgba(167,139,250,0.3)' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <TrendingUp size={20} />}
                {loading ? 'Calculating...' : chatHistory.length > 0 ? 'Reply & Calculate' : 'Calculate Burn'}
              </button>
            </div>
          ) : result && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center py-8 bg-[#0e0b1a]/60 border border-[rgba(255,255,255,0.08)] rounded-[32px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#6b6490] mb-1">{result.name} - {result.duration} min</p>
                <h3 className="text-7xl font-black" style={{ color: 'var(--accent)', filter: 'drop-shadow(0 0 20px rgba(124,107,196,0.3))' }}>{result.caloriesBurned}</h3>
                <span className="text-sm font-bold uppercase tracking-widest mt-1" style={{ color: 'var(--text-faint)' }}>kcal burned</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 p-4 bg-[#0e0b1a] border border-[rgba(255,255,255,0.08)] text-[#a09abc] font-black rounded-2xl cursor-pointer">Back</button>
                <button onClick={handleSave} className="flex-[2] p-4 bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white font-black rounded-2xl cursor-pointer"
                  style={{ boxShadow: '0 4px 16px rgba(167,139,250,0.3)' }}>Save Activity</button>
              </div>
            </div>
          )}
        </GlassModal>
      )}
    </AnimatePresence>
  );
};
