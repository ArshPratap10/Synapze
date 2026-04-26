'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ dark: false, toggle: () => {} })

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false)

  // On mount, read saved preference
  useEffect(() => {
    const saved = localStorage.getItem('aura-theme')
    // Default to dark if no saved preference
    const isDark = saved ? saved === 'dark' : true
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [])

  const toggle = () => {
    setDark(prev => {
      const next = !prev
      localStorage.setItem('aura-theme', next ? 'dark' : 'light')
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
      if (next) document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
