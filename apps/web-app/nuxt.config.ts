export default defineNuxtConfig({
  modules: [
    'nuxt-auth-utils',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
  ],

  i18n: {
    locales: [
      { code: 'en', language: 'en', file: 'en.json', name: 'English' },
      { code: 'ru', language: 'ru', file: 'ru.json', name: 'Русский' },
    ],
    defaultLocale: 'en',
    langDir: 'locales',
    strategy: 'prefix_except_default',
  },

  fonts: {
    provider: 'google',
    families: [
      {
        name: 'Lora',
        provider: 'google',
      },
      {
        name: 'Noto Sans',
        provider: 'google',
      },
    ],
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
  },

  css: ['~/assets/css/main.css'],

  icon: {
    clientBundle: {
      scan: {
        globInclude: ['app/**/*.{vue,ts}'],
        globExclude: ['node_modules', 'dist', 'build', 'coverage', 'test', 'tests', '.*'],
      },
    },
  },

  app: {
    head: {
      meta: [
        { name: 'description', content: 'Fullstack Developer specializing in Vue, Nuxt, TypeScript, and PostgreSQL' },
      ],
    },
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-01-01',
})
