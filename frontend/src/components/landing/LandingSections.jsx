'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const FV = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export function StatsSection() {
  return (
    <section id="stats" className="relative z-10 py-20 px-6">
      <div className="section-divider mb-20"></div>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { val: '10K+', label: 'Active Users' },
          { val: '1.8s', label: 'Avg Log Time' },
          { val: '98%', label: 'AI Accuracy' },
          { val: '4.9★', label: 'User Rating' }
        ].map((s, i) => (
          <motion.div 
            key={i} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={FV}
            className="stat-card"
          >
            <p className="text-4xl md:text-5xl font-black text-gradient-cyan mb-2">{s.val}</p>
            <p className="text-sm text-white/30 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function NeuralScoreSection() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0
      const interval = setInterval(() => {
        current += 1
        if (current >= 92) {
          setCount(92)
          clearInterval(interval)
        } else {
          setCount(current)
        }
      }, 20)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section id="neural-score" className="relative z-10 py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="bg-orb w-[700px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ background: 'radial-gradient(circle, rgba(0,243,255,0.05) 0%, transparent 60%)' }}></div>
        <div className="bg-orb w-[400px] h-[400px] top-0 right-0" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)' }}></div>
      </div>

      <div className="relative max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FV} className="text-left">
            <div className="badge mb-8">AI-Powered Insight</div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading italic mb-8">
              One score to<br/>
              <span className="text-gradient-cyan">rule your day.</span>
            </h2>
            <p className="text-white/35 text-lg leading-relaxed mb-8">
              The Neural Score distills your habits, nutrition, activity, and mood into a single, powerful number — updated every night by AI. Think of it as your body's credit score.
            </p>
              {['Blends nutrition, exercise, habits, and sleep into one metric', 'Gamified progression &mdash; compete with yourself', 'AI coaching insights explain exactly what to improve'].map((t, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/10 flex items-center justify-center mt-0.5 shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-white/40 text-sm">{t}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FV} className="flex flex-col items-center">
              <div className="relative w-64 h-64 md:w-72 md:h-72">
                <svg viewBox="0 0 200 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 20px rgba(0,243,255,0.2))' }}>
                  <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                  <motion.circle 
                    cx="100" cy="100" r="85" fill="none" stroke="url(#gaugeGrad)" strokeWidth="6" strokeLinecap="round" strokeDasharray="534" 
                    initial={{ strokeDashoffset: 534 }}
                    whileInView={{ strokeDashoffset: 534 - (92/100)*534 }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                    transform="rotate(-90 100 100)"
                  />
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f3ff"/><stop offset="100%" stopColor="#8b5cf6"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-7xl font-black text-white tabular-nums">92</span>
                  <span className="text-[10px] text-cyan-400/50 font-bold tracking-[0.3em] uppercase mt-2">Neural Score</span>
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-8">
                {[{c: 'bg-cyan-400', l: 'Body', v: '88%'}, {c: 'bg-violet-400', l: 'Mind', v: '82%'}, {c: 'bg-amber-400', l: 'Energy', v: '79%'}].map((p, i) => (
                  <div key={i} className="liquid-glass px-4 py-2 flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${p.c}`}></div>
                    <span className="text-white/40">{p.l}</span>
                    <span className="font-bold text-white">{p.v}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

export function AILoggingSection() {
  return (
    <section id="how-it-works" className="relative z-10 py-32 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FV} className="mb-20">
          <div className="badge mb-6">AI Food Scanner</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading italic mb-6 text-white">Speak. Snap.<br/><span className="text-gradient-cyan">Logged.</span></h2>
          <p className="text-white/35 text-lg max-w-2xl mx-auto leading-relaxed">Food tracking that respects your time. Describe a meal in plain words &mdash; or snap a photo. Our AI extracts exact macros instantly.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-start text-left">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FV}>
            <div className="liquid-glass-strong rounded-2xl p-8">
              <p className="text-[10px] text-white/25 font-bold tracking-[0.2em] uppercase mb-4">Input</p>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 animate-pulse"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg></div>
                <div><p className="text-white/60 text-sm italic">&quot;2 scrambled eggs, a roti, and dal with rice&quot;</p></div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"><div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg></div><div><p className="text-white/60 text-sm">Or snap a photo of your meal</p></div></div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FV}>
            <div className="liquid-glass-strong rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6"><p className="text-[10px] text-white/25 font-bold tracking-[0.2em] uppercase">AI Result</p><span className="text-[10px] text-cyan-400 font-bold tracking-wider bg-cyan-500/10 px-3 py-1 rounded-full">✓ 1.8s</span></div>
              <div className="grid grid-cols-2 gap-3 mb-6 text-center">
                {[{v: '487', l: 'Calories'}, {v: '24g', l: 'Protein', c: 'text-cyan-400'}, {v: '58g', l: 'Carbs', c: 'text-violet-400'}, {v: '16g', l: 'Fat', c: 'text-amber-400'}].map((n, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"><p className={`text-3xl font-black ${n.c || 'text-white'}`}>{n.v}</p><p className="text-[9px] text-white/25 font-bold tracking-[0.2em] uppercase mt-1">{n.l}</p></div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] text-white/25 font-bold tracking-[0.15em] uppercase mb-3">Sugar Intelligence™</p>
                <div className="flex justify-between text-xs mb-2"><span className="text-cyan-400 font-semibold">🌿 Natural <span className="font-black">8g</span></span><span className="text-amber-400 font-semibold">⚡ Added <span className="font-black">2g</span></span></div>
                <div className="sugar-bar"><div className="sugar-natural" style={{width: '80%'}}></div><div className="sugar-added" style={{width: '20%'}}></div></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export function ExplodedUISection() {
  const layers = [
    { label: 'Neural Score', color: '#00f3ff' },
    { label: 'Food Log', color: '#8b5cf6' },
    { label: 'Habit Engine', color: '#a78bfa' },
    { label: 'Macro Analytics', color: '#06b6d4' },
    { label: 'AI Coach', color: '#f59e0b' },
  ]

  return (
    <section id="exploded-ui" className="relative z-10 py-32 px-6 overflow-hidden">
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FV}>
          <div className="badge mb-6">Architecture</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading italic mb-6 text-white">One dashboard.<br/><span className="text-gradient-violet">Five layers deep.</span></h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto mb-16">Under the surface, Synapze fuses five intelligent modules into a seamless Human OS.</p>
        </motion.div>

        <div className="relative w-full max-w-lg mx-auto" style={{ height: '400px', perspective: '1200px' }}>
          {layers.map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100, rotateX: 45 }}
              whileInView={{ opacity: 1, y: i * 40, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="exploded-card absolute inset-x-0 mx-auto w-full text-left bg-[#08080f]"
              style={{ zIndex: layers.length - i, borderLeft: `3px solid ${layer.color}` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: layer.color }}></div>
                  <span className="text-sm font-bold text-white">{layer.label}</span>
                </div>
                <span className="text-xs text-white/20 font-mono">Layer {String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${85 - i * 8}%`, background: layer.color, opacity: 0.6 }}></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function FeaturesSection() {
  const features = [
    { title: 'AI Food Vision', desc: 'Snap a photo. Our neural network identifies ingredients, portion sizes, and full macro split in under 2 seconds.' },
    { title: 'Neural Score', desc: 'One number that summarizes your entire health context. Balanced across nutrition, habits, and recovery.' },
    { title: 'Habit Engine', desc: 'Build consistency with streaks and AI-powered reminders that actually work with your schedule.' },
    { title: 'Deep Analytics', desc: 'See the patterns behind your performance with high-fidelity charts and macro-trend analysis.' },
  ]

  return (
    <section id="features" className="relative z-10 py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FV} className="text-center mb-20">
          <div className="badge mb-6">Features</div>
          <h2 className="text-5xl md:text-6xl text-white mb-6">Designed for <span className="text-gradient-cyan">Maximum Human Output.</span></h2>
          <p className="text-lg text-white/30 max-w-2xl mx-auto">Synapze replaces 5 apps with one cohesive operating system for your body.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          {features.map((f, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FV} className="feature-card">
              <h3 className="text-2xl text-white mb-4">{f.title}</h3>
              <p className="text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 py-28 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={FV} className="pricing-card bg-[#08080f] text-center">
          <div className="badge mb-8">Pricing</div>
          <h2 className="text-6xl text-white mb-4 italic">Free Forever.</h2>
          <p className="text-lg text-white/30 mb-10">We believe health optimization should be accessible to every human. No credit card, no trials.</p>
          <div className="space-y-4 mb-10 text-left max-w-md mx-auto">
            {['Unlimited AI Food Vision', 'Full Neural Score Access', 'Global Habit Tracking', 'Smart Macro Analytics'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-white/60">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {f}
              </div>
            ))}
          </div>
          <a href="/auth" className="btn-cyan w-full justify-center">Start Your Journey<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
        </motion.div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="relative z-10 py-20 px-6 border-t border-white/5 bg-[#030304]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <span className="font-heading text-2xl text-white italic">Synapze</span>
        <div className="flex gap-10 text-sm text-white/30">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
        </div>
        <p className="text-xs text-white/10 uppercase tracking-widest font-bold">© 2026 Neural OS Corp</p>
      </div>
    </footer>
  )
}
