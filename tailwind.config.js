/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      colors: {
        carbon: {
          950: '#0a0a0b',
          900: '#111113',
          800: '#1a1a1e',
          700: '#242429',
          600: '#2e2e35',
          500: '#3d3d47',
        },
        volt: {
          DEFAULT: '#c8f135',
          dark: '#a8cc1a',
          light: '#d9f76a',
        },
        silver: {
          DEFAULT: '#e8eaed',
          muted: '#9aa0aa',
          dark: '#6b7280',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-volt': 'pulseVolt 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseVolt: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200,241,53,0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(200,241,53,0)' },
        }
      }
    },
  },
  plugins: [],
}
