/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nester brand colors
        'nester-primary': '#2563eb',
        'nester-secondary': '#64748b',
        'nester-accent': '#3b82f6',
        // Dynamic brand colors (will be overridden by CSS variables)
        'brand-primary': 'var(--brand-primary, #2563eb)',
        'brand-secondary': 'var(--brand-secondary, #64748b)',
        'brand-accent': 'var(--brand-accent, #3b82f6)',
      },
      fontFamily: {
        'brand': ['var(--brand-font, Inter)', 'sans-serif'],
        'nester': ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-logo': 'var(--brand-logo, none)',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        nester: {
          'primary': '#2563eb',
          'secondary': '#64748b',
          'accent': '#3b82f6',
          'neutral': '#1f2937',
          'base-100': '#ffffff',
          'info': '#0ea5e9',
          'success': '#22c55e',
          'warning': '#f59e0b',
          'error': '#ef4444',
        },
      },
      'light',
      'dark',
    ],
    base: true,
    styled: true,
    utils: true,
    prefix: '',
    logs: true,
    themeRoot: ':root',
  },
}