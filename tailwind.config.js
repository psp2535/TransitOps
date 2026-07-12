/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/landing/**/*.{ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        void: '#030712',
        midnight: '#0a0f1e',
        abyss: '#111827',
        electric: '#00d4ff',
        neon: '#3b82f6',
        royal: '#8b5cf6',
        'cyan-glow': '#22d3ee',
        'soft-white': '#f0f4ff',
      },
      fontFamily: {
        heading: ['Outfit', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'slide-up': 'slide-up 0.8s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)' },
          '50%': { opacity: '1', boxShadow: '0 0 40px rgba(0, 212, 255, 0.4)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'aurora': 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15), rgba(59,130,246,0.1))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
      },
    },
  },
  plugins: [],
}
