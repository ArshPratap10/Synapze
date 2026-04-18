'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Check, Sparkles, Target, Zap, Heart, Trophy } from 'lucide-react'

const STEPS = [
  { 
    id: 1, 
    title: 'What is your main goal?', 
    options: ['Build Muscle', 'Weight Loss', 'Flexibility', 'Endurance'], 
    type: 'selection', 
    icon: <Target color="#FF8A8A" size={32} /> 
  },
  { 
    id: 2, 
    title: 'Experience Level', 
    options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], 
    type: 'selection', 
    icon: <Zap color="#C2C2FF" size={32} /> 
  },
  { 
    id: 3, 
    title: 'Workout Frequency', 
    options: ['1-2 days', '3-4 days', '5-6 days', 'Daily'], 
    type: 'selection', 
    icon: <Heart color="#FFA8D3" size={32} /> 
  },
  { 
    id: 4, 
    title: 'Daily Commitment', 
    options: ['15 min', '30 min', '45 min', '60+ min'], 
    type: 'selection', 
    icon: <Zap color="#A8FFF3" size={32} /> 
  },
  { 
    id: 5, 
    title: 'Focus Areas', 
    options: ['Upper Body', 'Lower Body', 'Core', 'Full Body'], 
    type: 'selection', 
    icon: <Target color="#FFD3A8" size={32} /> 
  },
  { 
    id: 6, 
    title: 'Current Habits', 
    options: ['Clean Diet', 'Good Sleep', 'Active Lifestyle', 'Regular Gym'], 
    type: 'multi', 
    icon: <Check color="#A8FFA8" size={32} /> 
  },
  { 
    id: 7, 
    title: 'Target Weight', 
    placeholder: 'Enter target (e.g. 75kg)', 
    type: 'input', 
    icon: <Target color="#99DFFF" size={32} /> 
  },
  { 
    id: 8, 
    title: 'Everything Set!', 
    description: 'Your personalized Habitly profile is ready. Let\'s start building your future self.', 
    type: 'final', 
    icon: <Trophy color="#FBBF24" size={32} /> 
  }
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState({})
  const router = useRouter()

  const handleSelect = (val) => {
    setSelections({ ...selections, [currentStep]: val })
    if (STEPS[currentStep].type !== 'multi' && currentStep < STEPS.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 400)
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push('/dashboard')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const step = STEPS[currentStep]
  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <main className="min-h-screen flex flex-col px-8 py-12 pb-32" style={{ backgroundColor: '#061122', color: '#fff', overflowX: 'hidden' }}>
      {/* Background Decor */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Header with Progress - Constrained width on desktop */}
      <header className="desktop-container" style={{ position: 'relative', zIndex: 1, marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
           <button 
             onClick={handleBack} 
             className="flex items-center justify-center transition-all"
             style={{ 
               width: '56px', 
               height: '56px', 
               borderRadius: '50%', 
               backgroundColor: 'rgba(255,255,255,0.03)',
               border: '1px solid rgba(255,255,255,0.05)',
               color: '#fff',
               opacity: currentStep === 0 ? 0 : 1, 
               pointerEvents: currentStep === 0 ? 'none' : 'auto', 
               cursor: 'pointer' 
             }}
           >
             <ChevronLeft size={24} />
           </button>
           
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <span style={{ 
               fontSize: '11px', 
               fontWeight: '900', 
               textTransform: 'uppercase', 
               letterSpacing: '0.2em', 
               color: 'rgba(255,255,255,0.2)',
               marginBottom: '8px'
             }}>
               Step {currentStep + 1} of {STEPS.length}
             </span>
             <div style={{ width: '120px', height: '6px', borderRadius: '99px', backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', damping: 20 }}
                  style={{ height: '100%', backgroundColor: '#7C3AED', boxShadow: '0 0 15px rgba(124,58,237,0.5)' }}
                />
             </div>
           </div>

           {/* Keep space consistent */}
           <div style={{ width: '56px' }} /> 
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <div style={{ 
                width: '96px', 
                height: '96px', 
                borderRadius: '35%', 
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
              }}>
                 {step.icon}
              </div>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: '900', 
                letterSpacing: '-0.02em', 
                lineHeight: '1.1',
                marginBottom: '16px'
              }}>{step.title}</h1>
              {step.description && (
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  color: 'rgba(255,255,255,0.3)', 
                  lineHeight: '1.5',
                  padding: '0 10%'
                }}>{step.description}</p>
              )}
            </div>

            {/* Content options grid */}
            <div className={`flex flex-col gap-4 w-full ${step.type === 'selection' || step.type === 'multi' ? 'desktop-grid-2' : ''}`}>
              {step.type === 'selection' && step.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className="transition-all"
                  style={{ 
                    padding: '24px 32px',
                    fontSize: '19px',
                    fontWeight: '800',
                    textAlign: 'left',
                    borderRadius: '32px',
                    backgroundColor: selections[currentStep] === opt ? '#7C3AED' : 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: selections[currentStep] === opt ? '#7C3AED' : 'rgba(255,255,255,0.05)',
                    color: '#fff',
                    cursor: 'pointer',
                    boxShadow: selections[currentStep] === opt ? '0 15px 30px rgba(124,58,237,0.3)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {opt}
                  {selections[currentStep] === opt && <Check size={24} strokeWidth={4} />}
                </button>
              ))}

              {step.type === 'multi' && step.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    const current = selections[currentStep] || []
                    const next = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt]
                    setSelections({ ...selections, [currentStep]: next })
                  }}
                  className="transition-all"
                  style={{ 
                    padding: '24px 32px',
                    fontSize: '19px',
                    fontWeight: '800',
                    textAlign: 'left',
                    borderRadius: '32px',
                    backgroundColor: (selections[currentStep] || []).includes(opt) ? 'rgba(124, 58, 237, 0.1)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: (selections[currentStep] || []).includes(opt) ? '#7C3AED' : 'rgba(255,255,255,0.05)',
                    color: (selections[currentStep] || []).includes(opt) ? '#fff' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{opt}</span>
                  {(selections[currentStep] || []).includes(opt) && <Check size={24} color="#7C3AED" strokeWidth={4} />}
                </button>
              ))}

              {step.type === 'input' && (
                <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '32px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder={step.placeholder}
                      style={{ 
                        width: '100%',
                        padding: '28px 40px',
                        fontSize: '22px',
                        fontWeight: '800',
                        textAlign: 'center',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '32px',
                        color: '#fff',
                        outline: 'none',
                        boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)'
                      }}
                      onChange={(e) => setSelections({ ...selections, [currentStep]: e.target.value })}
                    />
                  </div>
                  <button 
                    onClick={handleNext} 
                    className="btn-primary"
                    style={{ 
                      padding: '28px',
                      fontSize: '22px',
                      fontWeight: '900',
                      borderRadius: '32px',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: '#7C3AED',
                      color: '#fff',
                      boxShadow: '0 20px 40px rgba(124,58,237,0.3)'
                    }}
                  >
                    Continue
                  </button>
                </div>
              )}

              {step.type === 'final' && (
                <div style={{ 
                  padding: '48px 40px',
                  borderRadius: '48px',
                  background: 'linear-gradient(145deg, rgba(124,58,237,0.9), rgba(91,33,182,0.9))',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  maxWidth: '500px',
                  margin: '0 auto',
                  width: '100%'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '100px',
                    height: '100px',
                    background: 'rgba(255,255,255,0.1)',
                    filter: 'blur(30px)',
                    borderRadius: '50%'
                  }} />
                  <p style={{ 
                    fontSize: '20px',
                    fontWeight: '700',
                    textAlign: 'center',
                    lineHeight: '1.6',
                    color: '#fff'
                  }}>Amazing! We&apos;ve built your roadmap. <br/>Time to start your daily journey.</p>
                  
                  <button 
                    onClick={handleNext} 
                    className="transition-all"
                    style={{ 
                      padding: '24px',
                      fontSize: '22px',
                      fontWeight: '900',
                      borderRadius: '28px',
                      backgroundColor: '#fff',
                      color: '#000',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }}
                  >
                    Explore Dashboard
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Action Navigation - Multiple Options */}
      {step.type === 'multi' && (
        <div style={{
          position: 'fixed',
          bottom: '48px',
          left: 0,
          right: 0,
          padding: '0 32px',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <button 
            onClick={handleNext} 
            className="btn-primary"
            style={{ 
              width: '100%',
              maxWidth: '380px',
              padding: '28px',
              fontSize: '24px',
              fontWeight: '900',
              borderRadius: '35px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: '#7C3AED',
              color: '#fff',
              boxShadow: '0 25px 50px rgba(124,58,237,0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            Next Step
          </button>
        </div>
      )}
    </main>
  )
}
