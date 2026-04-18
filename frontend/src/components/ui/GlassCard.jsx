import React from 'react'
import { motion } from 'framer-motion'

export default function GlassCard({ children, className = '', animate = true }) {
  const Card = animate ? motion.div : 'div'
  
  return (
    <Card
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-panel p-6 ${className}`}
      style={{
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
      }}
    >
      {children}
    </Card>
  )
}
