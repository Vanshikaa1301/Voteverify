/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A192F',
          card: '#112240',
          border: '#1D3557',
          muted: '#8892B0',
        },
        teal: {
          accent: '#2DD4BF',
          dim: '#14B8A6',
        },
        vv: {
          bg: 'var(--vv-bg)',
          surface: 'var(--vv-surface)',
          'surface-muted': 'var(--vv-surface-muted)',
          border: 'var(--vv-border)',
          muted: 'var(--vv-muted)',
          text: 'var(--vv-text)',
          heading: 'var(--vv-heading)',
          accent: 'var(--vv-accent)',
          'accent-dim': 'var(--vv-accent-dim)',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--vv-shadow)',
      },
      keyframes: {
        'vv-float': {
          '0%, 100%': { transform: 'translateZ(40px) translateY(0) rotateX(0deg)' },
          '50%': { transform: 'translateZ(40px) translateY(-14px) rotateX(2deg)' },
        },
        'vv-float-delayed': {
          '0%, 100%': { transform: 'translateZ(12px) rotate(6deg) translateY(0)' },
          '50%': { transform: 'translateZ(12px) rotate(6deg) translateY(-12px)' },
        },
        'vv-drift': {
          '0%, 100%': { transform: 'translateZ(80px) translateX(0)' },
          '50%': { transform: 'translateZ(80px) translateX(12px)' },
        },
        'vv-pulse': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(1.05)' },
        },
        'vv-pulse-slow': {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '0.45' },
        },
        'vv-shine': {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)' },
        },
      },
      animation: {
        'vv-float': 'vv-float 9s ease-in-out infinite',
        'vv-float-delayed': 'vv-float-delayed 11s ease-in-out infinite 1.2s',
        'vv-drift': 'vv-drift 14s ease-in-out infinite',
        'vv-pulse': 'vv-pulse 5s ease-in-out infinite',
        'vv-pulse-slow': 'vv-pulse-slow 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
