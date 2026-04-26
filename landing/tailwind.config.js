/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Instrument Serif"', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        synapze: {
          black: '#050505',
          dark: '#09090b',
          cyan: '#00f3ff',
          violet: '#8b5cf6',
          violetLight: '#a78bfa',
        },
      },
      boxShadow: {
        glow: '0 0 60px rgba(0,243,255,0.25), 0 0 120px rgba(0,243,255,0.08)',
        'glow-sm': '0 0 20px rgba(0,243,255,0.15)',
        'glow-violet': '0 0 60px rgba(139,92,246,0.25)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
