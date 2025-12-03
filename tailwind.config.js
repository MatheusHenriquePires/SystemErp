/** @type {import('tailwindcss').Config} */
module.exports = {
  // ESSA LINHA É CRUCIAL: Diz ao Tailwind para usar a classe 'dark' no <html>
  darkMode: 'class', 
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}