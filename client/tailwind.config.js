/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        main: 'var(--main-color)',
        text: 'var(--second-color)',
        lightGreen: 'var(--light-green)',
        gray: 'var(--gray)'
      }
    }
  },
  plugins: [],
}
