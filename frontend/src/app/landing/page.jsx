'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Brain, Camera, Activity, Zap, 
  ChevronRight, ArrowRight, Play, 
  Check, Sparkles, TrendingUp, Shield
} from 'lucide-react'

// --- Three.js Component (Dynamic Import for Client-side only) ---
const NeuralOrb = dynamic(() => import('@/components/landing/NeuralOrb'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#030304]" />
})

export default function LandingPage() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="min-h-screen bg-[#030304]" />

  return (
    <div className="bg-[#030304] text-white selection:bg-cyan-500/30 selection:text-white font-sans overflow-x-hidden min-h-screen">
      {/* Global CSS Fallback */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        .font-heading {
          font-family: 'Instrument Serif', serif;
          font-style: italic;
        }

        .text-gradient-cyan {
          background: linear-gradient(135deg, #00f3ff 0%, #06b6d4 50%, #22d3ee 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .liquid-glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .btn-cyan {
          background: linear-gradient(135deg, #00f3ff 0%, #0891b2 100%);
          color: #030304;
          box-shadow: 0 0 30px rgba(0, 243, 255, 0.3);
        }

        .grain-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          pointer-events: none;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      ` }} />

      <div className="grain-overlay" />

      {/* --- Navigation --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.2)]">
            <Brain className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Synapze</span>
        </div>

        <div className="hidden md:flex items-center gap-1 p-1 rounded-full liquid-glass">
          {['Features', 'Intelligence', 'Pricing', 'Docs'].map(item => (
            <button key={item} className="px-5 py-2 text-xs font-bold text-white/40 hover:text-white transition-colors uppercase tracking-widest">{item}</button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth" className="hidden sm:block text-xs font-bold text-white/50 hover:text-white transition-colors uppercase tracking-widest">Sign In</Link>
          <Link href="/auth" className="btn-cyan px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-transform hover:scale-105 active:scale-95">Get Started</Link>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-500/10 rounded-full blur-[160px]" />
          <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-[140px]" />
        </div>

        {/* 3D Visual */}
        <NeuralOrb />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-6xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Neural Intelligence v4.0</span>
          </div>

          <h1 className="text-6xl sm:text-8xl md:text-[9rem] font-heading leading-[0.85] tracking-tighter mb-8">
            <span className="block text-white">Decode.</span>
            <span className="block text-gradient-cyan" style={{ filter: 'drop-shadow(0 0 30px rgba(0,243,255,0.3))' }}>Optimise.</span>
            <span className="block text-white">Dominate.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12 font-light tracking-wide">
            The neural operating system for your biological self. Track nutrition, habits, and health with the world&apos;s fastest AI engine.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/auth" className="btn-cyan px-10 py-5 rounded-2xl text-lg font-black uppercase tracking-widest flex items-center gap-3">
              Get Started Free <ArrowRight size={20} strokeWidth={3} />
            </Link>
            <button className="px-10 py-5 rounded-2xl border border-white/10 hover:border-white/30 transition-all text-white/60 hover:text-white font-bold flex items-center gap-2 group">
              Watch Intelligence <Play size={18} className="fill-white/60 group-hover:fill-white" />
            </button>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative z-10 mt-24 w-full max-w-5xl mx-auto"
        >
          <div className="absolute -inset-8 bg-cyan-500/10 rounded-[40px] blur-[60px] pointer-events-none" />
          <div className="liquid-glass rounded-[40px] p-2 animate-float">
            <div className="bg-[#08080f] rounded-[32px] overflow-hidden border border-white/10 aspect-[16/9] relative group">
              <img 
                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=2070" 
                alt="Dashboard Preview" 
                className="w-full h-full object-cover opacity-40 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-transparent to-transparent" />
              
              <div className="absolute bottom-12 left-12 right-12 flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                      <Zap size={24} className="text-black" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-white">92% Optimal</p>
                      <p className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Neural Score Peak</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- Feature Grid --- */}
      <section className="py-32 px-6 relative z-10 bg-[#030304]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-heading italic mb-6">Built for the <span className="text-gradient-cyan">1%.</span></h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">High-performance tools for humans who refuse to settle for average health.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Camera className="text-cyan-400" />}
              title="Vision Logging"
              desc="Identify any meal in 1.2 seconds. Macros, calories, and density processed via Gemini Vision."
            />
            <FeatureCard 
              icon={<Brain className="text-violet-400" />}
              title="Neural Intelligence"
              desc="A single live metric of your existence. Analyzes everything to provide real-time coaching."
            />
            <FeatureCard 
              icon={<Activity className="text-emerald-400" />}
              title="Unbreakable Habits"
              desc="Build identity-based habits with momentum tracking that scales with your ambition."
            />
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-20 px-6 border-t border-white/5 relative z-10 bg-[#030304]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center">
              <Brain size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Synapze</span>
          </div>
          <div className="flex gap-10 text-white/30 text-xs font-bold uppercase tracking-[0.2em]">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
          </div>
          <p className="text-white/20 text-[10px] uppercase tracking-widest font-black">© 2024 Arsh Pratap. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="p-10 rounded-[32px] bg-white/[0.02] border border-white/5 transition-all duration-500 group cursor-default hover:border-cyan-500/30"
    >
      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-white/50 leading-relaxed text-sm">{desc}</p>
      
      <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
        Learn more <ChevronRight size={12} />
      </div>
    </motion.div>
  )
}
