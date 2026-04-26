/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          bg: '#ede4f7',
          card: 'rgba(255,255,255,0.55)',
          purple: '#7c6bc4',
          violet: '#a78bfa',
          lavender: '#c4b5fd',
          pink: '#e9a8fc',
          surface: '#f0eaf8',
          text: '#2d2256',
          muted: '#8b82b0',
        },
      },
      fontFamily: {
        geist: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 2s infinite',
        'spin-slow': 'spin 12s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.3', filter: 'blur(20px)' },
          '50%': { opacity: '0.6', filter: 'blur(30px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fadeUp': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slideIn': {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(124,107,196,0.2)',
        'glow-purple-lg': '0 0 40px rgba(124,107,196,0.15), 0 0 80px rgba(167,139,250,0.1)',
        'soft': '0 4px 24px rgba(124, 107, 196, 0.08)',
        'soft-lg': '0 8px 40px rgba(124, 107, 196, 0.12)',
        'card': '0 4px 24px rgba(124, 107, 196, 0.06), 0 1px 3px rgba(0,0,0,0.04)',
        'card-hover': '0 12px 40px rgba(124, 107, 196, 0.12), 0 4px 12px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
