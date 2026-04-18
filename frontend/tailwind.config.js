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
          bg: '#0a0a0f',
          card: 'rgba(0,0,0,0.3)',
          cyan: '#00f3ff',
          purple: '#bf00ff',
          pink: '#ff006e',
        },
      },
      fontFamily: {
        geist: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', filter: 'blur(20px)' },
          '50%': { opacity: '1', filter: 'blur(30px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0,243,255,0.5)',
        'glow-purple': '0 0 15px rgba(191,0,255,0.5)',
        'glow-cyan-lg': '0 0 30px rgba(0,243,255,0.3), 0 0 60px rgba(0,243,255,0.1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
