const METRIKA_ID = 62221951

export default defineNuxtPlugin(() => {
  const router = useRouter()

  useHead({
    script: [{
      src: `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`,
      async: true,
    }],
    noscript: [{
      innerHTML: `<div><img src="https://mc.yandex.ru/watch/${METRIKA_ID}" style="position:absolute; left:-9999px;" alt="" /></div>`,
    }],
  })

  window.ym = window.ym || function (...args: unknown[]) {
    (window.ym.a = window.ym.a || []).push(args)
  }
  window.ym.l = Date.now()

  window.ym(METRIKA_ID, 'init', {
    defer: true,
    webvisor: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
  })

  router.afterEach((to) => {
    window.ym(METRIKA_ID, 'hit', to.fullPath)
  })
})

declare global {
  interface Window {
    ym: ((...args: unknown[]) => void) & { a?: unknown[], l?: number }
  }
}
