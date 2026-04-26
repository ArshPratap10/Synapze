'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function NeuralLotusVisual({ 
  score = 0, 
  bodyPct: propBody, 
  mindPct: propMind, 
  energyPct: propEnergy 
}) {
  const [hovered, setHovered] = useState(null)

  // Data processing
  const baseScore = score > 0 ? score : 75
  const body = propBody ?? Math.round(30 + (baseScore % 10)) 
  const mind = propMind ?? Math.round(40 - (baseScore % 5))
  const energy = propEnergy ?? (100 - body - mind)

  const metrics = [
    { id: 'body',   label: 'Body',   value: body,   color: '#2dd4bf', angle: -30 },
    { id: 'mind',   label: 'Mind',   value: mind,   color: '#f472b6', angle: 180 },
    { id: 'energy', label: 'Energy', value: energy, color: '#a855f7', angle: 30 },
  ]

  // Concentric rings configuration
  const ringCount = 12
  const maxRadius = 140
  const center = 200

  return (
    <div className="relative w-full h-[380px] flex items-center justify-center select-none overflow-hidden bg-transparent">
      
      {/* SVG Canvas for Rings and Arcs */}
      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[400px] drop-shadow-2xl">
        <defs>
          <radialGradient id="flowerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c6bc4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#7c6bc4" stopOpacity="0" />
          </radialGradient>
          
          {metrics.map(m => (
            <linearGradient key={`grad-${m.id}`} id={`grad-${m.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={m.color} stopOpacity="0.2" />
              <stop offset="50%" stopColor={m.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={m.color} stopOpacity="0.2" />
            </linearGradient>
          ))}
        </defs>

        {/* Ambient Glow */}
        <circle cx={center} cy={center} r="100" fill="url(#flowerGlow)" className="animate-pulse" />

        {/* 1. Background Ripple Rings (Concentric Circles) */}
        {Array.from({ length: ringCount }).map((_, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={(maxRadius / ringCount) * (i + 1)}
            fill="none"
            stroke="rgba(124, 107, 196, 0.1)"
            strokeWidth="0.5"
            className="transition-opacity duration-500"
          />
        ))}

        {/* 2. Active Progress Arcs */}
        {metrics.map((m, i) => {
          const radius = maxRadius - (i * 12)
          const circumference = 2 * Math.PI * radius
          const offset = circumference - (m.value / 100) * circumference
          const isHovered = hovered === m.id
          
          return (
            <motion.circle
              key={m.id}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={`url(#grad-${m.id})`}
              strokeWidth={isHovered ? 4 : 2}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ 
                strokeDashoffset: offset,
                opacity: hovered && !isHovered ? 0.2 : 1,
              }}
              transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 }}
              transform={`rotate(${m.angle - 90} ${center} ${center})`}
            />
          )
        })}

        {/* 3. Central Neural Lotus */}
        <g transform={`translate(${center}, ${center})`}>
          {/* Outer Petals */}
          {[0, 60, 120, 180, 240, 300].map((rot, i) => (
            <motion.path
              key={i}
              d="M0 0 C 15 -35, 45 -35, 0 -60 C -45 -35, -15 -35, 0 0"
              fill="rgba(167, 139, 250, 0.3)"
              stroke="rgba(167, 139, 250, 0.6)"
              strokeWidth="1"
              initial={{ rotate: rot, scale: 0.8 }}
              animate={{ 
                scale: [0.8, 0.9, 0.8],
                rotate: [rot, rot + 2, rot]
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity, 
                delay: i * 0.4,
                ease: "easeInOut" 
              }}
              style={{ originX: 0, originY: 0 }}
            />
          ))}
          {/* Inner Petals */}
          {[30, 90, 150, 210, 270, 330].map((rot, i) => (
            <motion.path
              key={`inner-${i}`}
              d="M0 0 C 10 -20, 30 -20, 0 -40 C -30 -20, -10 -20, 0 0"
              fill="rgba(124, 107, 196, 0.5)"
              initial={{ rotate: rot, scale: 0.7 }}
              animate={{ scale: [0.7, 0.8, 0.7] }}
              transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
              style={{ originX: 0, originY: 0 }}
            />
          ))}
          {/* Core Glow */}
          <motion.circle 
            r="14" 
            fill="#a78bfa" 
            className="drop-shadow-[0_0_20px_rgba(167,139,250,0.9)]"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </g>
      </svg>

      {/* 4. Interactive Floating Labels */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {metrics.map((m, i) => {
          // Adjusted calculation for label positioning to match SVG arcs
          const angleRad = ((m.angle - 90) * Math.PI) / 180
          const dist = 160
          const x = center + dist * Math.cos(angleRad)
          const y = center + dist * Math.sin(angleRad)
          
          return (
            <motion.div
              key={m.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ 
                left: x, 
                top: y, 
                transform: 'translate(-50%, -50%)',
                zIndex: hovered === m.id ? 20 : 10
              }}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: hovered === m.id ? 1.1 : 1,
                x: hovered === m.id ? Math.cos(angleRad) * 10 : 0,
                y: hovered === m.id ? Math.sin(angleRad) * 10 : 0
              }}
            >
              <div 
                className="px-4 py-2 rounded-2xl flex items-center gap-2 backdrop-blur-xl border transition-all shadow-xl"
                style={{ 
                  background: 'rgba(21, 16, 37, 0.8)',
                  borderColor: hovered === m.id ? m.color : 'rgba(255,255,255,0.1)'
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: m.color, boxShadow: `0 0 10px ${m.color}` }} />
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">{m.label}</span>
                <span className="text-xs font-black" style={{ color: m.color }}>{m.value}%</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Central Score Label Overlay */}
      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <motion.div 
          className="flex flex-col items-center"
          animate={{ opacity: hovered ? 0.1 : 0.6 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#a78bfa]/60 mb-[-4px]">Neural</span>
          <span className="text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {score || 75}
          </span>
        </motion.div>
      </div>
    </div>
  )
}
