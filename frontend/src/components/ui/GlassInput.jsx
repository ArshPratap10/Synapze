import React from 'react'
import { motion } from 'framer-motion'

export default function GlassInput({ 
  label, 
  error, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-white/60 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          className={`
            w-full bg-white/5 border rounded-2xl px-4 py-3 text-white
            placeholder:text-white/20 outline-none transition-all duration-300
            focus:bg-white/10 focus:border-white/20
            ${error ? 'border-red-500/50' : 'border-white/10'}
          `}
        />
        <motion.div
          layoutId="input-glow"
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)',
          }}
          whileFocus={{
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.05)',
          }}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500/80 ml-1">
          {error}
        </span>
      )}
    </div>
  )
}
