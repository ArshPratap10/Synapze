'use client'
import { useState, useCallback } from 'react'
import Loader from '@/components/Loader'

export default function AppShell({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const handleFinish = useCallback(() => setIsLoading(false), [])

  return (
    <>
      {isLoading && <Loader onFinish={handleFinish} />}
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s ease' }}>
        {children}
      </div>
    </>
  )
}
