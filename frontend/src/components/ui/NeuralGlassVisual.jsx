'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo } from 'react'

export default function NeuralGlassVisual({ 
  score = 0, 
  bodyPct: propBody, 
  mindPct: propMind, 
  energyPct: propEnergy 
}) {
  const [hovered, setHovered] = useState(null)

  // Data processing
  const baseScore = score > 0 ? score : 75
  const body = propBody ?? Math.round(34 + (baseScore % 5)) 
  const mind = propMind ?? Math.round(41 - (baseScore % 4))
  const energy = propEnergy ?? (100 - body - mind)

  const metrics = useMemo(() => [
    { id: 'mind',   label: 'MIND',   value: mind,   color: '#f472b6', angle: 160, radius: 110 },
    { id: 'body',   label: 'BODY',   value: body,   color: '#2dd4bf', angle: -25, radius: 135 },
    { id: 'energy', label: 'ENERGY', value: energy, color: '#a855f7', angle: 45,  radius: 85 },
  ], [body, mind, energy])

  const center = 200

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center select-none bg-transparent">
      
      {/* Background Deep Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20 bg-[#7c6bc4]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full blur-[60px] opacity-10 bg-white" />
      </div>

      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[420px] drop-shadow-[0_0_50px_rgba(124,107,196,0.2)]">
        <defs>
          {/* Gradients for each metric */}
          {metrics.map(m => (
            <radialGradient key={`glow-${m.id}`} id={`glow-${m.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={m.color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={m.color} stopOpacity="0" />
            </radialGradient>
          ))}
          
          <filter id="glass-blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
        </defs>

        {/* 1. Background Ripple Pattern */}
        {Array.from({ length: 18 }).map((_, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={50 + i * 8}
            fill="none"
            stroke="rgba(124, 107, 196, 0.04)"
            strokeWidth={i % 4 === 0 ? "1" : "0.5"}
          />
        ))}

        {/* 2. Soft Dynamic Glows that follow hover */}
        <AnimatePresence>
          {hovered && (
            <motion.circle
              key="hover-glow"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.15, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.8 }}
              cx={center}
              cy={center}
              r={metrics.find(m => m.id === hovered).radius}
              fill="none"
              stroke={metrics.find(m => m.id === hovered).color}
              strokeWidth="15"
              filter="url(#glass-blur)"
            />
          )}
        </AnimatePresence>

        {/* 3. Metric Orbit Rings */}
        {metrics.map((m, i) => {
          const circumference = 2 * Math.PI * m.radius
          const offset = circumference - (m.value / 100) * circumference
          const isHovered = hovered === m.id
          
          return (
            <g key={m.id}>
              {/* Ghost track */}
              <circle
                cx={center}
                cy={center}
                r={m.radius}
                fill="none"
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="1"
              />
              {/* Active Arc */}
              <motion.circle
                cx={center}
                cy={center}
                r={m.radius}
                fill="none"
                stroke={m.color}
                strokeWidth={isHovered ? 4 : 2}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ 
                  strokeDashoffset: offset,
                  opacity: hovered && !isHovered ? 0.15 : 0.8,
                  strokeWidth: isHovered ? 6 : 2
                }}
                transition={{ duration: 2, ease: "circOut", delay: i * 0.1 }}
                transform={`rotate(${m.angle - 90} ${center} ${center})`}
                className="drop-shadow-[0_0_8px_currentColor]"
              />
            </g>
          )
        })}

        {/* 4. The Neural Core (Centerpiece) */}
        <motion.g 
          transform={`translate(${center}, ${center})`}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          {/* Glass Petal Layers */}
          {[0, 60, 120, 180, 240, 300].map((rot, i) => (
            <path
              key={i}
              d="M0 0 C 20 -40, 50 -40, 0 -70 C -50 -40, -20 -40, 0 0"
              fill="rgba(124, 107, 196, 0.08)"
              stroke="rgba(167, 139, 250, 0.2)"
              strokeWidth="0.5"
              transform={`rotate(${rot})`}
            />
          ))}
          <circle r="30" fill="rgba(124, 107, 196, 0.1)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
        </motion.g>
      </svg>

      {/* 5. Floating Glass Labels */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {metrics.map((m) => {
          const angleRad = ((m.angle - 90) * Math.PI) / 180
          const dist = m.radius + 35
          const x = center + dist * Math.cos(angleRad)
          const y = center + dist * Math.sin(angleRad)
          const isHovered = hovered === m.id

          return (
            <motion.div
              key={m.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ left: x, top: y, transform: 'translate(-50%, -50%)', zIndex: isHovered ? 30 : 20 }}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              animate={{ 
                scale: isHovered ? 1.15 : 1,
                opacity: hovered && !isHovered ? 0.3 : 1
              }}
            >
              <div className="group relative">
                {/* Connecting Line to Ring */}
                <motion.div 
                  className="absolute left-1/2 bottom-[-10px] w-px h-6 bg-gradient-to-t from-transparent via-white/20 to-transparent -translate-x-1/2"
                  animate={{ opacity: isHovered ? 1 : 0 }}
                />
                
                {/* Glass Pill */}
                <div 
                  className={`flex flex-col items-center px-4 py-2.5 rounded-[22px] backdrop-blur-2xl transition-all duration-500 border ${
                    isHovered ? 'shadow-[0_15px_40px_rgba(0,0,0,0.4)]' : 'shadow-none'
                  }`}
                  style={{ 
                    background: isHovered ? 'rgba(255,255,255,0.05)' : 'rgba(15, 12, 30, 0.4)',
                    borderColor: isHovered ? m.color : 'rgba(255,255,255,0.08)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.color, boxShadow: `0 0 10px ${m.color}` }} />
                    <span className="text-[10px] font-black tracking-[0.25em] text-white/40">{m.label}</span>
                  </div>
                  <span className="text-xl font-black tabular-nums transition-colors" style={{ color: isHovered ? m.color : 'white' }}>
                    {m.value}<span className="text-[10px] ml-0.5 opacity-40 font-bold">%</span>
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* 6. Central Score Display */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="flex flex-col items-center"
          animate={{ 
            opacity: hovered ? 0.1 : 0.8,
            scale: hovered ? 0.9 : 1
          }}
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
    </div>
  )
}
