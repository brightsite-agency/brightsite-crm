/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brightsite: {
          blue: '#0066FF',
          dark: '#050505',
          gray: '#F5F5F5',
        }
      }
    },
  },
  plugins: [],
}
