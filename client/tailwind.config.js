/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ann: {
          brand: '#D9531E',
          brandHover: '#BA4314',
          dark: '#1C1917',
          forest: '#1B4D3E',
          sand: '#FAF6EE',
          card: '#FFFFFF',
          urgent: '#DC2626',
          moderate: '#EA580C',
          safe: '#16A34A',
        }
      }
    },
  },
  plugins: [],
}