/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'manrope': ['Manrope', 'sans-serif'],
        'source-serif': ['Source Serif 4', 'serif'],
        'pt-serif': ['PT Serif', 'serif'],
        'sofadi': ['Sofadi One', 'cursive'],
      },
    },
  },
  plugins: [],
}

