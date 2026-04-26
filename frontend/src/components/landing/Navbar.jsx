'use client'
import React, { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav 
      id="navbar" 
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl liquid-glass px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? 'shadow-2xl border-white/10 bg-white/5' : ''}`}
    >
      <a href="/" className="flex items-center gap-2 no-underline">
        <span className="font-heading text-xl text-white italic">Synapze</span>
      </a>

      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm font-medium text-white/50 hover:text-white transition-colors no-underline">Features</a>
        <a href="#how-it-works" className="text-sm font-medium text-white/50 hover:text-white transition-colors no-underline">How It Works</a>
        <a href="#stats" className="text-sm font-medium text-white/50 hover:text-white transition-colors no-underline">Stats</a>
        <a href="#community" className="text-sm font-medium text-white/50 hover:text-white transition-colors no-underline">Community</a>
      </div>

      <a href="/auth" className="btn-cyan !py-2 !px-5 !text-sm !rounded-full border border-cyan-400/30">
        Try Synapze
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
      </a>
    </nav>
  )
}
