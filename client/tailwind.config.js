/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1c1b22',
        secondary: 'whitesmoke',
        tertiary: '#ff0000',
        background: '#181a1b'
      },
    },
  },
  plugins: [],
}