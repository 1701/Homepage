/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'retro-header': ['"Press Start 2P"', 'cursive'],
        'retro-body': ['"VT323"', 'monospace'],
      },
    },
  },
  plugins: [],
}

