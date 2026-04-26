'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'

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

    const PARTICLE_COUNT = 40
    const CONNECTION_DIST = 140
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 2 + 0.8,
      color: Math.random() > 0.5 ? '124,107,196' : '167,139,250',
      opacity: Math.random() * 0.4 + 0.15,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.06
            ctx.beginPath()
            ctx.strokeStyle = `rgba(124,107,196,${alpha})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${p.color},${p.opacity * 0.1})`
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

function LoadingDots() {
  return (
    <span className="inline-flex gap-1 ml-1.5">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]/50"
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
          style={{
            background: 'var(--bg-primary)'
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ParticleCanvas />
          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Logo mark */}
            <motion.div
              className="w-16 h-16 rounded-3xl flex items-center justify-center relative overflow-hidden"
              style={{ 
                background: 'linear-gradient(135deg, #a78bfa, #c4b0f0)', 
                boxShadow: '0 8px 32px rgba(167,139,250,0.4), inset 0 0 0 1px rgba(255,255,255,0.2)' 
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              {/* Glass shine */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
              
              <Sparkles className="w-8 h-8 text-white relative z-10" />
            </motion.div>

            <motion.h1
              className="text-xl font-extrabold tracking-[0.2em] uppercase gradient-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Synapze
            </motion.h1>

            <motion.div
              className="flex items-center text-xs tracking-[0.15em] uppercase"
              style={{ color: 'var(--text-muted)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Initializing your neural suite
              <LoadingDots />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
