/** @type {import('tailwindcss').Config} */
export default {
    content: [
    './components/**/*.{vue,js}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        m05green: '#4B633E',      // tumma vihreä
        m05greenLight: '#78885F', // vaaleampi vihreä
        m05brown: '#7B5E35',      // ruskea
        m05beige: '#D7C6A0',      // beige
      },
    },
  },
  plugins: [],
}

