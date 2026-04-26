'use client'
import React, { useEffect, useState } from 'react'

export default function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className={`page-loader ${!visible ? 'fade-out' : ''}`}>
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 animate-spin"></div>
      </div>
    </div>
  )
}
