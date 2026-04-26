'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { saveOnboardingProfile, suggestFoodPreferences } from '@/app/actions';
import { ArrowLeft, ArrowRight, Sparkles, Check } from 'lucide-react';

const STEPS = [
  { id: 'basics',   title: 'Your Body',      desc: 'We calculate your exact calorie needs from this.' },
  { id: 'activity', title: 'Your Lifestyle',  desc: 'How active are you on a typical week?' },
  { id: 'goal',     title: 'Your Goal',       desc: 'What do you want to achieve with Synapze?' },
  { id: 'diet',     title: 'Dietary Choice',  desc: 'Any specific dietary preferences?' },
  { id: 'prefs',    title: 'Food Favorites',  desc: 'Tell us what you like for each meal' },
];

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary',  desc: 'Desk job, minimal movement', icon: '🪑' },
  { value: 'light',     label: 'Light',       desc: '1-3 workouts per week', icon: '🚶' },
  { value: 'moderate',  label: 'Moderate',    desc: '3-5 workouts per week', icon: '🏃' },
  { value: 'active',    label: 'Active',      desc: '6-7 workouts per week', icon: '💪' },
  { value: 'athlete',   label: 'Athlete',     desc: 'Training twice a day', icon: '🏋️' },
];

const GOAL_OPTIONS = [
  { value: 'Weight Loss',  icon: '🔥', desc: '-500 kcal/day deficit · ~0.5kg/week' },
  { value: 'Maintenance',  icon: '⚖️', desc: 'Maintain current weight' },
  { value: 'Muscle Gain',  icon: '💪', desc: '+300 kcal/day surplus · lean bulk' },
];

const DIET_OPTIONS = [
  { value: 'Vegetarian', icon: '🥗', desc: 'Plant-based & dairy' },
  { value: 'Non-Vegetarian', icon: '🥩', desc: 'Meat, fish & poultry' },
  { value: 'Eggitarian', icon: '🥚', desc: 'Vegetarian + eggs' },
  { value: 'Vegan', icon: '🌱', desc: 'Strictly plant-based' },
  { value: 'No Preference', icon: '🍽️', desc: 'I eat everything' },
];

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'General'];

