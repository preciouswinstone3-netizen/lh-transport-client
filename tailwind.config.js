/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#149af7',
          dark: '#0146af',
          navy: '#1b2a65',
          pale: '#e9f3ff',
          white: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27, 42, 101, 0.06), 0 1px 3px rgba(27, 42, 101, 0.08)',
        elevated: '0 4px 12px rgba(27, 42, 101, 0.10), 0 2px 4px rgba(27, 42, 101, 0.06)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out',
        slideUp: 'slideUp 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
