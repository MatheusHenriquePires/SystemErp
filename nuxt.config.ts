import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  nitro: {
    preset: 'node-server',
    externals: {
      inline: [
        'pdf-parse',
        'pdfjs-dist',
        'pdfjs-dist/build/pdf.js',
        'pdfjs-dist/build/pdf.worker.js',
        'pdfjs-dist/legacy/build/pdf.js'
      ]
    }
  },

  devtools: { enabled: true },
})
