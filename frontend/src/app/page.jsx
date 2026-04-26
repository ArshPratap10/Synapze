'use client'
import React, { useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

import './landing-new.css'
import Navbar from '@/components/landing/Navbar'
import GrainOverlay from '@/components/landing/GrainOverlay'
import HeroSection from '@/components/landing/HeroSection'
import { 
  StatsSection, 
  NeuralScoreSection, 
  AILoggingSection, 
  FeaturesSection, 
  ExplodedUISection, 
  PricingSection, 
  Footer 
} from '@/components/landing/LandingSections'

export default function NewLandingPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if logged in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, isLoaded, router])

  // Pre-loading state
  if (!isLoaded || isSignedIn) {
    return null // AppShell will handle loading state
  }

  return (
    <div className="landing-body selection:bg-cyan-500/30">
      {/* 
        Note: AppShell provides the main Loader. 
        We use the landing-grain-overlay for the specific texture.
      */}
      <GrainOverlay />
      <Navbar />

      <main>
        <HeroSection />
        <StatsSection />
        <NeuralScoreSection />
        <AILoggingSection />
        <FeaturesSection />
        <ExplodedUISection />
        <PricingSection />
      </main>

      <Footer />
    </div>
  )
}
