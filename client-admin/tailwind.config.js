/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        'primary-dark': 'var(--color-primary-dark)',
        'primary-base': 'var(--color-primary-base)',
        'primary-accent': 'var(--color-primary-accent)',
        'secondary': 'var(--color-secondary)',
        'neutral-light': 'var(--color-neutral-light)',
        'neutral-medium': 'var(--color-neutral-medium)',
        'neutral-dark': 'var(--color-neutral-dark)',
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'error': 'var(--color-error)',
      }
    },
  },
  plugins: [],
}