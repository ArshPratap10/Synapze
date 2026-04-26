'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Environment, Stars } from '@react-three/drei'
import * as THREE from 'three'

function DataOrb() {
  const outerRef = useRef()
  const innerRef = useRef()
  const ringRef = useRef()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.08
      outerRef.current.rotation.y = t * 0.12
      const pulse = 1 + Math.sin(t * 1.5) * 0.04
      outerRef.current.scale.setScalar(pulse * 2.8)
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.2
      innerRef.current.rotation.z = t * 0.15
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.3
      ringRef.current.rotation.y = -t * 0.1
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={1.5}>
      <group>
        {/* Outer glass sphere */}
        <mesh ref={outerRef}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhysicalMaterial
            color="#0e0b1a"
            emissive="#8b5cf6"
            emissiveIntensity={0.3}
            metalness={0.2}
            roughness={0.1}
            transmission={0.9}
            thickness={0.5}
            ior={1.4}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Inner energy core */}
        <mesh ref={innerRef} scale={1.5}>
          <sphereGeometry args={[0.6, 32, 32]} />
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00f3ff"
            emissiveIntensity={2.5}
            roughness={0.1}
            metalness={0.8}
            wireframe
          />
        </mesh>

        {/* Orbital ring */}
        <mesh ref={ringRef} scale={1.8}>
          <torusGeometry args={[1, 0.06, 16, 100]} />
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#8b5cf6"
            emissiveIntensity={3}
            roughness={0}
            metalness={1}
          />
        </mesh>

        <pointLight color="#00f3ff" intensity={6} distance={6} />
      </group>
    </Float>
  )
}

function FloatingParticles() {
  const count = 150
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 35
      arr[i * 3 + 1] = (Math.random() - 0.5) * 35
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return arr
  }, [])

  const pointsRef = useRef()
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.008
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.07} color="#00f3ff" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

export default function ThreeDScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-8, -5, -5]} intensity={3} color="#8b5cf6" />
        <pointLight position={[8, 5, 3]} intensity={2} color="#00f3ff" />
        <DataOrb />
        <FloatingParticles />
        <Stars radius={100} depth={40} count={2000} factor={3} saturation={0.4} fade speed={0.2} />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
