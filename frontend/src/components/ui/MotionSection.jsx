'use client'

import { motion, useReducedMotion } from 'framer-motion'

export function MotionSection({ children, className = '', sectionKey }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      key={sectionKey}
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  )
}

