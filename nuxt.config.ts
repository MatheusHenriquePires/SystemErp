import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode' 
  ],

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  
  colorMode: {
    classSuffix: ''
  },

  // ✅ CORREÇÃO: Removemos o 'externals' e 'inline'
  // O Nuxt agora vai tratar o pdf-parse como uma dependência externa normal (o jeito certo para libs Node antigas)
  nitro: {
    preset: 'node-server'
  },

  devtools: { enabled: true },
})