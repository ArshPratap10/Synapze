'use client'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const ThreeDScene = dynamic(
  () => import('@/components/ui/ThreeDScene'),
  { ssr: false }
)

export default function NeuralScoreParticles({ 
  score = 0, 
  bodyPct: propBody, 
  mindPct: propMind, 
  energyPct: propEnergy 
}) {
  // Use provided props if they exist, otherwise fallback to the dynamic derivation from 'score'
  const baseScore = score > 0 ? score : 75
  const body = propBody ?? Math.round(30 + (baseScore % 10)) 
  const mind = propMind ?? Math.round(40 - (baseScore % 5))
  const energy = propEnergy ?? (100 - body - mind)

  const circ = 2 * Math.PI * 156 // ~980.17
  const bodyLen = (body / 100) * circ
  const mindLen = (mind / 100) * circ
  const energyLen = (energy / 100) * circ

  return (
    <div className="relative w-full h-[340px] flex items-center justify-center select-none overflow-hidden">
      
      {/* 3D Neural Orb Background */}
      <div className="absolute inset-0 w-full h-full max-w-[400px] max-h-[400px] m-auto mix-blend-screen opacity-90">
        <ThreeDScene />
      </div>

      {/* Central Score Display */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <span className="text-[10px] font-black tracking-[0.4em] text-[#a78bfa]/40 mb-1">SCORE</span>
          <div className="relative">
            <span className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(167,139,250,0.4)]">
              {score || 75}
            </span>
            <div className="absolute -inset-4 rounded-full blur-2xl bg-[#a78bfa]/10 -z-10" />
          </div>
        </motion.div>
      </div>

      {/* Floating Pills Overlay */}
      <div className="absolute inset-0 w-full h-full max-w-[400px] m-auto pointer-events-none">
        
        {/* Body Pill (Top Right) */}
        <motion.div 
          className="absolute top-[15%] right-[10%] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 z-20"
          style={{ background: 'rgba(15, 12, 30, 0.6)', border: '1px solid rgba(45, 212, 191, 0.4)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1, type: 'spring' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] shadow-[0_0_8px_#2dd4bf]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Body</span>
          <span className="text-xs font-black text-white">{body}%</span>
        </motion.div>

        {/* Mind Pill (Middle Left) */}
        <motion.div 
          className="absolute top-[45%] left-[5%] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 z-20"
          style={{ background: 'rgba(15, 12, 30, 0.6)', border: '1px solid rgba(244, 114, 182, 0.4)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0, scale: 0.8, x: -10 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 1.15, type: 'spring' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#f472b6] shadow-[0_0_8px_#f472b6]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Mind</span>
          <span className="text-xs font-black text-white">{mind}%</span>
        </motion.div>

        {/* Energy Pill (Bottom Right) */}
        <motion.div 
          className="absolute bottom-[20%] right-[8%] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 z-20"
          style={{ background: 'rgba(15, 12, 30, 0.6)', border: '1px solid rgba(168, 85, 247, 0.4)', backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0, scale: 0.8, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 1.3, type: 'spring' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7] shadow-[0_0_8px_#a855f7]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-white/40">Energy</span>
          <span className="text-xs font-black text-white">{energy}%</span>
        </motion.div>

      </div>
    </div>
  )
}

