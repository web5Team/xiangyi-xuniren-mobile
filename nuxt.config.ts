import { appDescription, appKeywords } from './constants/index'

export default defineNuxtConfig({
  modules: [
    '@element-plus/nuxt',
    '@vueuse/nuxt',
    '@unocss/nuxt',
    // '@pinia/nuxt',
    // '@nuxtjs/color-mode',
    // '@vite-pwa/nuxt',
    '@nuxt/eslint',
    'v-wave/nuxt',
    'nuxt-lodash',
    // 'nuxt-echarts',
    // '@sentry/nuxt/module',
    ['vite-plugin-version-date-mark/nuxt', {
      name: 'THISAI',
      ifShortSHA: true,
      ifMeta: true,
      ifLog: true,
      ifGlobal: true,
    }],
    '@nuxtjs/device',
  ],

  vWave: {
    color: 'currentColor',
    initialOpacity: '0.5',
    easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
  },

  elementPlus: {

  },

  experimental: {
    // when using generate, payload js assets included in sw precache manifest
    // but missing on offline, disabling extraction it until fixed
    payloadExtraction: false,
    renderJsonPayloads: true,
    typedPages: true,
  },

  css: [
    '@unocss/reset/tailwind.css',
  ],

  colorMode: {
    classSuffix: '',
  },

  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    prerender: {
      crawlLinks: false,
      routes: ['/'],
      ignore: ['/hi'],
    },
  },

  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: appDescription },
        { name: 'keywords', content: appKeywords },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: 'white' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#222222' },
      ],
    },
  },

  devtools: {
    enabled: true,
  },

  features: {
    // For UnoCSS
    inlineStyles: false,
  },

  eslint: {
    config: {
      standalone: false,
    },
  },

  sourcemap: {
    server: true,
    client: 'hidden',
  },

  build: {
    transpile: [
      /^@antv/,
      'gl-matrix',
    ],
  },
})
