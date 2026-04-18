'use client'
import { useState, useCallback } from 'react'
import { Inter } from 'next/font/google'
import './globals.css'
import Loader from '@/components/Loader'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const handleFinish = useCallback(() => setIsLoading(false), [])

  return (
    <html lang="en" className="dark">
      <head>
        <title>Project Aura — Neural Habit Suite</title>
        <meta name="description" content="AI-powered habit, nutrition, and activity tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.variable} font-sans bg-[#0a0a0f] text-zinc-200 min-h-screen`}>
        {isLoading && <Loader onFinish={handleFinish} />}
        <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.4s ease' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
