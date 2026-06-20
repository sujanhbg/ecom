// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Demo Store — Shop Online',
      meta: [
        { name: 'description', content: 'Shop electronics, fashion, home & more at the best prices.' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/icon_32.png' },
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/icons/icon_64.png' },
        { rel: 'icon', type: 'image/png', sizes: '128x128', href: '/icons/icon_128.png' },
        { rel: 'icon', type: 'image/png', sizes: '256x256', href: '/icons/icon_256.png' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5000/api',
      imageBase: process.env.NUXT_PUBLIC_IMAGE_BASE || 'http://localhost:5000'
    }
  }
})

