/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#0A0A23',
          base: '#1E3A8A', 
          accent: '#007BFF'
        },
        secondary: '#00C6FF',
        neutral: {
          light: '#F5F7FA',
          medium: '#6B7280',
          dark: '#1F2937'
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #0A0A23 0%, #1E3A8A 50%, #007BFF 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #1E3A8A 0%, #007BFF 100%)'
      }
    },
  },
  plugins: [],
}
