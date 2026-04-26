'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Sparkles, Activity, Brain, Zap } from 'lucide-react'

export default function SynapzeCore({ 
  score = 75, 
  bodyPct = 35, 
  mindPct = 40, 
  energyPct = 25 
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5
    })
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-[340px] flex items-center justify-center select-none bg-black/20 rounded-[32px] overflow-hidden border border-white/5 shadow-2xl"
      style={{
        perspective: '1000px'
      }}
    >
      {/* 1. Generative Background Mesh */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(124,107,196,0.2)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* 2. Dynamic Atmosphere (Parallax Glows) */}
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
        animate={{ 
          x: mousePos.x * 100, 
          y: mousePos.y * 100,
          background: `radial-gradient(circle, #7c6bc4 0%, transparent 70%)`
        }}
      />

      {/* 3. The Neural Hologram */}
      <motion.div 
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{
          rotateY: mousePos.x * 20,
          rotateX: -mousePos.y * 20,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Holographic Concentric Wave-Rings */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-white/[0.03]"
            style={{
              width: 80 + i * 20,
              height: 80 + i * 20,
              translateZ: i * 8,
            }}
            animate={{ 
              rotateX: [0, 5, 0],
              rotateY: [0, -5, 0],
              scale: [1, 1.02, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* The Core Pulsating Score */}
        <div className="relative flex flex-col items-center justify-center p-8 bg-white/[0.02] backdrop-blur-3xl rounded-full border border-white/10 shadow-[0_0_80px_rgba(124,107,196,0.2)]">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <span className="text-[8px] font-black tracking-[0.6em] text-[#a78bfa] mb-1 uppercase opacity-60">Neural Score</span>
            <h2 className="text-6xl font-black text-white tracking-tighter drop-shadow-[0_0_30px_rgba(167,139,250,0.5)]">
              {score}
            </h2>
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Sparkles size={10} className="text-[#a78bfa]" />
              <span className="text-[8px] font-bold text-white/80 uppercase tracking-widest">Optimized</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Bio-Metric Orbs */}
        <MetricOrb 
          label="Body" 
          value={bodyPct} 
          color="#2dd4bf" 
          icon={<Activity size={12} />}
          pos={{ x: -120, y: -80, z: 80 }}
          mousePos={mousePos}
        />
        <MetricOrb 
          label="Mind" 
          value={mindPct} 
          color="#f472b6" 
          icon={<Brain size={12} />}
          pos={{ x: 130, y: 0, z: 120 }}
          mousePos={mousePos}
        />
        <MetricOrb 
          label="Energy" 
          value={energyPct} 
          color="#a855f7" 
          icon={<Zap size={12} />}
          pos={{ x: -70, y: 110, z: 60 }}
          mousePos={mousePos}
        />
      </motion.div>

      {/* Interactive Legend (Bottom) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 z-20">
        <LegendItem color="#2dd4bf" label="Physique" />
        <LegendItem color="#f472b6" label="Cognitive" />
        <LegendItem color="#a855f7" label="Vitality" />
      </div>
    </div>
  )
}

function MetricOrb({ label, value, color, icon, pos, mousePos }) {
  return (
    <motion.div
      className="absolute p-3 rounded-2xl backdrop-blur-2xl border border-white/10 shadow-xl flex flex-col items-center gap-1.5"
      style={{
        x: pos.x,
        y: pos.y,
        translateZ: pos.z,
        background: `radial-gradient(circle at top left, ${color}10, transparent)`,
      }}
      animate={{
        y: pos.y + Math.sin(Date.now() / 1000) * 10,
        rotateY: mousePos.x * 30,
        rotateX: -mousePos.y * 30,
      }}
    >
      <div 
        className="w-7 h-7 rounded-full flex items-center justify-center mb-0.5 shadow-lg"
        style={{ background: color, boxShadow: `0 0 15px ${color}50` }}
      >
        <div className="text-white scale-75">{icon}</div>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[7px] font-black tracking-widest text-white/40 uppercase">{label}</span>
        <span className="text-lg font-black text-white tabular-nums">{value}%</span>
      </div>
      
      {/* Dynamic Progress Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
        <circle
          cx="50%" cy="50%" r="48%"
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray="100 100"
          strokeDashoffset={100 - value}
          strokeLinecap="round"
          className="opacity-20"
        />
      </svg>
    </motion.div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">{label}</span>
    </div>
  )
}
