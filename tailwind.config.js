/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'll-dark': '#384959',
        'll-blue': '#6A89A7',
        'll-light-blue': '#88BDF2',
        'll-pale-blue': '#BDDDFC',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        accent: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
