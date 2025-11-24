/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-pink': '#FF69B4',
        'primary-blue': '#4A90E2',
        'primary-yellow': '#FFD700',
        'primary-purple': '#9B59B6',
        'success-green': '#2ECC71',
        'warning-orange': '#F39C12',
        'danger-red': '#E74C3C',
        'bg-light': '#F8F9FA',
        'bg-dark': '#2C3E50',
        'text-primary': '#2C3E50',
        'text-secondary': '#7F8C8D',
        'border': '#BDC3C7',
        'stat-high': '#2ECC71',
        'stat-medium': '#F39C12',
        'stat-low': '#E74C3C',
        'stat-bg': '#ECF0F1',
      },
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
        'sans': ['Nunito', 'sans-serif'],
      },
      spacing: {
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '32px',
        'xl': '48px',
      },
      borderRadius: {
        'card': '24px',
        'button': '16px',
        'stat': '12px',
      }
    },
  },
  plugins: [],
}
