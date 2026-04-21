'use client'
import { useEffect, useRef } from 'react'

const PARTICLE_COUNT = 7000

export default function NeuralScoreParticles({ score = 0 }) {
  const mountRef = useRef(null)
  const scoreRef = useRef(score)
  const updateRef = useRef(null)

  useEffect(() => {
    scoreRef.current = score
    if (updateRef.current) updateRef.current(String(score))
  }, [score])

  useEffect(() => {
    if (!mountRef.current) return
    let animId, renderer
    const velocities = []
    const targetPositions = []
    let mouse = { x: -9999, y: -9999 }

    const tc = document.createElement('canvas')
    tc.width = 500; tc.height = 200
    const tx = tc.getContext('2d')

    function sampleText(text) {
      tx.clearRect(0, 0, tc.width, tc.height)
      tx.fillStyle = '#fff'
      tx.font = `900 160px Inter, system-ui, sans-serif`
      tx.textAlign = 'center'
      tx.textBaseline = 'middle'
      tx.fillText(text, tc.width / 2, tc.height / 2 + 5)
      const data = tx.getImageData(0, 0, tc.width, tc.height).data
      const pts = []
      for (let y = 0; y < tc.height; y += 2) {
        for (let x = 0; x < tc.width; x += 1) {
          if (data[(y * tc.width + x) * 4 + 3] > 128) {
            pts.push({
              x: (x - tc.width / 2) * 0.045,
              y: -(y - tc.height / 2) * 0.045,
              z: (Math.random() - 0.5) * 0.8,
            })
          }
        }
      }
      return pts
    }

    function setTargets(text) {
      const pts = sampleText(text)
      if (!pts.length) return
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = pts[i % pts.length]
        targetPositions[i] = {
          x: p.x + (Math.random() - 0.5) * 0.1,
          y: p.y + (Math.random() - 0.5) * 0.1,
          z: p.z,
        }
      }
    }

    updateRef.current = setTargets

    async function setup() {
      const THREE = (await import('three')).default ?? (await import('three'))
      const { Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry,
              Float32BufferAttribute, PointsMaterial, Points,
              AdditiveBlending, Vector3 } = THREE

      const W = mountRef.current?.clientWidth || 400
      const H = 260

      const scene = new Scene()
      const camera = new PerspectiveCamera(60, W / H, 0.1, 500)
      camera.position.z = 22

      renderer = new WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' })
      renderer.setSize(W, H)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setClearColor(0x000000, 0)
      mountRef.current?.appendChild(renderer.domElement)

      const pos = new Float32Array(PARTICLE_COUNT * 3)
      const col = new Float32Array(PARTICLE_COUNT * 3)

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i*3]   = (Math.random() - 0.5) * 20
        pos[i*3+1] = (Math.random() - 0.5) * 20
        pos[i*3+2] = (Math.random() - 0.5) * 5
        velocities.push({ x: 0, y: 0, z: 0 })
        targetPositions.push({ x: 0, y: 0, z: 0 })
        const t = i / PARTICLE_COUNT
        col[i*3]   = 0.0 + t * 0.7
        col[i*3+1] = 0.85 - t * 0.6
        col[i*3+2] = 1.0
      }

      const geo = new BufferGeometry()
      geo.setAttribute('position', new Float32BufferAttribute(pos, 3))
      geo.setAttribute('color', new Float32BufferAttribute(col, 3))

      const mat = new PointsMaterial({
        size: 0.22,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: AdditiveBlending,
        depthWrite: false,
      })

      const particles = new Points(geo, mat)
      scene.add(particles)

      setTargets(String(scoreRef.current || 0))

      const onMouse = (e) => {
        const r = mountRef.current?.getBoundingClientRect()
        if (!r) return
        mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1
        mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1
      }
      const onResize = () => {
        if (!mountRef.current) return
        const nW = mountRef.current.clientWidth
        camera.aspect = nW / 260
        camera.updateProjectionMatrix()
        renderer.setSize(nW, 260)
      }
      window.addEventListener('mousemove', onMouse)
      window.addEventListener('resize', onResize)

      const mv = new Vector3()
      const posAttr = particles.geometry.attributes.position

      function animate() {
        animId = requestAnimationFrame(animate)
        const v = new Vector3(mouse.x, mouse.y, 0.5)
        v.unproject(camera)
        const dir = v.sub(camera.position).normalize()
        const dist = -camera.position.z / dir.z
        mv.copy(camera.position).addScaledVector(dir, dist)

        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const px = posAttr.getX(i), py = posAttr.getY(i), pz = posAttr.getZ(i)
          const tgt = targetPositions[i]
          const dx = px - mv.x, dy = py - mv.y, dz = pz - mv.z
          const dsq = dx*dx + dy*dy + dz*dz
          if (dsq < 16) {
            const d = Math.sqrt(dsq) || 0.001
            const f = (4 - d) / 4
            velocities[i].x += (dx/d) * f * 1.0
            velocities[i].y += (dy/d) * f * 1.0
          }
          velocities[i].x += (tgt.x - px) * 0.1
          velocities[i].y += (tgt.y - py) * 0.1
          velocities[i].z += (tgt.z - pz) * 0.1
          velocities[i].x *= 0.78
          velocities[i].y *= 0.78
          velocities[i].z *= 0.78
          posAttr.setXYZ(i, px + velocities[i].x, py + velocities[i].y, pz + velocities[i].z)
        }
        posAttr.needsUpdate = true
        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('mousemove', onMouse)
        window.removeEventListener('resize', onResize)
      }
    }

    let cleanup = () => {}
    setup().then(fn => { if (fn) cleanup = fn })

    return () => {
      cancelAnimationFrame(animId)
      cleanup()
      renderer?.dispose()
      renderer?.domElement?.parentNode?.removeChild(renderer?.domElement)
      updateRef.current = null
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="w-full overflow-hidden rounded-lg"
      style={{ height: 260, background: 'transparent' }}
      aria-label={`Neural Score: ${score}`}
    />
  )
}
