import { defineNuxtConfig } from 'nuxt/config';

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

    // 👇 IMPORTANTE: garante que pdf-parse funcione no build Nitro
    externals: {
      inline: ['pdf-parse'],
    },

    // 👇 IMPORTANTE: permite envio de PDF no body sem erro
    routeRules: {
      '/api/import/**': {
        bodyParser: false,
      }
    }
  },

  devtools: { enabled: true },
});
