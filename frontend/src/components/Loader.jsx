'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Canvas-based particle system for performance
function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles
    const PARTICLE_COUNT = 70
    const CONNECTION_DIST = 120
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2.5 + 0.5,
      color: Math.random() > 0.5 ? '0,243,255' : '191,0,255',
      opacity: Math.random() * 0.6 + 0.2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15
            ctx.beginPath()
            ctx.strokeStyle = `rgba(0,243,255,${alpha})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw & update particles
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`
        ctx.fill()
        // glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.opacity * 0.15})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
}

// Hexagon wireframe SVG
function HexLogo() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      className="relative"
    >
      <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
        <motion.polygon
          points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
          stroke="url(#hexGrad)"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
        <motion.polygon
          points="50,20 78,35 78,65 50,80 22,65 22,35"
          stroke="url(#hexGrad)"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: 'easeInOut' }}
        />
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="100%" stopColor="#bf00ff" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center glow */}
      <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl animate-pulse-glow" />
    </motion.div>
  )
}

// Animated dots
function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-cyan-400/60"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  )
}

export default function Loader({ onFinish }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const minTimer = new Promise(r => setTimeout(r, 1500))
    const docReady = new Promise(r => {
      if (document.readyState === 'complete') return r()
      window.addEventListener('load', r, { once: true })
    })
    Promise.all([minTimer, docReady]).then(() => {
      setExiting(true)
      setTimeout(() => onFinish?.(), 600)
    })
  }, [onFinish])

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: '#0a0a0f' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ParticleCanvas />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <HexLogo />
            <motion.h1
              className="text-lg font-bold tracking-[0.3em] uppercase gradient-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Project Aura
            </motion.h1>
            <motion.div
              className="flex items-center text-xs tracking-[0.2em] text-zinc-500 uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Loading your neural suite
              <LoadingDots />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
