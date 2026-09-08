/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wgpt: {
          bg: '#0d0d0d',
          surface: '#141414',
          'surface-alt': '#1a1a1a',
          elevated: '#222222',
          border: '#262626',
          'border-light': '#383838',
          accent: '#2563eb',
          'accent-hover': '#1d4ed8',
          'accent-active': '#1e40af',
          'text-primary': '#ededed',
          'text-secondary': '#8e8e8e',
          'text-muted': '#585858',
          error: '#ef4444',
          'user-bubble': '#222222',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.25s ease-out',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 80%, 100%': { opacity: '0.2', transform: 'scale(0.85)' },
          '40%': { opacity: '0.7', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
