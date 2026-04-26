'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Save, ChevronLeft, Loader2, Trash2,
  Sparkles, BookOpen, Volume2, Clock
} from 'lucide-react';
import { saveJournalEntry, getJournalEntries, deleteJournalEntry } from '@/app/actions';
import { useTheme } from '@/lib/ThemeContext';

const MOODS = [
  { value: 'amazing',  emoji: '\uD83D\uDD25', label: 'Amazing',  color: '#f97316' },
  { value: 'great',    emoji: '\uD83D\uDE04', label: 'Great',    color: '#22c55e' },
  { value: 'good',     emoji: '\uD83D\uDE42', label: 'Good',     color: '#00f3ff' },
  { value: 'neutral',  emoji: '\uD83D\uDE10', label: 'Neutral',  color: '#94a3b8' },
  { value: 'stressed', emoji: '\uD83D\uDE24', label: 'Stressed', color: '#f59e0b' },
  { value: 'tired',    emoji: '\uD83D\uDE34', label: 'Tired',    color: '#60a5fa' },
  { value: 'low',      emoji: '\uD83D\uDE14', label: 'Low',      color: '#f87171' },
];

function formatDayHeading(d) {
  const date = new Date(d);
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export function JournalTab() {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('good');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { dark } = useTheme();

  const textareaRef = useRef(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const res = await getJournalEntries();
    if (res.success) setEntries(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleSave = async () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    const res = await saveJournalEntry({
      content: content.trim(),
      mood: selectedMood,
      date: new Date().toISOString()
    });
    if (res.success) {
      setSaved(true);
      setContent('');
      setTimeout(() => setSaved(false), 2000);
      fetchEntries();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    const res = await deleteJournalEntry(id);
    if (res.success) fetchEntries();
  };

  const toggleRecording = () => {
    if (!isRecording) {
      // Mock Speech Recognition
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setContent(prev => prev + (prev ? ' ' : '') + "I'm feeling much more focused today after a long walk. The weather was perfect and I managed to clear my head.");
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  const dayGroups = useMemo(() => {
    const groups = {};
    entries.forEach(entry => {
      const d = new Date(entry.entryDate || entry.createdAt).toDateString();
      if (!groups[d]) groups[d] = [];
      groups[d].push(entry);
    });
    return Object.keys(groups).map(d => ({ date: d, items: groups[d] }));
  }, [entries]);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  
  const card = 'var(--surface)';
  const border = 'var(--border)';
  const textPri = 'var(--text-primary)';
  const textMut = 'var(--text-muted)';

  return (
    <div className="w-full pb-8">

      {/* --- Header --- */}
      <div className="backdrop-blur-xl border-b rounded-t-[24px] mb-4"
        style={{ background: 'var(--nav-bg)', borderColor: border }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black" style={{ color: textPri }}>Mind Vault</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: textMut }}>
              {entries.length} entries - Your private space
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-5">

        {/* --- Write Panel --- */}
        <motion.div layout className="rounded-[24px] overflow-hidden"
          style={{ background: card, border: `1px solid ${border}`, boxShadow: dark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 4px 24px rgba(124,107,196,0.1)' }}>

          {/* Mood Selector */}
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: border }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: textMut }}>How&apos;s your mood?</span>
            <div className="flex gap-1.5">
              {MOODS.map(m => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(m.value)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 border-none cursor-pointer"
                  style={{ 
                    background: selectedMood === m.value ? m.color + '20' : 'transparent',
                    opacity: selectedMood === m.value ? 1 : 0.4,
                    transform: selectedMood === m.value ? 'scale(1.2)' : 'scale(1)'
                  }}
                  title={m.label}
                >
                  <span className="text-lg">{m.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write anything - your mood, your day, your thoughts..."
              rows={6}
              className="w-full bg-transparent text-sm outline-none resize-none leading-[1.9]"
              style={{ color: textPri, caretColor: 'var(--accent)' }}
            />
          </div>

          {/* Word count */}
          <div className="px-5 pb-2 flex items-center gap-1">
            <Clock size={11} style={{ color: textMut }} />
            <span className="text-[10px]" style={{ color: textMut }}>
              {words > 0 ? `${words} words` : 'Start typing...'}
            </span>
          </div>

          {/* Recording waveform */}
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 py-3 bg-red-500/5 flex items-center gap-3 overflow-hidden"
              >
                <div className="flex gap-0.5 items-end h-3">
                  {[...Array(12)].map((_, i) => (
                    <motion.div key={i} className="w-0.5 bg-red-400" 
                      animate={{ height: [4, 12, 6, 10, 4] }}
                      transition={{ duration: 0.5, delay: i*0.1, repeat: Infinity }} />
                  ))}
                </div>
                <span className="text-xs font-bold text-red-400">Listening... speak naturally</span>
                <Volume2 size={13} className="text-red-400 ml-auto animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Bar */}
          <div className="px-5 py-4 flex items-center justify-between border-t" style={{ borderColor: border }}>
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border-none cursor-pointer ${isRecording ? 'bg-red-500 text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              style={{ color: isRecording ? 'white' : textMut }}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              {isRecording ? 'Stop' : 'Voice'}
            </button>

            <button
              disabled={saving || !content.trim()}
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-[#7c6bc4] to-[#a78bfa] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 border-none cursor-pointer"
              style={{ boxShadow: '0 4px 12px rgba(124,107,196,0.3)' }}
            >
              <AnimatePresence mode="wait">
                {saving ? (
                  <motion.span key="ld" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 size={14} className="animate-spin" />
                  </motion.span>
                ) : saved ? (
                  <motion.span key="ok" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    Check Saved
                  </motion.span>
                ) : (
                  <motion.span key="sv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Save size={14} /> Save Entry
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </motion.div>

        {/* --- Day-grouped Past Entries --- */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={13} style={{ color: textMut }} />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: textMut }}>Recent Thoughts</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
          ) : dayGroups.length === 0 ? (
            <div className="flex flex-col items-center py-14 rounded-[24px] text-center"
              style={{ background: card, border: `1px solid ${border}` }}>
              <div className="text-5xl mb-3">Journal</div>
              <p className="font-bold text-sm mb-1" style={{ color: textPri }}>Your vault is empty</p>
              <p className="text-xs" style={{ color: textMut }}>Write your first entry above</p>
            </div>
          ) : (
            <div className="space-y-8">
              {dayGroups.map(group => (
                <div key={group.date} className="space-y-3">
                  <h3 className="text-xs font-bold pl-1" style={{ color: textMut }}>{formatDayHeading(group.date)}</h3>
                  <div className="space-y-3">
                    {group.items.map(entry => {
                      const moodObj = MOODS.find(m => m.value === entry.mood) || MOODS[2];
                      return (
                        <motion.div
                          key={entry.id}
                          layout
                          className="group p-5 rounded-[24px] relative"
                          style={{ background: card, border: `1px solid ${border}` }}
                        >
                          <div className="flex gap-4">
                            <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-xl" 
                              style={{ background: moodObj.color + '10' }}>
                              {moodObj.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: moodObj.color }}>{moodObj.label}</span>
                                <span className="text-[10px] font-medium" style={{ color: textMut }}>
                                  {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textPri }}>
                                {entry.content}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 border-none cursor-pointer"
                            style={{ color: textMut }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
