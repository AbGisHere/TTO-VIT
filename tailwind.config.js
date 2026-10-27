/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Typefaces used in the Technology Brief sheets
        display: ['"Plus Jakarta Sans"', 'Arial', 'sans-serif'],
        label: ['Montserrat', 'Arial', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // TTO brief palette: indigo (IPR & TT Cell / VIT), aqua banner, institutional green
        navy: { 50: '#f5f5fb', 100: '#e8e7f5', 200: '#c9c7e6', 700: '#3b3598', 800: '#2b2780', 900: '#1d1a5c', 950: '#100e3a' },
        gold: { 100: '#dffbfc', 400: '#5ce1e6', 500: '#33c7cd', 600: '#12909a' },
        aqua: '#5ce1e6',
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        }
      }
    },
  },
  plugins: [],
}
