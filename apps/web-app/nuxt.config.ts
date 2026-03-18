export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-live-cursors',
  ],

  liveCursors: {
    stripLocalePrefixes: ['en'],
  },

  runtimeConfig: {
    public: {
      metrikaId: '',
    },
  },

  site: {
    url: 'https://kosarev.space',
  },

  sitemap: {
    sources: ['/__sitemap'],
  },

  i18n: {
    locales: [
      { code: 'en', language: 'en', file: 'en.json', name: 'English' },
      { code: 'ru', language: 'ru', file: 'ru.json', name: 'Русский' },
    ],
    defaultLocale: 'ru',
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
      includeCustomCollections: true,
    },
    serverBundle: 'local',
  },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
        'Content-Security-Policy': 'default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://mc.yandex.ru https://mc.yandex.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' https://fonts.gstatic.com; img-src \'self\' https://mc.yandex.ru https://mc.yandex.com data:; connect-src \'self\' https://mc.yandex.ru https://mc.yandex.com wss: ws:',
      },
    },
  },

  devtools: { enabled: true },
  compatibilityDate: '2025-01-01',
})