const QUICK_SUGGESTIONS = {
  Breakfast: ['Oats', 'Eggs', 'Smoothie', 'Idli', 'Poha', 'Paratha', 'Upma', 'Dosa', 'Toast', 'Fruits'],
  Lunch: ['Rice', 'Roti', 'Dal', 'Chicken', 'Salad', 'Paneer', 'Fish'],
  Snacks: ['Nuts', 'Yogurt', 'Protein Bar', 'Fruit', 'Makhana'],
  Dinner: ['Soup', 'Salad', 'Grilled Chicken', 'Quinoa', 'Veggies'],
  General: ['Coffee', 'Tea', 'Dark Chocolate', 'Milk'],
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({
    weight: '', height: '', age: '', gender: 'male',
    activityLevel: 'moderate', goal: 'Maintenance',
    dietType: 'No Preference',
    foodPrefs: { Breakfast: [], Lunch: [], Snacks: [], Dinner: [], General: [] }
  });

  const [activeTab, setActiveTab] = useState('Breakfast');
  const [customFood, setCustomFood] = useState('');
  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleFoodItem = (meal, item) => {
    setForm(p => {
      const list = p.foodPrefs[meal] || [];
      const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
      return { ...p, foodPrefs: { ...p.foodPrefs, [meal]: newList } };
    });
  };

  const addCustomFood = () => {
    if (!customFood.trim()) return;
    toggleFoodItem(activeTab, customFood.trim());
    setCustomFood('');
  };

  const handleAiSuggest = async () => {
    setAiLoading(true);
    try {
      const res = await suggestFoodPreferences({ goal: form.goal, dietType: form.dietType });
      if (res.success && res.data) setForm(p => ({ ...p, foodPrefs: res.data }));
    } catch(e) { console.error("AI Error:", e); }
    setAiLoading(false);
  };

  const handleFinish = async () => {
    if (!form.weight || !form.height || !form.age) {
      alert('Please fill in all body measurements.'); setStep(0); return;
    }
    setLoading(true);
    const res = await saveOnboardingProfile(form);
    if (res.success) router.push('/dashboard');
    else { alert('Failed to save: ' + res.error); setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: 'var(--bg-primary)' }}>
      <div className="bg-mesh" />
      <div className="w-full max-w-md pb-20 relative z-10">

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8 mt-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className={`h-1.5 rounded-full transition-all duration-500 ${
              i === step ? 'w-10' : i < step ? 'w-5' : 'w-4'
            }`} style={{
              background: i === step ? 'var(--accent)' : i < step ? 'var(--accent-soft)' : 'var(--border)'
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="glass-card !p-6 sm:!p-8 !rounded-[28px]">

            <h2 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{STEPS[step].title}</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{STEPS[step].desc}</p>

            {/* Step 0: Body basics */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {['male', 'female'].map(g => (
                    <button key={g} onClick={() => update('gender', g)}
                      className="p-3.5 rounded-2xl border-2 font-bold capitalize cursor-pointer transition-all text-sm"
                      style={{
                        borderColor: form.gender === g ? 'var(--accent)' : 'var(--border)',
                        background: form.gender === g ? 'var(--accent-bg)' : 'transparent',
                        color: form.gender === g ? 'var(--accent)' : 'var(--text-secondary)'
                      }}>
                      {g === 'male' ? '👨 Male' : '👩 Female'}
                    </button>
                  ))}
                </div>
                {[
                  { key: 'age',    label: 'Age',    placeholder: '25',  unit: 'years' },
                  { key: 'weight', label: 'Weight', placeholder: '70',  unit: 'kg' },
                  { key: 'height', label: 'Height', placeholder: '175', unit: 'cm' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                    <div className="flex items-center mt-1 rounded-2xl px-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}>
                      <input type="number" value={form[f.key]} onChange={e => update(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="flex-1 py-3 bg-transparent font-bold outline-none text-sm" style={{ color: 'var(--text-primary)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{f.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Activity */}
            {step === 1 && (
              <div className="space-y-2">
                {ACTIVITY_OPTIONS.map(a => (
                  <button key={a.value} onClick={() => update('activityLevel', a.value)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer text-left transition-all"
                    style={{
                      borderColor: form.activityLevel === a.value ? 'var(--accent)' : 'var(--border)',
                      background: form.activityLevel === a.value ? 'var(--accent-bg)' : 'transparent'
                    }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{a.icon}</span>
                      <div>
                        <p className="font-bold text-sm" style={{ color: form.activityLevel === a.value ? 'var(--accent)' : 'var(--text-primary)' }}>{a.label}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
                      </div>
                    </div>
                    {form.activityLevel === a.value && <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}><Check size={12} className="text-white" /></div>}
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Goal */}
            {step === 2 && (
              <div className="space-y-3">
                {GOAL_OPTIONS.map(g => (
                  <button key={g.value} onClick={() => update('goal', g.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer text-left transition-all"
                    style={{
                      borderColor: form.goal === g.value ? 'var(--accent)' : 'var(--border)',
                      background: form.goal === g.value ? 'var(--accent-bg)' : 'transparent'
                    }}>
                    <span className="text-3xl">{g.icon}</span>
                    <div className="flex-1">
                      <p className="font-black text-sm" style={{ color: form.goal === g.value ? 'var(--accent)' : 'var(--text-primary)' }}>{g.value}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{g.desc}</p>
                    </div>
                    {form.goal === g.value && <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}><Check size={12} className="text-white" /></div>}
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Diet */}
            {step === 3 && (
              <div className="space-y-2.5">
                {DIET_OPTIONS.map(d => (
                  <button key={d.value} onClick={() => update('dietType', d.value)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer text-left transition-all"
                    style={{
                      borderColor: form.dietType === d.value ? 'var(--accent)' : 'var(--border)',
                      background: form.dietType === d.value ? 'var(--accent-bg)' : 'transparent'
                    }}>
                    <span className="text-2xl">{d.icon}</span>
                    <div className="flex-1">
                      <p className="font-black text-sm" style={{ color: form.dietType === d.value ? 'var(--accent)' : 'var(--text-primary)' }}>{d.value}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.desc}</p>
                    </div>
                    {form.dietType === d.value && <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}><Check size={12} className="text-white" /></div>}
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Food Preferences */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {MEAL_TYPES.map(meal => (
                    <button key={meal} onClick={() => setActiveTab(meal)}
                      className="px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer"
                      style={{
                        background: activeTab === meal ? 'var(--accent)' : 'var(--accent-bg)',
                        color: activeTab === meal ? 'white' : 'var(--text-secondary)'
                      }}>
                      {meal}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input type="text" value={customFood} onChange={e => setCustomFood(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomFood()}
                    placeholder={`Add to ${activeTab}...`}
                    className="input-field flex-1" />
                  <button onClick={addCustomFood}
                    className="px-5 font-bold rounded-xl text-sm cursor-pointer"
                    style={{ background: 'var(--accent)', color: 'white' }}>
                    Add
                  </button>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Quick Suggestions</p>
                    <button onClick={handleAiSuggest} disabled={aiLoading}
                      className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                      style={{ color: 'var(--accent)', background: 'var(--accent-bg)' }}>
                      <Sparkles size={10} />
                      {aiLoading ? 'Generating...' : 'AI Fill For Me'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SUGGESTIONS[activeTab].map(item => {
                      const selected = form.foodPrefs[activeTab]?.includes(item);
                      return (
                        <button key={item} onClick={() => toggleFoodItem(activeTab, item)}
                          className="px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                          style={{
                            borderColor: selected ? 'var(--accent)' : 'var(--border)',
                            background: selected ? 'var(--accent-bg)' : 'var(--surface)',
                            color: selected ? 'var(--accent)' : 'var(--text-secondary)'
                          }}>
                          {selected ? '✓ ' : '+ '}{item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 rounded-2xl min-h-[80px]" style={{ background: 'var(--accent-bg)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Selected ({form.foodPrefs[activeTab]?.length || 0})</p>
                  <div className="flex flex-wrap gap-2">
                    {form.foodPrefs[activeTab]?.length > 0 ? (
                      form.foodPrefs[activeTab].map(item => (
                        <span key={item} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                          {item}
                          <button onClick={() => toggleFoodItem(activeTab, item)} className="ml-1 cursor-pointer" style={{ color: 'var(--text-muted)' }}>×</button>
                        </span>
                      ))
                    ) : (
                      <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>No preferences added yet for {activeTab}.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  className="flex-1 p-4 font-bold rounded-2xl cursor-pointer text-sm flex items-center justify-center gap-2 transition-all btn-secondary">
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)}
                  className="flex-[2] p-4 text-white font-bold rounded-2xl cursor-pointer text-sm flex items-center justify-center gap-2 btn-primary">
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={handleFinish} disabled={loading}
                  className="flex-[2] p-4 text-white font-bold rounded-2xl cursor-pointer text-sm disabled:opacity-50 flex items-center justify-center gap-2 btn-primary">
                  {loading ? 'Saving...' : 'Finalize Profile'} <Sparkles size={16} />
                </button>
              )}
            </div>

          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          Uses Mifflin-St Jeor formula · Your data stays private
        </p>
      </div>
    </div>
  );
}
