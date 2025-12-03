import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    // NOVO: Módulo para gerenciar o Dark Mode
    '@nuxtjs/color-mode' 
  ],

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  
  // Configuração do Módulo de Cores
  colorMode: {
    classSuffix: '' // Isso garante que o Nuxt use apenas a classe 'dark'
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