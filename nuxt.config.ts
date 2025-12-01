import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  // Módulos
  modules: ['@nuxtjs/tailwindcss'],

  // Linha crucial para carregar o Tailwind
  css: ['~/assets/css/main.css'], 

  // Configurações do compilador
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  // Garanta que o target seja node-server (para o deploy)
  nitro: {
    preset: 'node-server'
  },
  
  devtools: { enabled: true },
});