'use client'
import React, { useRef, useState } from 'react'
import { motion, useSpring, useMotionValue, useTransform } from 'framer-motion'

export default function Magnetic({ children, strength = 0.5, className = "" }) {
  const ref = useRef(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    
    const centerX = left + width / 2
    const centerY = top + height / 2
    
    const distanceX = clientX - centerX
    const distanceY = clientY - centerY
    
    x.set(distanceX * strength)
    y.set(distanceY * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  )
}
