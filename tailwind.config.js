/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary Palette ─────────────────────────────────────────────────
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover:   'var(--color-secondary-hover)',
        },
        // ── Surface / Background ─────────────────────────────────────────────
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          elevated: 'var(--color-surface-elevated)',
          border:   'var(--color-surface-border)',
        },
        // ── Text ─────────────────────────────────────────────────────────────
        'text-base': 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        'text-inverted': 'var(--color-text-inverted)',
        // ── Accent ───────────────────────────────────────────────────────────
        accent: {
          cyan:    'var(--color-accent-cyan)',
          violet:  'var(--color-accent-violet)',
          emerald: 'var(--color-accent-emerald)',
          amber:   'var(--color-accent-amber)',
        },
      },
      fontFamily: {
        primary:   ['var(--font-primary)', 'system-ui', 'sans-serif'],
        secondary: ['var(--font-secondary)', 'system-ui', 'sans-serif'],
        mono:      ['var(--font-mono)', 'monospace'],
      },
      transitionTimingFunction: {
        'micro':   'var(--ease-micro)',
        'layout':  'var(--ease-layout)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        micro:  'var(--duration-micro)',
        layout: 'var(--duration-layout)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-mesh':       'var(--gradient-hero-mesh)',
        'glow-primary':    'var(--gradient-glow-primary)',
        'glow-secondary':  'var(--gradient-glow-secondary)',
      },
      animation: {
        'fade-up':       'fadeUp 0.6s var(--ease-layout) forwards',
        'fade-in':       'fadeIn 0.4s var(--ease-micro) forwards',
        'pulse-glow':    'pulseGlow 3s ease-in-out infinite',
        'float':         'float 6s ease-in-out infinite',
        'spin-slow':     'spin 8s linear infinite',
        'border-flow':   'borderFlow 4s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        borderFlow: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-primary':   '0 0 40px -8px var(--color-primary)',
        'glow-secondary': '0 0 40px -8px var(--color-secondary)',
        'glow-cyan':      '0 0 40px -8px var(--color-accent-cyan)',
        'card':           '0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
        'card-hover':     '0 4px 12px rgba(0,0,0,0.4), 0 16px 48px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
