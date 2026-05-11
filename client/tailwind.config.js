/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cinema: {
          bg:      'rgb(var(--color-bg) / <alpha-value>)',
          surface: 'rgb(var(--color-surface) / <alpha-value>)',
          card:    'rgb(var(--color-card) / <alpha-value>)',
          border:  'rgb(var(--color-border) / <alpha-value>)',
          accent:  'rgb(var(--color-accent) / <alpha-value>)',
          gold:    'rgb(var(--color-gold) / <alpha-value>)',
          muted:   'rgb(var(--color-muted) / <alpha-value>)',
          text:    'rgb(var(--color-text) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to right, rgb(var(--color-bg)) 30%, transparent 100%)',
        'card-gradient': 'linear-gradient(to top, rgb(var(--color-bg)) 0%, transparent 100%)',
        'shimmer': 'linear-gradient(90deg, rgb(var(--color-card)) 25%, rgb(var(--color-border)) 50%, rgb(var(--color-card)) 75%)',
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'shimmer':    'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'card':   '0 4px 24px rgba(0,0,0,0.5)',
        'glow':   '0 0 20px rgba(232,160,69,0.25)',
        'glow-lg':'0 0 40px rgba(232,160,69,0.15)',
      },
    },
  },
  plugins: [],
};
