import React from 'react'
import { motion } from 'framer-motion'

export default function GlassButton({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  type = 'button' 
}) {
  const isGhost = variant === 'ghost'
  
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        px-6 py-3 rounded-full font-bold transition-all duration-300
        flex items-center justify-center gap-2
        ${isGhost 
          ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' 
          : 'bg-gradient-to-r from-[#1A56DB] to-[#7C3AED] text-white shadow-[0_8px_20px_rgba(26,86,219,0.4)]'
        }
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
