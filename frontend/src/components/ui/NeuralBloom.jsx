'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function NeuralBloom({ 
  score = 0, 
  bodyPct = 35, 
  mindPct = 40, 
  energyPct = 25 
}) {
  const displayScore = score || 72
  const b = bodyPct || 33
  const m = mindPct || 42
  const e = energyPct || 25

  // Optimized spacing for dashboard cards
  const metrics = [
    { id: 'body',   label: 'Body',   value: b, color: '#2dd4bf', x: 120, y: -70 },
    { id: 'mind',   label: 'Mind',   value: m, color: '#f472b6', x: -120, y: 0 },
    { id: 'energy', label: 'Energy', value: e, color: '#a855f7', x: 100, y: 80 },
  ]

  return (
    <div className="relative w-full h-[300px] flex items-center justify-center select-none bg-transparent overflow-hidden">
      
      <svg viewBox="0 0 400 300" className="w-full h-full max-w-[400px]">
        {/* 1. Ripples - Scaled Down */}
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c6bc4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7c6bc4" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="150" r="80" fill="url(#centerGlow)" />
        
        {Array.from({ length: 10 }).map((_, i) => (
          <circle
            key={i}
            cx="200"
            cy="150"
            r={30 + i * 10}
            fill="none"
            stroke="rgba(167, 139, 250, 0.1)"
            strokeWidth="0.5"
          />
        ))}

        {/* 2. Neural Bloom - Refined Scale */}
        <g transform="translate(200, 150)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((rot, i) => (
            <motion.path
              key={i}
              d="M0 0 C 8 -22, 32 -22, 32 0 C 32 22, 8 22, 0 0"
              fill="rgba(124, 107, 196, 0.12)"
              stroke="rgba(167, 139, 250, 0.4)"
              strokeWidth="0.5"
              animate={{ rotate: [rot, rot + 4, rot] }}
              transition={{ duration: 6, repeat: Infinity, delay: i * 0.4 }}
              style={{ transformOrigin: "0px 0px", mixBlendMode: 'screen' }}
            />
          ))}
          <circle r="6" fill="#a78bfa" className="opacity-40" />
        </g>

        {/* 3. Central Score - Clean & Balanced Typography */}
        <text
          x="200"
          y="150"
          dy=".35em"
          textAnchor="middle"
          style={{ 
            fontSize: '38px', 
            fontWeight: '900', 
            fill: 'white',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))'
          }}
        >
          {displayScore}
        </text>
        <text
          x="200"
          y="178"
          textAnchor="middle"
          style={{ 
            fontSize: '8px', 
            fontWeight: '900', 
            fill: 'rgba(255,255,255,0.3)',
            letterSpacing: '0.4em',
            textTransform: 'uppercase'
          }}
        >
          Neural
        </text>
      </svg>

      {/* 4. Labels - Compact Layout */}
      <div className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none">
        {metrics.map((m) => (
          <motion.div
            key={m.id}
            className="absolute pointer-events-auto"
            style={{ left: m.x, top: m.y, transform: 'translate(-50%, -50%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="px-3 py-1.5 rounded-full backdrop-blur-3xl border border-white/5 shadow-xl flex items-center gap-2 bg-white/[0.02] whitespace-nowrap">
              <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: m.color, background: m.color }} />
              <span className="text-[10px] font-black text-white/80 tracking-widest uppercase">
                {m.label} — {m.value}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  )
}
