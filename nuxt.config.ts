// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@netlify/nuxt"],
  css: ["@/assets/css/main.css"],
  ssr: false, // jos puhdas SPA, tai
  nitro: {
    preset: "netlify",
  },

  // Tärkeä lisäys ympäristömuuttujien käsittelyyn.
  // 'public'-osio on saatavilla sekä asiakas- että palvelinpuolella.
  runtimeConfig: {
    public: {
      firebaseApiKey: process.env.NUXT_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId:
        process.env.NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.NUXT_PUBLIC_FIREBASE_APP_ID,
      // Tässä on uusi rivi, joka lukee salaisen avaimen .env-tiedostosta
      secretKey: process.env.NUXT_PUBLIC_SECRET_KEY,
    },
  },
});