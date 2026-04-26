'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthenticateWithRedirectCallback, useAuth } from '@clerk/nextjs'
import { Loader2, ArrowRight } from 'lucide-react'

export default function SSOCallback() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard')
    }
  }, [isLoaded, isSignedIn, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: '#0e0a1a' }}>
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full blur-2xl opacity-20 bg-[#7c6bc4] animate-pulse" />
        <Loader2 className="animate-spin text-[#7c6bc4] relative z-10" size={40} />
      </div>
      
      <h2 className="text-xl font-bold text-white mb-2">Securing your session</h2>
      <p className="text-[#9b94c4] text-sm max-w-xs leading-relaxed mb-8">
        We're finalizing your secure connection. You'll be redirected to your neural suite in a moment.
      </p>

      {/* Manual fallback in case Clerk's component hangs */}
      {isLoaded && isSignedIn && (
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#7c6bc4] text-white font-bold text-sm cursor-pointer hover:bg-[#6b5bb4] transition-all"
        >
          Enter Dashboard <ArrowRight size={16} />
        </button>
      )}

      <div className="hidden">
        <AuthenticateWithRedirectCallback 
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/onboarding"
        />
      </div>
    </div>
  )
}
