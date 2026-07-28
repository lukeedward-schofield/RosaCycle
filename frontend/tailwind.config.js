/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefbf2',
          100: '#d6f5e0',
          500: '#22a559',
          600: '#1fa34c',
          700: '#188040',
        },
      },
    },
  },
  plugins: [],
}

