/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1A73E8',
        secondary: '#D32F2F',
        accent: '#FBC02D',
        background: '#212121',
        confirmation: '#28a745',
        warning: '#ffc107',
        business: '#007bff'
      },
    },
  },
  plugins: [],
}