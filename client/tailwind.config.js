/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#587a9c',
        secondary: '#8f8f8f',
        accent: '#d3322e',
        background: 'whitesmoke',
        confirmation: '#28a745',
        warning: '#ffc107',
        business: '#007bff'
      },
    },
  },
  plugins: [],
}