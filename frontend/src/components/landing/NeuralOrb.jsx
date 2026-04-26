'use client'
import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function NeuralOrb() {
  const containerRef = useRef()

  useEffect(() => {
    if (!containerRef.current) return

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    containerRef.current.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
    camera.position.z = 5

    // Neural orb — wireframe icosahedron with glow
    const geo = new THREE.IcosahedronGeometry(1.5, 3)
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    })
    const orb = new THREE.Mesh(geo, mat)
    scene.add(orb)

    // Inner glow sphere
    const innerGeo = new THREE.SphereGeometry(1.2, 32, 32)
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.1,
    })
    const inner = new THREE.Mesh(innerGeo, innerMat)
    scene.add(inner)

    // Orbiting particles
    const particleCount = 200
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.5 + Math.random() * 2
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pMat = new THREE.PointsMaterial({ 
      color: 0x00f3ff, 
      size: 0.02, 
      transparent: true, 
      opacity: 0.8 
    })
    const points = new THREE.Points(pGeo, pMat)
    scene.add(points)

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      
      orb.rotation.y += 0.001
      orb.rotation.x += 0.0005
      points.rotation.y += 0.0005
      inner.rotation.y -= 0.0005

      // Pulse opacity
      const t = Date.now() * 0.001
      mat.opacity = 0.15 + Math.sin(t) * 0.05
      innerMat.opacity = 0.1 + Math.sin(t * 0.7) * 0.05

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)
      const currentContainer = containerRef.current
      if (currentContainer) {
        currentContainer.removeChild(renderer.domElement)
      }
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      innerGeo.dispose()
      innerMat.dispose()
      pGeo.dispose()
      pMat.dispose()
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 w-full h-full pointer-events-none" 
      style={{ filter: 'blur(2px) contrast(1.2)' }}
    />
  )
}
