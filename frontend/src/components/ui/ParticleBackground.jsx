'use client'
import { useEffect, useRef } from 'react'

// Optimised: 10k particles (vs original 40k), canvas auto-cleanup, no CDN load
const PARTICLE_COUNT = 10000

export default function ParticleBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    let animId, renderer, scene, camera, particles
    const velocities = []
    const targetPositions = []
    let mouse = { x: -9999, y: -9999 }

    async function setup() {
      // Dynamic import so Three.js is code-split and never blocks first paint
      const THREE = (await import('three')).default ?? (await import('three'))

      // ── Scene ──────────────────────────────────────────────────────────────
      scene = new THREE.Scene()
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
      camera.position.z = 35

      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)) // cap for perf
      mountRef.current?.appendChild(renderer.domElement)

      // ── Geometry ──────────────────────────────────────────────────────────
      const geometry = new THREE.BufferGeometry()
      const pos = new Float32Array(PARTICLE_COUNT * 3)
      const col = new Float32Array(PARTICLE_COUNT * 3)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3]     = (Math.random() - 0.5) * 200
        pos[i * 3 + 1] = (Math.random() - 0.5) * 200
        pos[i * 3 + 2] = (Math.random() - 0.5) * 200
        velocities.push({ x: 0, y: 0, z: 0 })

        // Cyan-purple palette matching the dashboard
        col[i * 3]     = 0.1 + Math.random() * 0.3  // R
        col[i * 3 + 1] = 0.4 + Math.random() * 0.5  // G → cyan tint
        col[i * 3 + 2] = 0.8 + Math.random() * 0.2  // B → purple/blue
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(col, 3))

      const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      particles = new THREE.Points(geometry, material)
      scene.add(particles)

      // ── Heart target shape ─────────────────────────────────────────────────
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const t = Math.acos(Math.random() * 2 - 1)
        const u = Math.random() * Math.PI * 2
        const x = 16 * Math.pow(Math.sin(u), 3) * Math.sin(t) * 0.7
        const y = (13 * Math.cos(u) - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u)) * Math.sin(t) * 0.7
        const z = 10 * Math.cos(t) * 0.7
        targetPositions.push({
          x: x + (Math.random() - 0.5) * 0.5,
          y: y + (Math.random() - 0.5) * 0.5,
          z: z + (Math.random() - 0.5) * 0.5,
        })
      }

      // ── Slow auto-rotation ─────────────────────────────────────────────────
      let rotY = 0

      // ── Events ────────────────────────────────────────────────────────────
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
      const onMouseMove = (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      }
      window.addEventListener('resize', onResize)
      window.addEventListener('mousemove', onMouseMove)

      // ── Animation loop ────────────────────────────────────────────────────
      const mVec = new THREE.Vector3()

      function animate() {
        animId = requestAnimationFrame(animate)

        // Project mouse to 3D
        const v = new THREE.Vector3(mouse.x, mouse.y, 0.5)
        v.unproject(camera)
        const dir = v.sub(camera.position).normalize()
        const dist = -camera.position.z / dir.z
        mVec.copy(camera.position).addScaledVector(dir, dist)

        const posAttr = particles.geometry.attributes.position
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const px = posAttr.getX(i)
          const py = posAttr.getY(i)
          const pz = posAttr.getZ(i)
          const tgt = targetPositions[i]

          const dx = px - mVec.x, dy = py - mVec.y, dz = pz - mVec.z
          const distSq = dx*dx + dy*dy + dz*dz

          if (distSq < 64) { // radius 8
            const d = Math.sqrt(distSq) || 0.001
            const force = (8 - d) / 8
            velocities[i].x += (dx / d) * force * 1.5
            velocities[i].y += (dy / d) * force * 1.5
            velocities[i].z += (dz / d) * force * 1.5
          }

          velocities[i].x += (tgt.x - px) * 0.07
          velocities[i].y += (tgt.y - py) * 0.07
          velocities[i].z += (tgt.z - pz) * 0.07
          velocities[i].x *= 0.80
          velocities[i].y *= 0.80
          velocities[i].z *= 0.80

          posAttr.setXYZ(i, px + velocities[i].x, py + velocities[i].y, pz + velocities[i].z)
        }
        posAttr.needsUpdate = true

        // Slow drift rotation
        rotY += 0.0015
        particles.rotation.y = rotY

        renderer.render(scene, camera)
      }

      animate()

      // Return cleanup refs
      return () => {
        window.removeEventListener('resize', onResize)
        window.removeEventListener('mousemove', onMouseMove)
      }
    }

    let cleanupFn = () => {}
    setup().then(fn => { if (fn) cleanupFn = fn })

    return () => {
      cancelAnimationFrame(animId)
      cleanupFn()
      if (renderer) {
        renderer.dispose()
        renderer.domElement?.parentNode?.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
