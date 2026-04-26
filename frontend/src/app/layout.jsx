import { Plus_Jakarta_Sans, Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/lib/ThemeContext'
import AppShell from '@/components/AppShell'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['300','400','500','600','700','800'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300','400','500','600','700','800','900'],
  display: 'swap',
})

export const metadata = {
  title: 'Synapze — AI-Powered Nutrition & Habit Tracker',
  description: 'Track meals with AI Vision, build habit streaks, and get your Neural Score. Free AI-powered health tracker. Your Neural OS for the body.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark" className="dark" suppressHydrationWarning>
      <head>
        <meta name="keywords" content="AI nutrition tracker, habit tracker app, food logging AI, neural score, health AI, calorie tracker, macro tracker, synapze" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#7c6bc4" />
        <meta property="og:title" content="Synapze — Your Neural OS for the Body" />
        <meta property="og:description" content="Snap your meal. Log workouts. Get your Neural Score. Free forever." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Synapze" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Synapze — AI Health Tracker" />
        <meta name="twitter:description" content="AI Vision food logging + Neural Score + Habit Engine. Free." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://synapze.app" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Synapze",
          "applicationCategory": "HealthApplication",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "description": "AI-powered nutrition, habit, and health tracking app. Your Neural OS for the body.",
          "operatingSystem": "Web"
        })}} />
      </head>

      <body className={`${jakarta.variable} ${inter.variable} font-sans min-h-screen grain-overlay`}>
        <ClerkProvider>
          <ThemeProvider>
            <AppShell>
              {children}
            </AppShell>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
