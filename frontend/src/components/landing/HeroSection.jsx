'use client'
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { motion } from 'framer-motion'

export default function HeroSection() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 100)
    camera.position.z = 4.5

    // Neural orb — wireframe icosahedron with glow
    const geo = new THREE.IcosahedronGeometry(1.2, 3)
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    })
    const orb = new THREE.Mesh(geo, mat)
    scene.add(orb)

    // Inner glow sphere
    const innerGeo = new THREE.SphereGeometry(0.9, 32, 32)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.03,
    })
    const inner = new THREE.Mesh(innerGeo, innerMat)
    scene.add(inner)

    // Orbiting particles
    const particleCount = 300
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 1.5 + Math.random() * 1.5
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pMat = new THREE.PointsMaterial({ color: 0x00f3ff, size: 0.015, transparent: true, opacity: 0.4 })
    const points = new THREE.Points(pGeo, pMat)
    scene.add(points)

    // Animation loop
    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      orb.rotation.x += 0.001
      orb.rotation.y += 0.002
      points.rotation.y += 0.0008
      points.rotation.x += 0.0003
      inner.rotation.y -= 0.001

      // Pulse opacity
      const t = Date.now() * 0.001
      mat.opacity = 0.06 + Math.sin(t) * 0.03
      innerMat.opacity = 0.02 + Math.sin(t * 0.7) * 0.015

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      camera.aspect = canvas.offsetWidth / canvas.offsetHeight
      camera.updateProjectionMatrix()
      renderer.setSize(canvas.offsetWidth, canvas.offsetHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <section id="hero" className="relative min-h-[110vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="bg-orb w-[900px] h-[900px] -top-[300px] left-1/2 -translate-x-1/2" style={{ background: 'radial-gradient(circle, rgba(0,243,255,0.08) 0%, transparent 70%)' }}></div>
        <div className="bg-orb w-[600px] h-[600px] top-[20%] -right-[200px]" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }}></div>
        <div className="bg-orb w-[500px] h-[500px] bottom-[10%] -left-[200px]" style={{ background: 'radial-gradient(circle, rgba(0,243,255,0.05) 0%, transparent 70%)' }}></div>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[1]" />

      <div className="absolute inset-0 z-[3] pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 30%, #030304 80%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="badge mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Powered by Neural AI
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl sm:text-8xl md:text-[7rem] lg:text-[8.5rem] font-heading italic leading-[0.95] mb-8"
        >
          <span className="block text-white/90">Synapze.</span>
          <span className="block text-gradient-cyan mt-2" style={{ filter: 'drop-shadow(0 0 40px rgba(0,243,255,0.3))' }}>Your Neural OS.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl lg:text-2xl text-white/35 max-w-2xl mx-auto leading-relaxed mb-12 font-light tracking-wide"
        >
          The dashboard that runs your body. Track nutrition in 3 seconds, build unbreakable habits, and decode your health with AI.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5"
        >
          <a href="/auth" className="btn-cyan text-lg">
            Get Started — Free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a href="#neural-score" className="btn-ghost text-base">
            Watch the magic
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="mt-14 flex items-center justify-center gap-6"
        >
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 border-2 border-[#030304]"></div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 border-2 border-[#030304]"></div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 border-2 border-[#030304]"></div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 border-2 border-[#030304]"></div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 border-2 border-[#030304]"></div>
          </div>
          <p className="text-sm text-white/30"><span className="text-white/60 font-semibold">10,000+</span> humans optimizing daily</p>
        </motion.div>
      </div>

      {/* Dashboard Preview */}
      <motion.div 
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="relative z-10 mt-24 w-full max-w-5xl mx-auto"
      >
        <div className="absolute -inset-4 rounded-3xl opacity-50" style={{ background: 'linear-gradient(135deg, rgba(0,243,255,0.15), rgba(139,92,246,0.15))', filter: 'blur(40px)' }} aria-hidden="true"></div>
        <div className="relative liquid-glass-strong rounded-2xl p-1.5 animate-float">
          <div className="bg-[#08080f] rounded-xl p-5 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-6 rounded-lg bg-white/[0.03] border border-white/[0.04] flex items-center justify-center">
                  <span className="text-[10px] text-white/20 font-medium tracking-wider">synapze.app/dashboard</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-3 md:gap-4 text-left">
              <div className="col-span-12 md:col-span-5 bg-gradient-to-br from-[#0d0d18] to-[#0a0a14] rounded-xl p-6 border border-white/[0.04] flex flex-col items-center justify-center min-h-[200px]">
                <p className="text-white/25 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">Neural Score</p>
                <div className="relative">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#heroGauge)" strokeWidth="6" strokeLinecap="round" strokeDasharray="314" strokeDashoffset="47" transform="rotate(-90 60 60)" style={{ filter: 'drop-shadow(0 0 8px rgba(0,243,255,0.4))' }} />
                    <defs><linearGradient id="heroGauge" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00f3ff"/><stop offset="100%" stopColor="#8b5cf6"/></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black text-white tabular-nums">92</span>
                    <span className="text-[9px] text-cyan-400/60 font-bold tracking-widest uppercase">Elite</span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-7 grid grid-rows-2 gap-3 md:gap-4">
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {[{val: '2,450', label: 'Calories'}, {val: '142g', label: 'Protein', color: 'text-cyan-400'}, {val: '218g', label: 'Carbs', color: 'text-violet-400'}, {val: '68g', label: 'Fat', color: 'text-amber-400'}].map((m, i) => (
                    <div key={i} className="bg-[#0d0d18] rounded-xl p-3 border border-white/[0.04] text-center">
                      <p className={`text-2xl font-black ${m.color || 'text-white'}`}>{m.val}</p>
                      <p className="text-[8px] text-white/20 font-bold tracking-widest uppercase mt-1">{m.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-xl p-4 border border-cyan-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                      <span className="text-[10px] text-cyan-400/70 font-bold tracking-wider uppercase">AI Vision</span>
                    </div>
                    <p className="text-white text-sm font-semibold">Lunch logged via photo</p>
                    <p className="text-white/20 text-[10px] mt-1">Processed in 1.8s</p>
                  </div>
                  <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 rounded-xl p-4 border border-violet-500/10">
                    <div className="flex items-center gap-2 mb-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
                      <span className="text-[10px] text-violet-400/70 font-bold tracking-wider uppercase">Habits</span>
                    </div>
                    <p className="text-white text-sm font-semibold">5/6 completed</p>
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4,5,6].map((_, i) => (
                        <div key={i} className={`w-full h-1 rounded-full ${i < 5 ? 'bg-violet-500/80' : 'bg-white/[0.06]'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 opacity-30">
        <span className="text-[9px] tracking-[0.25em] uppercase font-semibold">Scroll to explore</span>
        <div className="w-5 h-9 rounded-full border border-white/15 flex justify-center pt-2">
          <div className="w-1 h-2.5 rounded-full bg-white/40 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}
