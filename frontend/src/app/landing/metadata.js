// SEO metadata for /landing — exported from a separate server component wrapper
// Next.js App Router: metadata must be in a non-'use client' file

import { Metadata } from 'next'

export const metadata = {
  title: 'Synapze — AI-Powered Nutrition & Habit Tracker',
  description: 'Track meals with AI Vision, build streaks, and decode your daily performance with the Neural Score. Free forever. Powered by Gemini 2.5 Flash.',
  keywords: ['AI nutrition tracker', 'habit tracker', 'food logging app', 'neural score', 'health AI', 'calorie tracker', 'macro tracker', 'gemini AI health'],
  openGraph: {
    title: 'Synapze — Your Health, Decoded by AI',
    description: 'Snap a photo of your meal. Log a workout. Get your Neural Score. Free forever.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Synapze',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synapze — AI Health Tracker',
    description: 'AI Vision food logging + Neural Score + Habit Engine. Free forever.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://projectaura.app/landing',
  },
}
