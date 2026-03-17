export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const metrikaId = Number(config.public.metrikaId)

  if (!metrikaId) {
    return
  }

  const router = useRouter()

  useHead({
    script: [{
      src: `https://mc.yandex.ru/metrika/tag.js?id=${metrikaId}`,
      async: true,
    }],
    noscript: [{
      innerHTML: `<div><img src="https://mc.yandex.ru/watch/${metrikaId}" style="position:absolute; left:-9999px;" alt="" /></div>`,
    }],
  })

  window.ym = window.ym || function (...args: unknown[]) {
    (window.ym.a = window.ym.a || []).push(args)
  }
  window.ym.l = Date.now()

  window.ym(metrikaId, 'init', {
    defer: true,
    webvisor: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
  })

  router.afterEach((to) => {
    window.ym(metrikaId, 'hit', to.fullPath)
  })
})

declare global {
  interface Window {
    ym: ((...args: unknown[]) => void) & { a?: unknown[], l?: number }
  }
}
